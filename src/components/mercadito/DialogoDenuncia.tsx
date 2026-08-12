import { useState } from "react";

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
import { MOTIVOS_DENUNCIA } from "@/datos/demo/mercadito";

export function DialogoDenuncia({
  abierto,
  onOpenChange,
  alDenunciar,
}: {
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
  alDenunciar: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState(MOTIVOS_DENUNCIA[0]!);
  const [detalle, setDetalle] = useState("");

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="texto-display text-xl">Denunciar este anuncio</DialogTitle>
          <DialogDescription>
            Cuéntanos qué ocurre. Nadie sabrá quién denunció. En esta demostración la acción es
            simulada.
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
          <Button
            variant="sol"
            onClick={() => {
              alDenunciar(motivo);
              onOpenChange(false);
              setDetalle("");
            }}
          >
            Enviar denuncia
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
