import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { MOTIVOS_DENUNCIA } from "@/datos/servicios";

export function DialogoDenuncia({
  abierto,
  onOpenChange,
}: {
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [motivo, setMotivo] = useState(MOTIVOS_DENUNCIA[0]!);
  const [detalle, setDetalle] = useState("");
  const [enviada, setEnviada] = useState(false);

  useEffect(() => {
    if (abierto) {
      setMotivo(MOTIVOS_DENUNCIA[0]!);
      setDetalle("");
      setEnviada(false);
    }
  }, [abierto]);

  const cerrar = () => onOpenChange(false);

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {enviada ? (
          <>
            <DialogHeader>
              <DialogTitle className="texto-display flex items-center gap-2 text-xl">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-turquesa" />
                Denuncia recibida
              </DialogTitle>
              <DialogDescription>
                Anotamos tu denuncia de forma anónima. La revisaremos y, si hace falta, tomaremos
                medidas con el anuncio. Todavía no tenemos un sistema de denuncias con seguimiento:
                esto queda registrado solo en este dispositivo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="sol" onClick={cerrar}>
                Seguir mirando
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="texto-display text-xl">Denunciar este anuncio</DialogTitle>
              <DialogDescription>
                Cuéntanos qué ocurre. Nadie sabrá quién denunció.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-foreground">Motivo</legend>
              <RadioGroup value={motivo} onValueChange={setMotivo} className="gap-2">
                {MOTIVOS_DENUNCIA.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <RadioGroupItem value={m} id={`motivo-${m}`} />
                    <Label htmlFor={`motivo-${m}`} className="font-normal">
                      {m}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="detalle-denuncia">Si quieres, añade un detalle</Label>
              <Textarea
                id="detalle-denuncia"
                rows={3}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button variant="sol" onClick={() => setEnviada(true)}>
                Enviar denuncia
              </Button>
              <Button variant="ghost" onClick={cerrar}>
                Cancelar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
