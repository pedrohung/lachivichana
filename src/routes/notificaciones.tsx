import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Heart,
  Mail,
  MessageCircle,
  MessageSquare,
  Store,
  UserPlus,
} from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { Button } from "@/components/ui/button";
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "@/datos/servicios";
import type { Notificacion } from "@/datos/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notificaciones")({
  head: () => ({
    meta: [
      { title: "Notificaciones — La Chivichana" },
      { name: "description", content: "Lo que ocurrió mientras no estabas." },
      { property: "og:title", content: "Notificaciones — La Chivichana" },
      { property: "og:description", content: "Lo que ocurrió mientras no estabas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificacionesPage,
});

const ICONOS_POR_CLASE: Record<
  Notificacion["clase"],
  ComponentType<{ "aria-hidden"?: boolean | "true" | "false"; className?: string }>
> = {
  mensaje: MessageCircle,
  reaccion: Heart,
  comentario: MessageSquare,
  seguimiento: UserPlus,
  sistema: Bell,
  campana: Bell,
  mercadito: Store,
  empleo: Briefcase,
  promotor: BadgeCheck,
  invitacion: Mail,
};

function NotificacionesPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Notificaciones">
        <ContenidoNotificaciones />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ContenidoNotificaciones() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const cargar = async () => {
    setError(null);
    try {
      setNotificaciones(await listarNotificaciones());
    } catch {
      setError("No se pudieron cargar las notificaciones. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const abrir = async (n: Notificacion) => {
    if (!n.leida) {
      setNotificaciones((anteriores) =>
        anteriores
          ? anteriores.map((x) => (x.id === n.id ? { ...x, leida: true } : x))
          : anteriores,
      );
      try {
        await marcarNotificacionLeida(n.id);
      } catch {
        // Si falla, se revierte el estado local.
        setNotificaciones((anteriores) =>
          anteriores
            ? anteriores.map((x) => (x.id === n.id ? { ...x, leida: false } : x))
            : anteriores,
        );
      }
    }
    router.history.push(n.enlace);
  };

  const marcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await marcarTodasLeidas();
      setNotificaciones((anteriores) =>
        anteriores ? anteriores.map((x) => ({ ...x, leida: true })) : anteriores,
      );
    } catch {
      setError("No se pudieron marcar las notificaciones. Inténtalo de nuevo.");
    } finally {
      setMarcandoTodas(false);
    }
  };

  if (error && notificaciones === null) {
    return (
      <div className="space-y-4">
        <h1 className="texto-display text-2xl font-bold text-primary">Notificaciones</h1>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="contorno" size="sm" className="mt-4" onClick={() => void cargar()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (notificaciones === null) {
    return (
      <div className="space-y-4">
        <h1 className="texto-display text-2xl font-bold text-primary">Notificaciones</h1>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-12 animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-12 animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-12 animate-pulse rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }

  const pendientes = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="texto-display text-2xl font-bold text-primary">Notificaciones</h1>
        {pendientes > 0 && (
          <Button
            variant="contorno"
            size="sm"
            onClick={() => void marcarTodas()}
            disabled={marcandoTodas}
          >
            {marcandoTodas ? "Marcando…" : "Marcar todas como leídas"}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {notificaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
            <Bell aria-hidden="true" />
          </span>
          <p className="texto-display mt-3 text-lg font-bold text-primary">Estás al día</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            No hay notificaciones nuevas. Te avisaremos cuando ocurra algo importante.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notificaciones.map((n) => {
            const Icono = ICONOS_POR_CLASE[n.clase] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void abrir(n)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                    !n.leida && "border-primary/40 bg-secondary/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      n.leida ? "bg-secondary text-muted-foreground" : "bg-primary/15 text-primary",
                    )}
                  >
                    <Icono aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm",
                          n.leida ? "text-muted-foreground" : "font-semibold text-primary",
                        )}
                      >
                        {n.texto}
                      </span>
                      {!n.leida && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                          aria-label="Sin leer"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{n.fecha}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
