import { createFileRoute } from "@tanstack/react-router";
import { PaginaTexto } from "@/components/marca/PaginaTexto";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad — La Chivichana" },
      {
        name: "description",
        content:
          "Qué datos son privados y cuáles públicos en La Chivichana. Tu identidad pública la decides tú.",
      },
      { property: "og:title", content: "Privacidad — La Chivichana" },
      { property: "og:description", content: "Tu identidad pública la decides tú." },
    ],
  }),
  component: () => (
    <PaginaTexto
      titulo="Privacidad"
      entrada="Tu identidad pública la decides tú. Participa con tu alias, con tu nombre o desde el perfil de tu negocio."
      bloques={[
        {
          titulo: "Nunca es público",
          puntos: [
            "Correo electrónico y teléfono privados.",
            "Fecha completa de nacimiento.",
            "Documentos de identidad.",
            "Dirección exacta y ubicación precisa.",
            "Datos de familiares e historial privado de acceso.",
          ],
        },
        {
          titulo: "Tú eliges en cada publicación",
          puntos: [
            "Publicar como tu alias, con tu nombre o como tu negocio.",
            "Quién puede verlo: toda la comunidad, tus conexiones, un grupo o personas concretas.",
            "Vista previa de la identidad antes de publicar.",
            "Aviso preventivo si el contenido parece incluir datos sensibles.",
          ],
        },
        {
          titulo: "Promotores y beneficiarios",
          puntos: [
            "No mostramos direcciones, rutas ni localización exacta.",
            "No mostramos documentos ni datos de beneficiarios.",
            "Identidad protegida por defecto.",
          ],
        },
      ]}
      nota="No prometemos anonimato absoluto: hablamos de identidad protegida e información personal no visible."
    />
  ),
});
