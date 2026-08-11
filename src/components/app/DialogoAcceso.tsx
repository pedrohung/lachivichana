import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "./contexto";

export function DialogoAcceso() {
  const { dialogoAbierto, cerrarDialogo } = useApp();

  return (
    <Dialog open={dialogoAbierto} onOpenChange={(abierto) => !abierto && cerrarDialogo()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="texto-display text-xl">
            Para esto hace falta una cuenta
          </DialogTitle>
          <DialogDescription>
            Puedes seguir mirando todo lo que quieras. Para reaccionar, comentar, guardar o
            publicar, entra con tu cuenta o crea una: tarda poco y decides tú qué se ve de ti.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button asChild variant="sol">
            <Link to="/registro">Crear mi cuenta</Link>
          </Button>
          <Button asChild variant="contorno">
            <Link to="/entrar">Entrar</Link>
          </Button>
          <Button variant="ghost" onClick={cerrarDialogo}>
            Seguir mirando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}