import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApp } from "./contexto";

/**
 * Envuelve el contenido de una pantalla que exige cuenta.
 * En modo visitante abre el diálogo de acceso y muestra un aviso
 * en español, sin revelar datos privados de la sesión de demostración.
 */
export function SoloConCuenta({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { invitado } = useApp();

  if (!invitado) return <>{children}</>;

  return (
    <div className="space-y-4">
      <h1 className="texto-display text-2xl font-bold text-primary">{titulo}</h1>
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
          <Lock aria-hidden="true" />
        </span>
        <p className="texto-display mt-3 text-lg font-bold text-primary">
          Para esto hace falta una cuenta
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Estás mirando como visitante. Crea tu cuenta o entra para usar esta parte de El Mercadito.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild variant="sol" size="sm">
            <Link to="/registro">Crear cuenta</Link>
          </Button>
          <Button asChild variant="contorno" size="sm">
            <Link to="/entrar">Entrar</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/mercadito">Seguir mirando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
