import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";

import { AvatarIniciales } from "@/components/app/Avatar";
import { MarcoApp } from "@/components/app/MarcoApp";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  enviarMensaje,
  listarConversaciones,
  marcarConversacionLeida,
  miAlias,
  suscribirHilo,
} from "@/datos/servicios";
import type { Conversacion, Mensaje } from "@/datos/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mensajes")({
  validateSearch: (search: Record<string, unknown>) => ({
    hilo: typeof search["hilo"] === "string" ? (search["hilo"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mensajes — La Chivichana" },
      {
        name: "description",
        content: "Conversaciones privadas con personas, negocios y promotores.",
      },
      { property: "og:title", content: "Mensajes — La Chivichana" },
      {
        property: "og:description",
        content: "Conversaciones privadas con personas, negocios y promotores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MensajesPage,
});

function inicialesDe(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function MensajesPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Mensajes">
        <ContenidoMensajes />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ContenidoMensajes() {
  const navigate = useNavigate();
  const { hilo: hiloId } = Route.useSearch();
  const [conversaciones, setConversaciones] = useState<Conversacion[] | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const zonaMensajesRef = useRef<HTMLDivElement | null>(null);

  const cargar = async () => {
    setErrorCarga(null);
    try {
      const lista = await listarConversaciones();
      setConversaciones(lista);
    } catch {
      setErrorCarga("No se pudieron cargar las conversaciones. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  // Suscripción en tiempo real al hilo abierto; se limpia al cambiar o salir.
  useEffect(() => {
    if (!hiloId) return;
    void marcarConversacionLeida(hiloId)
      .then(() =>
        setConversaciones((anteriores) =>
          anteriores
            ? anteriores.map((c) => (c.id === hiloId ? { ...c, noLeidos: 0 } : c))
            : anteriores,
        ),
      )
      .catch(() => undefined);
    const cancelar = suscribirHilo(hiloId, (m: Mensaje) => {
      setConversaciones((anteriores) =>
        anteriores
          ? anteriores.map((c) => {
              if (c.id !== hiloId) return c;
              const esEcoPropio =
                m.propio &&
                c.mensajes.some((x) => x.id.startsWith("temp-") && x.propio && x.texto === m.texto);
              if (esEcoPropio) {
                return {
                  ...c,
                  mensajes: c.mensajes.map((x) =>
                    x.id.startsWith("temp-") && x.propio && x.texto === m.texto ? m : x,
                  ),
                  ultimaFecha: m.fecha,
                };
              }
              if (c.mensajes.some((x) => x.id === m.id)) return c;
              return { ...c, mensajes: [...c.mensajes, m], ultimaFecha: m.fecha };
            })
          : anteriores,
      );
    });
    return cancelar;
  }, [hiloId]);

  const activa = hiloId ? conversaciones?.find((c) => c.id === hiloId) : undefined;

  // Desplazar al final cuando llegan mensajes nuevos.
  useEffect(() => {
    const zona = zonaMensajesRef.current;
    if (zona) zona.scrollTop = zona.scrollHeight;
  }, [activa?.mensajes.length]);

  const abrirConversacion = (id: string) => {
    void navigate({ to: "/mensajes", search: { hilo: id } });
  };

  const volverALista = () => {
    void navigate({ to: "/mensajes", search: { hilo: undefined } });
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!activa || enviando) return;
    const textoLimpio = texto.trim();
    if (!textoLimpio) return;
    setEnviando(true);
    setErrorEnvio(null);
    const temporal: Mensaje = {
      id: `temp-${Date.now()}`,
      conversacionId: activa.id,
      autor: {
        alias: miAlias() ?? "",
        mostrarComo: "alias",
        nombreVisible: "Tú",
        avatar: "",
        insignias: [],
        enlace: "",
      },
      texto: textoLimpio,
      fecha: "ahora mismo",
      propio: true,
    };
    setConversaciones((anteriores) =>
      anteriores
        ? anteriores.map((c) =>
            c.id === activa.id
              ? { ...c, mensajes: [...c.mensajes, temporal], ultimaFecha: temporal.fecha }
              : c,
          )
        : anteriores,
    );
    setTexto("");
    try {
      await enviarMensaje(activa.id, textoLimpio);
    } catch {
      setConversaciones((anteriores) =>
        anteriores
          ? anteriores.map((c) =>
              c.id === activa.id
                ? { ...c, mensajes: c.mensajes.filter((x) => x.id !== temporal.id) }
                : c,
            )
          : anteriores,
      );
      setErrorEnvio("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (errorCarga) {
    return (
      <div className="space-y-4">
        <h1 className="texto-display text-2xl font-bold text-primary">Mensajes</h1>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{errorCarga}</p>
          <Button variant="contorno" size="sm" className="mt-4" onClick={() => void cargar()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (conversaciones === null) {
    return (
      <div className="space-y-4">
        <h1 className="texto-display text-2xl font-bold text-primary">Mensajes</h1>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="h-10 animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }

  const ultimoDe = (c: Conversacion) => c.mensajes[c.mensajes.length - 1];

  return (
    <div className="space-y-4">
      <h1 className="texto-display text-2xl font-bold text-primary">Mensajes</h1>
      {conversaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
            <MessageCircle aria-hidden="true" />
          </span>
          <p className="texto-display mt-3 text-lg font-bold text-primary">
            Aún no tienes conversaciones
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cuando contactes a alguien del Mercadito o un negocio, sus mensajes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          {/* Lista de conversaciones */}
          <section
            aria-label="Conversaciones"
            className={cn(
              "overflow-hidden rounded-2xl border border-border bg-card",
              hiloId ? "hidden md:block" : "block",
            )}
          >
            <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {conversaciones.map((c) => {
                const ultimo = ultimoDe(c);
                const seleccionada = c.id === hiloId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => abrirConversacion(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                        seleccionada && "bg-secondary",
                      )}
                      aria-current={seleccionada ? "true" : undefined}
                    >
                      <AvatarIniciales
                        iniciales={inicialesDe(c.nombreVisible)}
                        nombre={c.nombreVisible}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-primary">
                            {c.nombreVisible}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {c.ultimaFecha}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-muted-foreground">
                            {ultimo ? `${ultimo.propio ? "Tú: " : ""}${ultimo.texto}` : c.contexto}
                          </span>
                          {c.noLeidos > 0 && (
                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground">
                              {c.noLeidos}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Hilo de mensajes */}
          <section
            aria-label="Hilo de mensajes"
            className={cn(
              "overflow-hidden rounded-2xl border border-border bg-card",
              hiloId ? "flex" : "hidden md:flex",
              "flex-col",
            )}
          >
            {!hiloId ? (
              <div className="grid flex-1 place-items-center p-10 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                    <MessageCircle aria-hidden="true" />
                  </span>
                  <p className="texto-display mt-3 font-bold text-primary">
                    Elige una conversación
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecciona un hilo de la lista para leer y responder.
                  </p>
                </div>
              </div>
            ) : !activa ? (
              <div className="grid flex-1 place-items-center p-10 text-center">
                <div>
                  <p className="texto-display font-bold text-primary">
                    No se encontró esta conversación
                  </p>
                  <Button variant="contorno" size="sm" className="mt-4" onClick={volverALista}>
                    Volver a la lista
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={volverALista}
                    aria-label="Volver a la lista de conversaciones"
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <AvatarIniciales
                    iniciales={inicialesDe(activa.nombreVisible)}
                    nombre={activa.nombreVisible}
                    tamano="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary">
                      {activa.nombreVisible}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{activa.contexto}</p>
                  </div>
                </header>

                <div
                  ref={zonaMensajesRef}
                  className="h-[52vh] flex-1 space-y-3 overflow-y-auto px-4 py-4 md:h-[60vh]"
                >
                  {activa.mensajes.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Todavía no hay mensajes. Escribe el primero abajo.
                    </p>
                  ) : (
                    activa.mensajes.map((m) => (
                      <div
                        key={m.id}
                        className={cn("flex", m.propio ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                            m.propio
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm border border-border bg-secondary text-primary",
                          )}
                        >
                          {!m.propio && (
                            <p className="mb-0.5 text-xs font-semibold opacity-80">
                              {m.autor.nombreVisible}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                          <p
                            className={cn(
                              "mt-1 text-right text-[0.65rem]",
                              m.propio ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {m.fecha}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {errorEnvio && (
                  <p
                    role="alert"
                    className="border-t border-border bg-card px-4 pt-2 text-xs text-destructive"
                  >
                    {errorEnvio}
                  </p>
                )}
                <form
                  onSubmit={(e) => void enviar(e)}
                  className="flex items-center gap-2 border-t border-border px-4 py-3"
                >
                  <Input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    aria-label="Escribe un mensaje"
                    maxLength={2000}
                    disabled={enviando}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={enviando || !texto.trim()}
                    aria-label="Enviar mensaje"
                  >
                    <Send aria-hidden="true" />
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
