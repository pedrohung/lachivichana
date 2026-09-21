import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Maximize2, MessageCircle, Send, X } from "lucide-react";

import { AvatarIniciales, inicialesDe } from "@/components/app/Avatar";
import { useApp } from "@/components/app/contexto";
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

/** Intervalo de refresco silencioso del contador (respaldo del tiempo real). */
const INTERVALO_REFRESCO_MS = 60_000;

function insigniaTexto(total: number): string {
  return total > 99 ? "99+" : String(total);
}

/**
 * Botón flotante de mensajería estilo Messenger: abre un panel con las
 * conversaciones y muestra un círculo rojo con el número de mensajes sin leer.
 * Solo visible con sesión iniciada. Vive en todas las páginas de la app.
 */
export function MensajeriaFlotante() {
  const { invitado } = useApp();
  const [abierto, setAbierto] = useState(false);
  const [conversaciones, setConversaciones] = useState<Conversacion[] | null>(null);
  const [hiloId, setHiloId] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const zonaMensajesRef = useRef<HTMLDivElement | null>(null);
  const hiloIdRef = useRef<string | null>(null);
  hiloIdRef.current = hiloId;
  /** IDs de los hilos conocidos (para el tiempo real sin re-suscribir en cada mensaje). */
  const hilosRef = useRef<string[]>([]);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setErrorCarga(false);
    try {
      const lista = await listarConversaciones();
      setConversaciones(lista);
    } catch {
      if (!silencioso) setErrorCarga(true);
    }
  }, []);

  // Carga inicial (para la insignia) y refresco periódico silencioso.
  useEffect(() => {
    void cargar();
    const intervalo = window.setInterval(() => void cargar(true), INTERVALO_REFRESCO_MS);
    const alRecuperarFoco = () => void cargar(true);
    window.addEventListener("focus", alRecuperarFoco);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", alRecuperarFoco);
    };
  }, [cargar]);

  // Refrescar al abrir el panel.
  useEffect(() => {
    if (abierto) void cargar(true);
  }, [abierto, cargar]);

  // Mantener el índice de hilos conocidos sincronizado.
  useEffect(() => {
    hilosRef.current = (conversaciones ?? []).map((c) => c.id);
  }, [conversaciones]);

  /** Aplica un mensaje entrante (tiempo real) al estado. */
  const alMensajeEntrante = useCallback((id: string, m: Mensaje) => {
    if (!hilosRef.current.includes(id)) {
      // Hilo nuevo que aún no está en la lista: recargar.
      void listarConversaciones()
        .then(setConversaciones)
        .catch(() => undefined);
      return;
    }
    const esHiloAbierto = hiloIdRef.current === id;
    if (esHiloAbierto && !m.propio) {
      void marcarConversacionLeida(id).catch(() => undefined);
    }
    setConversaciones((anteriores) => {
      if (!anteriores) return anteriores;
      const indice = anteriores.findIndex((c) => c.id === id);
      if (indice === -1) return anteriores;
      const actual = anteriores[indice]!;
      let mensajes = actual.mensajes;
      if (m.propio) {
        const indiceTemp = mensajes.findIndex(
          (x) => x.id.startsWith("temp-") && x.propio && x.texto === m.texto,
        );
        if (indiceTemp >= 0) {
          mensajes = mensajes.map((x, i) => (i === indiceTemp ? m : x));
        } else if (!mensajes.some((x) => x.id === m.id)) {
          mensajes = [...mensajes, m];
        }
      } else {
        if (mensajes.some((x) => x.id === m.id)) return anteriores;
        mensajes = [...mensajes, m];
      }
      const actualizada: Conversacion = {
        ...actual,
        mensajes,
        ultimaFecha: m.fecha,
        noLeidos: esHiloAbierto || m.propio ? 0 : actual.noLeidos + 1,
      };
      return [actualizada, ...anteriores.filter((c) => c.id !== id)];
    });
  }, []);

  const idsClave = (conversaciones ?? []).map((c) => c.id).join(",");

  // Suscripciones en tiempo real mientras el panel está abierto.
  // La clave resume la lista de hilos: solo se re-suscribe si cambian los hilos.
  useEffect(() => {
    if (!abierto || idsClave === "") return;
    const cancelar = hilosRef.current.map((id) =>
      suscribirHilo(id, (m) => alMensajeEntrante(id, m)),
    );
    return () => {
      cancelar.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, idsClave]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!abierto) return;
    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        setHiloId(null);
      }
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto]);

  const activa = hiloId ? conversaciones?.find((c) => c.id === hiloId) : undefined;

  // Desplazar al final cuando llegan mensajes nuevos al hilo abierto.
  useEffect(() => {
    const zona = zonaMensajesRef.current;
    if (zona) zona.scrollTop = zona.scrollHeight;
  }, [activa?.mensajes.length]);

  const abrirHilo = (id: string) => {
    setHiloId(id);
    void marcarConversacionLeida(id)
      .then(() =>
        setConversaciones((anteriores) =>
          anteriores
            ? anteriores.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c))
            : anteriores,
        ),
      )
      .catch(() => undefined);
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

  if (invitado) return null;

  const sinLeer = (conversaciones ?? []).reduce((total, c) => total + c.noLeidos, 0);

  return (
    <>
      {abierto && (
        <section
          aria-label="Mensajería"
          className="fixed right-4 bottom-36 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:right-6 lg:bottom-24"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {hiloId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHiloId(null)}
                  aria-label="Volver a las conversaciones"
                >
                  <ArrowLeft aria-hidden="true" />
                </Button>
              )}
              <h2 className="texto-display truncate text-base font-bold text-primary">
                {activa ? activa.nombreVisible : "Mensajes"}
              </h2>
              {!activa && sinLeer > 0 && (
                <span
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-rojo px-1 text-[0.65rem] font-bold text-white"
                  aria-label={`${sinLeer} mensajes sin leer`}
                >
                  {insigniaTexto(sinLeer)}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center">
              <Button asChild variant="ghost" size="icon" aria-label="Abrir mensajes en grande">
                <Link to="/mensajes" search={{ hilo: hiloId ?? undefined }}>
                  <Maximize2 aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAbierto(false);
                  setHiloId(null);
                }}
                aria-label="Cerrar mensajería"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </header>

          {!activa ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {errorCarga ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No se pudieron cargar las conversaciones.
                  </p>
                  <Button
                    variant="contorno"
                    size="sm"
                    className="mt-3"
                    onClick={() => void cargar()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : conversaciones === null ? (
                <div className="space-y-3 p-4">
                  <div className="h-12 animate-pulse rounded-xl bg-secondary" />
                  <div className="h-12 animate-pulse rounded-xl bg-secondary" />
                  <div className="h-12 animate-pulse rounded-xl bg-secondary" />
                </div>
              ) : conversaciones.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                    <MessageCircle aria-hidden="true" />
                  </span>
                  <p className="texto-display mt-3 font-bold text-primary">
                    Aún no tienes conversaciones
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cuando contactes a alguien, sus mensajes aparecerán aquí.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {conversaciones.map((c) => {
                    const ultimo = c.mensajes[c.mensajes.length - 1];
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => abrirHilo(c.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
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
                                {ultimo
                                  ? `${ultimo.propio ? "Tú: " : ""}${ultimo.texto}`
                                  : c.contexto}
                              </span>
                              {c.noLeidos > 0 && (
                                <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-rojo px-1 text-[0.65rem] font-bold text-white">
                                  {insigniaTexto(c.noLeidos)}
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <>
              <div
                ref={zonaMensajesRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
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
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                          m.propio
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm border border-border bg-secondary text-primary",
                        )}
                      >
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
                className="flex items-center gap-2 border-t border-border px-3 py-2.5"
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
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar mensajería" : `Abrir mensajería (${sinLeer} sin leer)`}
        aria-expanded={abierto}
        className="fixed right-4 bottom-20 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:right-6 lg:bottom-6"
      >
        {abierto ? (
          <X aria-hidden="true" className="h-6 w-6" />
        ) : (
          <MessageCircle aria-hidden="true" className="h-6 w-6" />
        )}
        {!abierto && sinLeer > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-rojo px-1 text-xs font-bold text-white ring-2 ring-background"
          >
            {insigniaTexto(sinLeer)}
          </span>
        )}
      </button>
    </>
  );
}
