import { cn } from "@/lib/utils";

export const FRASES_MARTI = [
  "El respeto a la libertad y al pensamiento ajenos, aun del ente más infeliz, es mi fanatismo: si muero, o me matan, será por eso.",
  "Yo quiero que la ley primera de nuestra república sea el culto de los cubanos a la dignidad plena del hombre.",
] as const;

export function FraseMarti({
  texto,
  tono = "claro",
  className,
}: {
  texto: string;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative rounded-2xl border py-1 pl-5",
        tono === "claro" ? "border-sol/40 bg-crema/5" : "border-border bg-card",
        className,
      )}
    >
      <span
        aria-hidden
        className="texto-display absolute -top-3 left-3 text-4xl leading-none text-sol"
      >
        “
      </span>
      <blockquote
        className={cn(
          "texto-display py-4 pr-5 text-base leading-relaxed text-balance italic sm:text-lg",
          tono === "claro" ? "text-crema" : "text-foreground",
        )}
      >
        {texto}
      </blockquote>
      <figcaption
        className={cn(
          "pr-5 pb-4 text-xs font-semibold tracking-[0.16em] uppercase",
          tono === "claro" ? "text-sol" : "text-muted-foreground",
        )}
      >
        José Martí — El Apóstol cubano
      </figcaption>
    </figure>
  );
}
