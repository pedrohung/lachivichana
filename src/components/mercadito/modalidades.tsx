import { Gift, Handshake, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";

import type { Articulo, ModoArticulo } from "@/datos/tipos";
import { cn } from "@/lib/utils";

export type ConfigModalidad = {
  clave: ModoArticulo;
  texto: string;
  icono: LucideIcon;
  accion: string;
  clases: string;
};

export const MODALIDADES: Record<ModoArticulo, ConfigModalidad> = {
  venta: {
    clave: "venta",
    texto: "Venta",
    icono: ShoppingBag,
    accion: "Me interesa",
    clases: "border-primary/30 bg-primary/10 text-primary",
  },
  donacion: {
    clave: "donacion",
    texto: "Donación",
    icono: Gift,
    accion: "Me hace falta",
    clases: "border-turquesa/40 bg-turquesa/10 text-[oklch(0.42_0.08_215)]",
  },
  intercambio: {
    clave: "intercambio",
    texto: "Intercambio",
    icono: Handshake,
    accion: "Proponer intercambio",
    clases: "border-madera/40 bg-madera/15 text-[oklch(0.42_0.07_60)]",
  },
  servicio: {
    clave: "servicio",
    texto: "Servicio",
    icono: Wrench,
    accion: "Contactar",
    clases: "border-rojo/30 bg-rojo/10 text-rojo",
  },
};

export const LISTA_MODALIDADES = Object.values(MODALIDADES);

export function InsigniaModalidad({ modo, className }: { modo: ModoArticulo; className?: string }) {
  const config = MODALIDADES[modo];
  const Icono = config.icono;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.clases,
        className,
      )}
    >
      <Icono aria-hidden="true" className="h-3.5 w-3.5" />
      {config.texto}
    </span>
  );
}

export const TEXTOS_ESTADO: Record<string, string> = {
  nuevo: "Nuevo",
  "como-nuevo": "Como nuevo",
  usado: "Usado",
  "para-piezas": "Para piezas",
  "no-aplica": "Estado no aplicable",
};

/** Estados que devuelve el servicio para un anuncio. */
export const TEXTOS_ESTADO_ANUNCIO: Record<string, string> = {
  activo: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  pausado: "Pausado",
};

const TONOS: Record<string, string> = {
  madera: "bg-[image:linear-gradient(140deg,oklch(0.82_0.06_68),oklch(0.56_0.09_58))]",
  turquesa: "bg-[image:linear-gradient(140deg,oklch(0.86_0.08_195),oklch(0.52_0.09_215))]",
  sol: "bg-[image:linear-gradient(140deg,oklch(0.9_0.12_88),oklch(0.68_0.15_45))]",
  mar: "bg-[image:linear-gradient(140deg,oklch(0.7_0.08_235),oklch(0.34_0.08_255))]",
};

/** Foto real del anuncio cuando la hay; si no, un marcador neutro con el icono de la modalidad. */
export function ImagenArticulo({
  articulo,
  className,
}: {
  articulo: Articulo;
  className?: string;
}) {
  const primera = articulo.imagenes?.[0];
  if (primera) {
    return (
      <img
        src={primera.url}
        alt={primera.alt || articulo.imagenAlt}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }
  const Icono = MODALIDADES[articulo.modo].icono;
  return (
    <div
      role="img"
      aria-label={articulo.imagenAlt}
      className={cn(
        "grid place-items-center overflow-hidden text-[oklch(1_0_0)]",
        TONOS[articulo.tono ?? "mar"],
        className,
      )}
    >
      <Icono aria-hidden="true" className="h-10 w-10 opacity-80" />
    </div>
  );
}

export function textoPrecio(a: Articulo) {
  if (a.modo === "donacion") return "Gratis";
  if (a.modo === "intercambio") return "Intercambio";
  if (a.precio === undefined) return "Consultar";
  return `${a.precio.toLocaleString("es")} ${a.moneda ?? "CUP"}`;
}
