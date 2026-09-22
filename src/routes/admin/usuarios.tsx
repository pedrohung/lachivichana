import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert, Users } from "lucide-react";
import { MarcoApp } from "@/components/app/MarcoApp";
import { useSesion } from "@/estado/sesion";
import { obtenerPocketBase } from "@/lib/pocketbase";
import { esAdmin } from "@/lib/admin";
import { listarUsuariosAdmin, type UsuarioAdmin } from "@/lib/admin.server";

export const Route = createFileRoute("/admin/usuarios")({
  component: PaginaAdminUsuarios,
});

// Umbral de "en línea": última conexión hace menos de 5 minutos.
const UMBRAL_EN_LINEA_MS = 5 * 60 * 1000;

function formatearFecha(iso: string | null): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function enLinea(ultima: string | null, ahora: number): boolean {
  if (!ultima) return false;
  const t = new Date(ultima).getTime();
  return !Number.isNaN(t) && ahora - t < UMBRAL_EN_LINEA_MS;
}

function PaginaAdminUsuarios() {
  const { usuario, cargando } = useSesion();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const esAdministrador = esAdmin(usuario?.email);

  useEffect(() => {
    if (cargando || !esAdministrador) return;
    let activo = true;
    const token = obtenerPocketBase()?.authStore.token || "";
    listarUsuariosAdmin({ data: { token } })
      .then((res) => {
        if (activo) setUsuarios(res.items);
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar la lista de usuarios.");
      });
    const reloj = setInterval(() => setAhora(Date.now()), 30000);
    return () => {
      activo = false;
      clearInterval(reloj);
    };
  }, [cargando, esAdministrador]);

  if (cargando) {
    return (
      <MarcoApp>
        <main className="mx-auto w-full max-w-5xl px-4 py-10">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </main>
      </MarcoApp>
    );
  }

  if (!esAdministrador) {
    return (
      <MarcoApp>
        <main className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <h1 className="texto-display mt-3 text-xl font-bold">Acceso denegado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta sección es solo para la administración de La Chivichana.
            </p>
            <Link to="/" className="mt-4 inline-block text-sm font-semibold underline">
              Volver al inicio
            </Link>
          </div>
        </main>
      </MarcoApp>
    );
  }

  const total = usuarios ? usuarios.length : 0;
  const enLineaAhora = usuarios ? usuarios.filter((u) => enLinea(u.lastSeen, ahora)).length : 0;

  return (
    <MarcoApp>
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="texto-display text-2xl font-bold">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              {usuarios ? total + " cuentas registradas (" + enLineaAhora + " en línea)" : "Cargando cuentas…"}
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !usuarios ? (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Cargando usuarios…</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Alias</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Fecha de registro</th>
                  <th className="px-4 py-3 font-semibold">Última conexión</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const linea = enLinea(u.lastSeen, ahora);
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-semibold">{u.username || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatearFecha(u.created)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatearFecha(u.lastSeen)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "mr-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
                            (linea ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground")
                          }
                        >
                          <span
                            className={"h-1.5 w-1.5 rounded-full " + (linea ? "bg-emerald-500" : "bg-muted-foreground/50")}
                          />
                          {linea ? "En línea" : "Inactivo"}
                        </span>
                        {!u.verified && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Sin verificar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </MarcoApp>
  );
}
