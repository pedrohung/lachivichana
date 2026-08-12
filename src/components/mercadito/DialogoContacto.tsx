import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import { AvatarIniciales } from "@/components/app/Avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  onOpenChange,
}: {
  articulo: Articulo;
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { identidad, identidades, cambiarIdentidad } = useApp();
  const [mensaje, setMensaje] = useState(() => mensajeInicial(articulo));
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (abierto) {
      setMensaje(mensajeInicial(articulo));
      setEnviado(false);
      setEnviando(false);
    }
  }, [abierto, articulo]);

  const enviar = () => {
    setEnviando(true);
    window.setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 700);
  };

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {enviado ? (
          <>
            <DialogHeader>
              <DialogTitle className="texto-display flex items-center gap-2 text-xl">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-turquesa" />
                Contacto enviado
              </DialogTitle>
              <DialogDescription>
                Enviamos tu mensaje como <strong>{identidad.nombreVisible}</strong>. Es una acción
                simulada: en esta demostración no existe mensajería real.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="sol" onClick={() => onOpenChange(false)}>
                Seguir mirando
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="texto-display text-xl">
                {MODALIDADES[articulo.modo].accion}
              </DialogTitle>
              <DialogDescription>
                Vas a escribir sobre “{articulo.titulo}”. Decide con qué identidad quieres hacerlo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identidad-contacto">Escribes como</Label>
                <Select value={identidad.clave} onValueChange={cambiarIdentidad}>
                  <SelectTrigger id="identidad-contacto" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {identidades.map((i) => (
                      <SelectItem key={i.clave} value={i.clave}>
                        {i.nombreVisible} — {i.detalle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AvatarIniciales
                    iniciales={identidad.avatar}
                    nombre={identidad.nombreVisible}
                    tamano="sm"
                  />
                  Verá {identidad.nombreVisible}, no tus datos privados.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mensaje-contacto">Mensaje</Label>
                <Textarea
                  id="mensaje-contacto"
                  value={mensaje}
                  rows={5}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>

              <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rojo" />
                <span>{AVISO_CONTACTO}</span>
              </p>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button variant="sol" onClick={enviar} disabled={enviando || !mensaje.trim()}>
                {enviando ? "Enviando…" : "Enviar mensaje"}
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
