import { Search, SlidersHorizontal } from "lucide-react";

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
import type { OrdenMercadito } from "@/datos/servicios";

export const ORDENES: { valor: OrdenMercadito; texto: string }[] = [
  { valor: "recientes", texto: "Más recientes" },
  { valor: "precio-asc", texto: "Precio menor" },
  { valor: "precio-desc", texto: "Precio mayor" },
  { valor: "valorados", texto: "Mejor valorados" },
];

export function BarraBusqueda({
  texto,
  alCambiarTexto,
  orden,
  alCambiarOrden,
  alAbrirFiltros,
  cantidadFiltros,
}: {
  texto: string;
  alCambiarTexto: (v: string) => void;
  orden: OrdenMercadito;
  alCambiarOrden: (v: OrdenMercadito) => void;
  alAbrirFiltros: () => void;
  cantidadFiltros: number;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="buscador-mercadito" className="sr-only">
          Buscar en El Mercadito
        </Label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="buscador-mercadito"
          type="search"
          value={texto}
          onChange={(e) => alCambiarTexto(e.target.value)}
          placeholder="¿Qué estás buscando?"
          className="h-11 rounded-full pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="orden-mercadito" className="sr-only">
          Ordenar por
        </Label>
        <Select value={orden} onValueChange={(v) => alCambiarOrden(v as OrdenMercadito)}>
          <SelectTrigger id="orden-mercadito" className="h-11 w-44 rounded-full">
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
        <Button variant="contorno" size="sm" className="h-11 rounded-full" onClick={alAbrirFiltros}>
          <SlidersHorizontal aria-hidden="true" />
          Filtros
          {cantidadFiltros > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[0.7rem] font-bold text-primary-foreground">
              {cantidadFiltros}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
