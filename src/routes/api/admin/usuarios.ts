import { createFileRoute } from "@tanstack/react-router";
import { listarUsuariosAdmin } from "@/lib/admin.server";

/**
 * GET /api/admin/usuarios
 * Endpoint HTTP explicito para verificacion y administracion.
 * Requiere cabecera: Authorization: Bearer <token de PocketBase>.
 * - 401 si no hay token o no es valido.
 * - 403 si el usuario no es el admin.
 * - 200 con { items } si es el admin.
 */
export const Route = createFileRoute("/api/admin/usuarios")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        try {
          const resultado = await listarUsuariosAdmin({ data: { token } });
          return Response.json(resultado);
        } catch (error) {
          if (error instanceof Response) return error;
          throw error;
        }
      },
    },
  },
});
