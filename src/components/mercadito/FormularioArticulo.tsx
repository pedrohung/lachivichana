import { useRef, useState } from "react";
import { ImagePlus, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIAS_MERCADITO,
  ESTADOS_ARTICULO,
  PAISES_MERCADITO,
  type DatosArticulo,
} from "@/datos/servicios";
import type { Articulo, ModoArticulo } from "@/datos/tipos";
import { LISTA_MODALIDADES } from "./modalidades";

const PATRONES_RIESGO = [/\+?\d[\d\s.-]{7,}/, /calle\s+\w+/i, /\bapto?\.?\s*\d+/i, /@[\w.-]+\.\w+/];

const MONEDAS = ["CUP", "USD", "EUR"] as const;

export type ValoresIniciales = Partial<DatosArticulo> & {
  imagenes?: { url: string; alt: string }[];
};

export function FormularioArticulo({
  inicial,
  conFotos = true,
  textoBoton,
  enviando: enviandoExterno = false,
  alEnviar,
}: {
  inicial?: ValoresIniciales;
  /** Mostrar el campo de subida de fotos (no disponible al editar: la API no acepta cambios de fotos). */
  conFotos?: boolean;
  textoBoton: string;
  enviando?: boolean;
  alEnviar: (datos: DatosArticulo, fotos: File[]) => Promise<void>;
}) {
  const [modo, setModo] = useState<ModoArticulo>(inicial?.modo ?? "venta");
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [categoria, setCategoria] = useState(inicial?.categoria ?? CATEGORIAS_MERCADITO[0]!);
  const [estado, setEstado] = useState<Articulo["estado"]>(
    inicial?.estado ?? (inicial?.modo === "servicio" ? "no-aplica" : "usado"),
  );
  const [zona, setZona] = useState(inicial?.zona ?? "");
  const [pais, setPais] = useState(inicial?.pais ?? "Cuba");
  const [precio, setPrecio] = useState(inicial?.precio !== undefined ? String(inicial.precio) : "");
  const [moneda, setMoneda] = useState<"CUP" | "USD" | "EUR">(inicial?.moneda ?? "CUP");
  const [entrega, setEntrega] = useState(inicial?.entrega ?? "");
  const [fotos, setFotos] = useState<File[]>([]);
  const [vistas, setVistas] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const inputFotos = useRef<HTMLInputElement>(null);

  const riesgo = PATRONES_RIESGO.some((p) => p.test(descripcion));
  const esDonacion = modo === "donacion";
  const ocupado = enviando || enviandoExterno;

  const agregarFotos = (archivos: FileList | null) => {
    if (!archivos) return;
    const nuevas = Array.from(archivos).filter((f) => f.type.startsWith("image/"));
    if (nuevas.length === 0) return;
    const limite = nuevas.slice(0, 8 - fotos.length);
    setFotos((prev) => [...prev, ...limite]);
    setVistas((prev) => [...prev, ...limite.map((f) => URL.createObjectURL(f))]);
  };

  const quitarFoto = (indice: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== indice));
    setVistas((prev) => {
      const url = prev[indice];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== indice);
    });
  };

  const listo =
    titulo.trim().length > 4 &&
    descripcion.trim().length > 15 &&
    zona.trim().length > 1 &&
    (esDonacion || precio.trim() === "" || Number(precio) >= 0);

  const enviar = async () => {
    if (!listo || ocupado) return;
    setEnviando(true);
    setError("");
    const datos: DatosArticulo = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      modo,
      estado,
      zona: zona.trim(),
      pais,
      ...(esDonacion || precio.trim() === "" ? {} : { precio: Number(precio), moneda }),
      ...(entrega.trim() ? { entrega: entrega.trim() } : {}),
    };
    try {
      await alEnviar(datos, fotos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el anuncio");
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
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
                onClick={() => {
                  setModo(m.clave as ModoArticulo);
                  if (m.clave === "servicio") setEstado("no-aplica");
                }}
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
          <Label htmlFor="f-titulo">Título</Label>
          <Input
            id="f-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej.: Bicicleta de montaña rodada 26"
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-desc">Descripción</Label>
          <Textarea
            id="f-desc"
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuenta qué ofreces, en qué estado está y cómo se coordina la entrega."
          />
          {riesgo && (
            <p className="flex items-start gap-2 rounded-xl border border-rojo/40 bg-rojo/10 p-3 text-xs text-foreground">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rojo" />
              Parece que escribiste un teléfono, correo o dirección. Es más seguro dejarlo fuera y
              hablarlo por mensajes.
            </p>
          )}
        </div>

        {conFotos && (
          <div className="space-y-1.5">
            <Label>Fotos (máximo 8)</Label>
            <input
              ref={inputFotos}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                agregarFotos(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              {vistas.map((url, i) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Foto ${i + 1} del anuncio`}
                    className="h-20 w-20 rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => quitarFoto(i)}
                    aria-label={`Quitar foto ${i + 1}`}
                    className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-foreground shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {fotos.length < 8 && (
                <button
                  type="button"
                  onClick={() => inputFotos.current?.click()}
                  className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-border text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus aria-hidden="true" className="h-5 w-5" />
                    Añadir
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {!conFotos && inicial?.imagenes && inicial.imagenes.length > 0 && (
          <div className="space-y-1.5">
            <Label>Fotos actuales</Label>
            <div className="flex flex-wrap gap-2">
              {inicial.imagenes.map((img, i) => (
                <img
                  key={img.url}
                  src={img.url}
                  alt={img.alt || `Foto ${i + 1}`}
                  className="h-20 w-20 rounded-xl border border-border object-cover"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Las fotos no se pueden cambiar al editar: habría que retirar el anuncio y publicar uno
              nuevo.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="f-cat">Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="f-cat" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_MERCADITO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-estado-art">Estado del artículo</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as Articulo["estado"])}>
              <SelectTrigger id="f-estado-art" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_ARTICULO.map((e) => (
                  <SelectItem key={e.valor} value={e.valor}>
                    {e.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!esDonacion && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="f-precio">Precio (opcional)</Label>
                <Input
                  id="f-precio"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Consultar"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-moneda">Moneda</Label>
                <Select
                  value={moneda}
                  onValueChange={(v) => setMoneda(v as (typeof MONEDAS)[number])}
                >
                  <SelectTrigger id="f-moneda" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="f-zona">Zona general</Label>
            <Input
              id="f-zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej.: Vedado, La Habana"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-pais">País</Label>
            <Select value={pais} onValueChange={setPais}>
              <SelectTrigger id="f-pais" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAISES_MERCADITO.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-entrega">Entrega (opcional)</Label>
          <Textarea
            id="f-entrega"
            rows={2}
            value={entrega}
            onChange={(e) => setEntrega(e.target.value)}
            placeholder="Ej.: Se coordina por mensaje en un punto público."
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-rojo">
            {error}
          </p>
        )}

        <Button variant="sol" disabled={!listo || ocupado} onClick={() => void enviar()}>
          {ocupado ? "Guardando…" : textoBoton}
        </Button>
      </div>
    </div>
  );
}
