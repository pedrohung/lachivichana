import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { useApp } from "@/components/app/contexto";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { FormularioArticulo } from "@/components/mercadito/FormularioArticulo";
import { crearArticulo, type DatosArticulo } from "@/datos/servicios";

export const Route = createFileRoute("/mercadito/publicar")({
  head: () => ({
    meta: [
      { title: "Publicar en El Mercadito — La Chivichana" },
      {
        name: "description",
        content:
          "Publica una venta, una donación, un intercambio o un servicio en El Mercadito de La Chivichana.",
      },
      { property: "og:title", content: "Publicar en El Mercadito" },
      { property: "og:description", content: "Comparte lo que ofreces con la comunidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicarMercaditoPage,
});

function PublicarMercaditoPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Publicar en El Mercadito">
        <FormularioPublicar />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function FormularioPublicar() {
  const navegar = useNavigate();
  const { identidad } = useApp();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="texto-display text-2xl font-bold text-primary">Publicar en El Mercadito</h1>
        <p className="text-sm text-muted-foreground">
          Publicas como <strong className="text-foreground">{identidad.nombreVisible}</strong>.
        </p>
      </header>
      <FormularioArticulo
        textoBoton="Publicar anuncio"
        alEnviar={async (datos: DatosArticulo, fotos: File[]) => {
          const creado = await crearArticulo(datos, fotos);
          toast.success("Publicamos tu anuncio");
          void navegar({ to: "/producto/$id", params: { id: creado.id } });
        }}
      />
    </div>
  );
}
