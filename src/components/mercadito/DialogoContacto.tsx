import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarMensaje, iniciarConversacion } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { MODALIDADES } from "./modalidades";

export const AVISO_CONTACTO =
  "No compartas documentos, contraseñas, códigos de seguridad ni tu dirección exacta.";

function mensajeInicial(articulo: Articulo) {
  switch (articulo.modo) {
    case "donacion":
      return `Hola, vi tu publicación “${articulo.titulo}”. Me hace falta y puedo coordinar la recogida cuando te venga bien.`;
    case "intercambio":
      return `Hola, me interesa tu intercambio “${articulo.titulo}”. Te propongo lo siguiente:`;
    case "servicio":
      return `Hola, quisiera contratar “${articulo.titulo}”. ¿Qué disponibilidad tienes?`;
    default:
      return `Hola, me interesa “${articulo.titulo}”. ¿Sigue disponible?`;
  }
}

export function DialogoContacto({
  articulo,
  abierto,
  alCerrar,
}: {
  articulo: Articulo;
  abierto: boolean;
  alCerrar: () => void;
}) {
  const navegar = useNavigate();
  const { identidad, requiereCuenta } = useApp();
  const [mensaje, setMensaje] = useState(() => mensajeInicial(articulo));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setMensaje(mensajeInicial(articulo));
      setError("");
      setEnviando(false);
    }
  }, [abierto, articulo]);

  const enviar = async () => {
    if (!requiereCuenta()) return;
    if (!mensaje.trim()) return;
    setEnviando(true);
    setError("");
    try {
      const id = await iniciarConversacion(articulo.vendedor.alias);
      await enviarMensaje(id, mensaje.trim());
      alCerrar();
      void navegar({ to: "/mensajes", search: { hilo: id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) alCerrar();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="texto-display text-xl">
            {MODALIDADES[articulo.modo].accion}
          </DialogTitle>
          <DialogDescription>
            Vas a escribirle a <strong>{articulo.vendedor.nombreVisible}</strong> sobre “
            {articulo.titulo}”.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Escribes como <strong className="text-foreground">{identidad.nombreVisible}</strong>.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="mensaje-contacto">Mensaje</Label>
            <Textarea
              id="mensaje-contacto"
              value={mensaje}
              rows={5}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-rojo">
              {error}
            </p>
          )}

          <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rojo" />
            <span>{AVISO_CONTACTO}</span>
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            variant="sol"
            onClick={() => void enviar()}
            disabled={enviando || !mensaje.trim()}
          >
            {enviando ? "Enviando…" : "Enviar mensaje"}
          </Button>
          <Button variant="ghost" onClick={alCerrar}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
