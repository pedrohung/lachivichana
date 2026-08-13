import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { useApp } from "@/components/app/contexto";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { LISTA_MODALIDADES } from "@/components/mercadito/modalidades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIAS_MERCADITO } from "@/datos/demo/mercadito";
import type { Articulo, ModoArticulo } from "@/datos/tipos";
import { agregarAnuncio } from "@/estado/mercadito";

export const Route = createFileRoute("/mercadito/publicar")({
  head: () => ({
    meta: [
      { title: "Publicar en El Mercadito — La Chivichana" },
      {
        name: "description",
        content:
          "Publica una venta, una donación, un intercambio o un servicio en El Mercadito de La Chivichana.",
      },
      { property: "og:title", content: "Publicar en El Mercadito" },
      { property: "og:description", content: "Comparte lo que ofreces con la comunidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicarMercaditoPage,
});

const PATRONES = [/\+?\d[\d\s.-]{7,}/, /calle\s+\w+/i, /\bapto?\.?\s*\d+/i, /@[\w.-]+\.\w+/];

function PublicarMercaditoPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Publicar en El Mercadito">
        <FormularioPublicar />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function FormularioPublicar() {
  const navegar = useNavigate();
  const { identidad } = useApp();
  const [modo, setModo] = useState<ModoArticulo>("venta");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_MERCADITO[0]!);
  const [zona, setZona] = useState("");
  const [precio, setPrecio] = useState("");

  const riesgo = PATRONES.some((p) => p.test(descripcion));

  const publicar = () => {
    const nuevo: Articulo = {
      id: `local-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      modo,
      ...(precio ? { precio: Number(precio), moneda: "CUP" as const } : {}),
      estado: modo === "servicio" ? "no-aplica" : "usado",
      zona: zona.trim() || "La Habana",
      pais: "Cuba",
      publicado: "ahora mismo",
      imagenAlt: titulo.trim(),
      estadoAnuncio: "activo",
      vistas: 0,
      vendedor: {
        alias: identidad.clave,
        nombreVisible: identidad.nombreVisible,
        avatar: identidad.avatar,
        verificado: true,
        reputacion: 5,
        valoraciones: 0,
        desde: "hoy",
        tipo: identidad.tipo,
      },
      entrega: "Se coordina por mensaje en un punto público",
      interesados: 0,
    };
    agregarAnuncio(nuevo);
    toast.success("Publicamos tu anuncio en la demostración");
    void navegar({ to: "/producto/$id", params: { id: nuevo.id } });
  };

  const listo = titulo.trim().length > 4 && descripcion.trim().length > 15;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="texto-display text-2xl font-bold text-primary">Publicar en El Mercadito</h1>
        <p className="text-sm text-muted-foreground">
          Publicas como <strong className="text-foreground">{identidad.nombreVisible}</strong>.
        </p>
      </header>

      <fieldset className="rounded-2xl border border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Modalidad</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {LISTA_MODALIDADES.map((m) => {
            const Icono = m.icono;
            return (
              <button
                key={m.clave}
                type="button"
                aria-pressed={modo === m.clave}
                onClick={() => setModo(m.clave as ModoArticulo)}
                className={`flex items-start gap-2 rounded-xl border p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  modo === m.clave ? "border-primary bg-secondary" : "border-border"
                }`}
              >
                <Icono aria-hidden="true" className="mt-0.5 h-4 w-4 text-turquesa" />
                <span>
                  <span className="block font-semibold text-foreground">{m.texto}</span>
                  <span className="block text-xs text-muted-foreground">{m.accion}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-titulo">Título</Label>
          <Input id="p-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-desc">Descripción</Label>
          <Textarea
            id="p-desc"
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          {riesgo && (
            <p className="flex items-start gap-2 rounded-xl border border-rojo/40 bg-rojo/10 p-3 text-xs text-foreground">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rojo" />
              Parece que escribiste un teléfono, correo o dirección. Es más seguro dejarlo fuera y
              hablarlo por mensajes.
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-cat">Categoría</Label>
            <select
              id="p-cat"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIAS_MERCADITO.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-zona">Zona general</Label>
            <Input id="p-zona" value={zona} onChange={(e) => setZona(e.target.value)} />
          </div>
          {modo !== "donacion" && (
            <div className="space-y-1.5">
              <Label htmlFor="p-precio">Precio (CUP)</Label>
              <Input
                id="p-precio"
                type="number"
                min={0}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
          )}
        </div>
        <Button variant="sol" disabled={!listo} onClick={publicar}>
          Publicar anuncio
        </Button>
      </div>
    </div>
  );
}
