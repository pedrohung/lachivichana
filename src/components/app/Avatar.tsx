import { cn } from "@/lib/utils";

type Props = {
  iniciales: string;
  nombre: string;
  tamano?: "sm" | "md" | "lg";
  className?: string;
};

const TAMANOS = {
  sm: "h-8 w-8 text-[0.65rem]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
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