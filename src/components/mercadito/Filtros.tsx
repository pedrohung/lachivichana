import { Search, SlidersHorizontal, X } from "lucide-react";

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
import { ARTICULOS, CATEGORIAS_MERCADITO, ESTADOS_ARTICULO, PAISES_MERCADITO } from "@/datos/demo/mercadito";
import {
  FILTROS_MERCADITO_INICIALES,
  type FiltrosMercadito,
  type OrdenMercadito,
  type QuienAnuncia,
} from "@/datos/servicios";
import type { ModoArticulo } from "@/datos/tipos";
import { cn } from "@/lib/utils";
import { LISTA_MODALIDADES, TEXTOS_ESTADO } from "./modalidades";

const ZONAS = Array.from(new Set(ARTICULOS.map((a) => a.zona))).sort((a, b) =>
  a.localeCompare(b, "es"),
);

const ORDENES: { valor: OrdenMercadito; texto: string }[] = [
  { valor: "recientes", texto: "Más recientes" },
  { valor: "precio-asc", texto: "Precio menor" },
  { valor: "precio-desc", texto: "Precio mayor" },
  { valor: "valorados", texto: "Mejor valorados" },
];

const QUIENES: { valor: QuienAnuncia; texto: string }[] = [
  { valor: "todos", texto: "Todo el mundo" },
  { valor: "personas", texto: "Personas" },
  { valor: "negocios", texto: "Negocios" },
  { valor: "verificados", texto: "Verificados" },
];

export type FiltroActivo = { clave: keyof FiltrosMercadito; texto: string };

export function filtrosActivos(f: FiltrosMercadito): FiltroActivo[] {
  const activos: FiltroActivo[] = [];
  if (f.texto.trim()) activos.push({ clave: "texto", texto: `Búsqueda: ${f.texto.trim()}` });
  if (f.modo !== "todas")
    activos.push({
      clave: "modo",
      texto: LISTA_MODALIDADES.find((m) => m.clave === f.modo)?.texto ?? f.modo,
    });
  if (f.categoria !== "todas") activos.push({ clave: "categoria", texto: f.categoria });
  if (f.pais !== "todos") activos.push({ clave: "pais", texto: f.pais });
  if (f.zona !== "todas") activos.push({ clave: "zona", texto: f.zona });
  if (f.estado !== "todos")
    activos.push({ clave: "estado", texto: TEXTOS_ESTADO[f.estado] ?? f.estado });
  if (f.quien !== "todos")
    activos.push({
      clave: "quien",
      texto: QUIENES.find((q) => q.valor === f.quien)?.texto ?? f.quien,
    });
  if (f.precioMin) activos.push({ clave: "precioMin", texto: `Desde ${f.precioMin}` });
  if (f.precioMax) activos.push({ clave: "precioMax", texto: `Hasta ${f.precioMax}` });
  return activos;
}

export function FiltrosMercaditoPanel({
  filtros,
  cambiar,
  limpiar,
  resultados,
}: {
  filtros: FiltrosMercadito;
  cambiar: (parcial: Partial<FiltrosMercadito>) => void;
  limpiar: () => void;
  resultados: number;
}) {
  const activos = filtrosActivos(filtros);

  return (
    <section
      aria-label="Buscador y filtros de El Mercadito"
      className="space-y-4 rounded-2xl border border-border bg-card p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="buscador-mercadito" className="sr-only">
          Buscar en El Mercadito
        </Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="buscador-mercadito"
            type="search"
            value={filtros.texto}
            onChange={(e) => cambiar({ texto: e.target.value })}
            placeholder="¿Qué estás buscando?"
            className="h-11 rounded-full pl-9"
          />
        </div>
      </div>

      <div role="group" aria-label="Modalidad" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <BotonModalidad
          activo={filtros.modo === "todas"}
          onClick={() => cambiar({ modo: "todas" })}
          texto="Todas las modalidades"
        />
        {LISTA_MODALIDADES.map((m) => {
          const Icono = m.icono;
          return (
            <BotonModalidad
              key={m.clave}
              activo={filtros.modo === m.clave}
              onClick={() => cambiar({ modo: m.clave as ModoArticulo })}
              texto={m.texto}
              icono={<Icono aria-hidden="true" className="h-3.5 w-3.5" />}
            />
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Categoría" id="f-categoria">
          <Select value={filtros.categoria} onValueChange={(v) => cambiar({ categoria: v })}>
            <SelectTrigger id="f-categoria" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {CATEGORIAS_MERCADITO.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="País" id="f-pais">
          <Select value={filtros.pais} onValueChange={(v) => cambiar({ pais: v })}>
            <SelectTrigger id="f-pais" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los países</SelectItem>
              {PAISES_MERCADITO.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="Zona general" id="f-zona">
          <Select value={filtros.zona} onValueChange={(v) => cambiar({ zona: v })}>
            <SelectTrigger id="f-zona" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las zonas</SelectItem>
              {ZONAS.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="Estado del artículo" id="f-estado">
          <Select value={filtros.estado} onValueChange={(v) => cambiar({ estado: v })}>
            <SelectTrigger id="f-estado" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Cualquier estado</SelectItem>
              {ESTADOS_ARTICULO.map((e) => (
                <SelectItem key={e.valor} value={e.valor}>
                  {e.texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="Quién anuncia" id="f-quien">
          <Select
            value={filtros.quien}
            onValueChange={(v) => cambiar({ quien: v as QuienAnuncia })}
          >
            <SelectTrigger id="f-quien" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUIENES.map((q) => (
                <SelectItem key={q.valor} value={q.valor}>
                  {q.texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="Ordenar por" id="f-orden">
          <Select
            value={filtros.orden}
            onValueChange={(v) => cambiar({ orden: v as OrdenMercadito })}
          >
            <SelectTrigger id="f-orden" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDENES.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo etiqueta="Precio mínimo" id="f-min">
          <Input
            id="f-min"
            type="number"
            inputMode="numeric"
            min={0}
            value={filtros.precioMin}
            onChange={(e) => cambiar({ precioMin: e.target.value })}
            placeholder="0"
          />
        </Campo>

        <Campo etiqueta="Precio máximo" id="f-max">
          <Input
            id="f-max"
            type="number"
            inputMode="numeric"
            min={0}
            value={filtros.precioMax}
            onChange={(e) => cambiar({ precioMax: e.target.value })}
            placeholder="Sin límite"
          />
        </Campo>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <p aria-live="polite" className="text-sm font-semibold text-foreground">
          <SlidersHorizontal aria-hidden="true" className="mr-1 inline h-4 w-4 text-turquesa" />
          {resultados} {resultados === 1 ? "resultado" : "resultados"}
        </p>
        {activos.map((a) => (
          <button
            key={`${a.clave}-${a.texto}`}
            type="button"
            onClick={() =>
              cambiar({ [a.clave]: FILTROS_MERCADITO_INICIALES[a.clave] } as Partial<FiltrosMercadito>)
            }
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {a.texto}
            <X aria-hidden="true" className="h-3 w-3" />
            <span className="sr-only">Quitar filtro</span>
          </button>
        ))}
        {activos.length > 0 && (
          <Button variant="ghost" size="sm" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </section>
  );
}

function Campo({
  etiqueta,
  id,
  children,
}: {
  etiqueta: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {etiqueta}
      </Label>
      {children}
    </div>
  );
}

function BotonModalidad({
  activo,
  onClick,
  texto,
  icono,
}: {
  activo: boolean;
  onClick: () => void;
  texto: string;
  icono?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        activo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
      )}
    >
      {icono}
      {texto}
    </button>
  );
}
