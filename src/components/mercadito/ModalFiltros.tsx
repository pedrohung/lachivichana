import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIAS_MERCADITO,
  ESTADOS_ARTICULO,
  FILTROS_MERCADITO_INICIALES,
  PAISES_MERCADITO,
  type FiltrosMercadito,
  type OrdenMercadito,
  type QuienAnuncia,
} from "@/datos/servicios";
import type { ModoArticulo } from "@/datos/tipos";
import { cn } from "@/lib/utils";
import { LISTA_MODALIDADES, TEXTOS_ESTADO } from "./modalidades";
import { ORDENES } from "./BarraBusqueda";

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

export function ModalFiltros({
  abierto,
  alCerrar,
  filtros,
  cambiar,
  limpiar,
}: {
  abierto: boolean;
  alCerrar: () => void;
  filtros: FiltrosMercadito;
  cambiar: (parcial: Partial<FiltrosMercadito>) => void;
  limpiar: () => void;
}) {
  const activos = filtrosActivos(filtros);

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="texto-display text-xl">Filtrar El Mercadito</DialogTitle>
          <DialogDescription>
            Afina la búsqueda por modalidad, categoría, zona, precio y quién anuncia.
          </DialogDescription>
        </DialogHeader>

        <div
          role="group"
          aria-label="Modalidad"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
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
            <Input
              id="f-zona"
              value={filtros.zona === "todas" ? "" : filtros.zona}
              onChange={(e) => cambiar({ zona: e.target.value.trim() ? e.target.value : "todas" })}
              placeholder="Todas las zonas"
            />
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

        {activos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {activos.map((a) => (
              <button
                key={`${a.clave}-${a.texto}`}
                type="button"
                onClick={() =>
                  cambiar({
                    [a.clave]: FILTROS_MERCADITO_INICIALES[a.clave],
                  } as Partial<FiltrosMercadito>)
                }
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {a.texto}
                <X aria-hidden="true" className="h-3 w-3" />
                <span className="sr-only">Quitar filtro</span>
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={limpiar}>
              Limpiar filtros
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-start">
          <Button variant="sol" onClick={alCerrar}>
            Ver resultados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
