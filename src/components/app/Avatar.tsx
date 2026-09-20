import { cn } from "@/lib/utils";

type Tamano = "sm" | "md" | "lg" | "xl";

type Props = {
  iniciales: string;
  nombre: string;
  tamano?: Tamano;
  className?: string | undefined;
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-8 w-8 text-[0.65rem]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-24 w-24 text-2xl",
};

export function AvatarIniciales({ iniciales, nombre, tamano = "md", className }: Props) {
  return (
    <span
      role="img"
      aria-label={`Avatar de ${nombre}`}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-border bg-secondary font-semibold tracking-wide text-primary",
        TAMANOS[tamano],
        className,
      )}
    >
      {iniciales}
    </span>
  );
}

/** Iniciales a partir del nombre visible (hasta dos palabras). */
export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const ini = partes
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("");
  return (ini || "?").toUpperCase();
}

/** Muestra la foto si hay URL; si no, las iniciales del nombre. */
export function Avatar({
  src,
  nombre,
  tamano = "md",
  className,
}: {
  src?: string | null;
  nombre: string;
  tamano?: Tamano;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar de ${nombre}`}
        className={cn(
          "shrink-0 rounded-full border border-border bg-secondary object-cover",
          TAMANOS[tamano],
          className,
        )}
      />
    );
  }
  return (
    <AvatarIniciales
      iniciales={inicialesDe(nombre)}
      nombre={nombre}
      tamano={tamano}
      className={className}
    />
  );
}
