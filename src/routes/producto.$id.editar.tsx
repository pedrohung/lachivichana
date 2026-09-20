import { useEffect, useState } from "react";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import { MarcoApp } from "@/components/app/MarcoApp";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { FormularioArticulo } from "@/components/mercadito/FormularioArticulo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { actualizarArticulo, obtenerArticuloPorId, type DatosArticulo } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { useSesion } from "@/estado/sesion";

export const Route = createFileRoute("/producto/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar anuncio — El Mercadito" },
      {
        name: "description",
        content: "Edita tu anuncio de El Mercadito: título, descripción, precio, fotos y entrega.",
      },
      { property: "og:title", content: "Editar anuncio — El Mercadito" },
      { property: "og:description", content: "Actualiza tu anuncio en La Chivichana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditarProductoPage,
});

function EditarProductoPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Editar anuncio">
        <CargarArticulo />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function CargarArticulo() {
  const { id } = Route.useParams();
  const navegar = useNavigate();
  const { usuario } = useSesion();
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    let vivo = true;
    void obtenerArticuloPorId(id)
      .then((a) => {
        if (!vivo) return;
        setArticulo(a);
        setEstado("listo");
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setMensajeError(e instanceof Error ? e.message : "No se pudo cargar el anuncio");
        setEstado("error");
      });
    return () => {
      vivo = false;
    };
  }, [id]);

  if (estado === "cargando")
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );

  if (estado === "error")
    return (
      <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
        {mensajeError}
      </p>
    );

  if (!articulo) throw notFound();

  if (!usuario || usuario.username !== articulo.vendedor.alias) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="texto-display text-lg font-bold text-primary">
          Solo quien publicó el anuncio puede editarlo
        </p>
        <Button asChild variant="contorno" size="sm" className="mt-3">
          <Link to="/producto/$id" params={{ id }}>
            Volver al anuncio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="texto-display text-2xl font-bold text-primary">Editar anuncio</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información de tu publicación.</p>
      </header>
      <FormularioArticulo
        textoBoton="Guardar cambios"
        conFotos={false}
        inicial={{
          titulo: articulo.titulo,
          descripcion: articulo.descripcion,
          categoria: articulo.categoria,
          modo: articulo.modo,
          estado: articulo.estado,
          zona: articulo.zona,
          pais: articulo.pais,
          entrega: articulo.entrega,
          ...(articulo.precio !== undefined ? { precio: articulo.precio } : {}),
          ...(articulo.moneda ? { moneda: articulo.moneda } : {}),
          ...(articulo.imagenes ? { imagenes: articulo.imagenes } : {}),
        }}
        alEnviar={async (datos: DatosArticulo) => {
          await actualizarArticulo(id, datos);
          setArticulo({ ...articulo, ...datos });
          void navegar({ to: "/producto/$id", params: { id } });
        }}
      />
    </div>
  );
}
