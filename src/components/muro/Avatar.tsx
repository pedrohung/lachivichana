import { cn } from "@/lib/utils";
import { AvatarIniciales } from "@/components/app/Avatar";
import type { Autor } from "@/datos/tipos";

/** Dos primeras iniciales del nombre visible. */
export function inicialesDe(nombre: string): string {
  const letras = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");
  return (letras || "?").toUpperCase();
}

const TAMANOS_IMG = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

type Props = {
  autor: Pick<Autor, "avatar" | "nombreVisible">;
  tamano?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Avatar del autor: imagen real de PocketBase cuando existe,
 * iniciales calculadas del nombre en caso contrario.
 */
export function AvatarAutor({ autor, tamano = "md", className }: Props) {
  if (autor.avatar) {
    return (
      <img
        src={autor.avatar}
        alt={`Avatar de ${autor.nombreVisible}`}
        loading="lazy"
        className={cn(
          "shrink-0 rounded-full border border-border bg-secondary object-cover",
          TAMANOS_IMG[tamano],
          className,
        )}
      />
    );
  }
  return (
    <AvatarIniciales
      iniciales={inicialesDe(autor.nombreVisible)}
      nombre={autor.nombreVisible}
      tamano={tamano}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
