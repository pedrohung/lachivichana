import { createServerFn } from "@tanstack/react-start";
import { ADMIN_EMAIL } from "./admin";

// PocketBase visto desde el servidor: Nitro y PocketBase corren en el mismo contenedor.
const PB_URL = process.env.PB_INTERNAL_URL || "http://127.0.0.1:8096";

export interface UsuarioAdmin {
  id: string;
  username: string;
  email: string;
  created: string;
  lastSeen: string | null;
  verified: boolean;
}

function denegar(mensaje: string, estado: number): never {
  throw new Response(JSON.stringify({ error: mensaje }), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Lista todos los usuarios registrados. SOLO CuquiPro (ADMIN_EMAIL).
 * Verifica en el SERVIDOR que el token aportado pertenece al admin
 * (auth-refresh contra PocketBase + comparación de email).
 * 401 si no hay token válido, 403 si no es el admin.
 * La respuesta solo incluye campos no sensibles (nunca hashes ni tokens).
 */
export const listarUsuariosAdmin = createServerFn({ method: "POST" })
  .inputValidator((datos: unknown) => {
    const token = (datos as { token?: unknown } | null)?.token;
    return { token: typeof token === "string" ? token : "" };
  })
  .handler(async ({ data }) => {
    if (!data.token) denegar("No autenticado", 401);

    let emailAutenticado = "";
    try {
      const res = await fetch(PB_URL + "/api/collections/users/auth-refresh", {
        method: "POST",
        headers: { Authorization: data.token },
      });
      if (!res.ok) denegar("No autenticado", 401);
      const cuerpo = (await res.json()) as { record?: { email?: string } };
      emailAutenticado = cuerpo.record && cuerpo.record.email ? cuerpo.record.email : "";
    } catch (error) {
      if (error instanceof Response) throw error;
      denegar("No autenticado", 401);
    }
    if (emailAutenticado.toLowerCase() !== ADMIN_EMAIL) {
      denegar("Acceso denegado", 403);
    }

    // La regla listRule de PocketBase también limita el listado al admin (defensa en profundidad).
    const url =
      PB_URL +
      "/api/collections/users/records?perPage=500&sort=-lastSeen&fields=id,username,email,created,lastSeen,verified";
    const lista = await fetch(url, { headers: { Authorization: data.token } });
    if (!lista.ok) denegar("No se pudo obtener la lista de usuarios", 502);
    const datos = (await lista.json()) as { items?: UsuarioAdmin[] };
    const items = Array.isArray(datos.items) ? datos.items : [];
    return {
      items: items.map((u) => ({
        id: u.id,
        username: u.username || "",
        email: u.email || "",
        created: u.created || "",
        lastSeen: u.lastSeen || null,
        verified: !!u.verified,
      })),
    };
  });
