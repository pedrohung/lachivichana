import { createServerFn } from "@tanstack/react-start";
import { leerUrl } from "./pocketbase";

// Busqueda de personas: solo usuarios autenticados.
// Consulta la coleccion publica "profiles" (alias, bio, avatar) con el token
// del propio usuario. NUNCA toca la coleccion "users": emails, hashes y
// tokens quedan fuera de su alcance (migraciones 1789927200 y 1790072188).

export type PersonaPublica = {
  id: string; // id del usuario (profiles.user)
  alias: string;
  bio: string;
  avatarUrl: string | null;
};

function limpiarBusqueda(valor: string): string {
  return valor.replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 40);
}

function noAutorizado(): Response {
  return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
}

// Logica de busqueda como funcion plana: puede invocarse desde rutas API
// del servidor sin pasar por el mecanismo de server functions de TanStack.
export async function buscarPersonasDirecto(
  tokenSinLimpiar: string,
  qSinLimpiar: string,
): Promise<{ personas: PersonaPublica[] }> {
  const token = (tokenSinLimpiar ? String(tokenSinLimpiar) : "").trim();
  const q = limpiarBusqueda(qSinLimpiar ? String(qSinLimpiar) : "");
  const base = leerUrl();
  const deEntorno = typeof process === 'undefined' ? '' : (process.env.POCKETBASE_URL || '');
  const baseServidor = base.startsWith('http') ? base : (deEntorno || 'http://127.0.0.1:8096');
  if (!token) throw noAutorizado();
  if (q.length < 2) return { personas: [] as PersonaPublica[] };
  const refresco = await fetch(baseServidor + "/api/collections/users/auth-refresh", {
    method: "POST",
    headers: { Authorization: token },
  });
  if (!refresco.ok) throw noAutorizado();
  const filtro = "alias ~ \"" + q + "\" && alias != \"\"";
  const params = new URLSearchParams({ filter: filtro, perPage: "12", fields: "id,user,alias,bio,avatar" });
  const res = await fetch(baseServidor + "/api/collections/profiles/records?" + params.toString(), { headers: { Authorization: token } });
  if (!res.ok) throw new Response(JSON.stringify({ error: "Error" }), { status: 502 });
  const datos = await res.json();
  const personas: PersonaPublica[] = (datos.items || []).map((p: any) => ({
    id: String(p.user || ""),
    alias: String(p.alias || ""),
    bio: String(p.bio || ""),
    avatarUrl: p.avatar ? base + "/api/files/profiles/" + p.id + "/" + p.avatar : null,
  })).filter((p: PersonaPublica) => p.id && p.alias);
  return { personas };
}

export const buscarPersonas = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { token: string; q: string } }) => {
    return buscarPersonasDirecto(data && data.token ? data.token : "", data && data.q ? data.q : "");
  }
);
