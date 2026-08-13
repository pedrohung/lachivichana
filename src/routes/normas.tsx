import { createFileRoute } from "@tanstack/react-router";
import { PaginaTexto } from "@/components/marca/PaginaTexto";

export const Route = createFileRoute("/normas")({
  head: () => ({
    meta: [
      { title: "Normas de convivencia — La Chivichana" },
      {
        name: "description",
        content:
          "Criticar ideas, decisiones e instituciones está permitido. Amenazar, acosar o exponer a personas, no.",
      },
      { property: "og:title", content: "Normas de convivencia — La Chivichana" },
      {
        property: "og:description",
        content: "Respeto entre quienes piensan distinto y dignidad plena de cada persona.",
      },
    ],
  }),
  component: () => (
    <PaginaTexto
      titulo="Normas de convivencia"
      entrada="La Chivichana defiende la libertad de expresión con respeto. Aquí se critican ideas; no se persigue a personas."
      bloques={[
        {
          titulo: "Está permitido",
          puntos: [
            "Criticar ideas, decisiones, instituciones y gobiernos.",
            "Debatir con pluralismo político y sin requisitos ideológicos.",
            "Organizar ayuda, emprendimiento y participación cívica pacífica.",
          ],
        },
        {
          titulo: "Está prohibido",
          puntos: [
            "Amenazar, acosar o perseguir a una persona.",
            "Revelar información privada de otros.",
            "Suplantar identidades o simular verificaciones.",
            "Llamados a la violencia o al odio.",
          ],
        },
        {
          titulo: "Nuestro compromiso",
          puntos: [
            "Solidaridad sin condiciones ideológicas.",
            "Cultura e identidad cubanas con elegancia, no como propaganda.",
            "Dignidad plena de cada persona.",
          ],
        },
      ]}
    />
  ),
});
