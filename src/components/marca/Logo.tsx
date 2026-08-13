import marca from "@/assets/chivichana-mark.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "horizontal" | "compacto";
  tono?: "claro" | "oscuro";
  className?: string;
};

export function Logo({ variant = "horizontal", tono = "oscuro", className }: LogoProps) {
  const size = variant === "compacto" ? "h-9 w-9" : "h-10 w-10";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full border p-1",
          size,
          tono === "claro"
            ? "border-crema/30 bg-crema/10"
            : "border-border bg-card shadow-[var(--shadow-madera)]",
        )}
      >
        <img src={marca} alt="Símbolo de La Chivichana" width={816} height={816} />
      </span>
      {variant === "horizontal" && (
        <span className="min-w-0 leading-none">
          <span
            className={cn(
              "texto-display block text-xl font-bold",
              tono === "claro" ? "text-crema" : "text-primary",
            )}
          >
            La Chivichana
          </span>
          <span
            className={cn(
              "mt-1 block text-[0.62rem] font-semibold tracking-[0.22em] uppercase",
              tono === "claro" ? "text-sol" : "text-muted-foreground",
            )}
          >
            Cuba se conecta
          </span>
        </span>
      )}
    </span>
  );
}
