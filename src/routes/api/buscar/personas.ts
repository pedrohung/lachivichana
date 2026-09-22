import { createFileRoute } from "@tanstack/react-router";
import { buscarPersonas } from "@/lib/personas.server";

/**
 * GET /api/buscar/personas?q=
 *
 * Busqueda de personas por alias (parcial, insensible a mayusculas).
 * Requiere cabecera: Authorization: Bearer <token de PocketBase>.
 *
 * - 401 si no hay token o no es valido.
 * - 200 con { personas: [{ id, alias, bio, avatarUrl }] }.
 *
 * Solo devuelve campos publicos de la coleccion "profiles"; nunca expone
 * emails ni datos de la coleccion "users".
 */
export const Route = createFileRoute("/api/buscar/personas")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const url = new URL(request.url);
        const q = url.searchParams.get("q") ?? "";
        try {
          return Response.json(await buscarPersonas({ data: { token, q } }));
        } catch (error) {
          if (error instanceof Response) return error;
          throw error;
        }
      },
    },
  },
});
