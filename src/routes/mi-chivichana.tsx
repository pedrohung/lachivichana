import { useCallback, useEffect, useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/app/Avatar";
import { MarcoApp } from "@/components/app/MarcoApp";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { InsigniaVerificado } from "@/components/mercadito/Reputacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  actualizarMiPerfil,
  miAlias,
  obtenerArticulosPorVendedor,
  obtenerPerfilPorAlias,
  type PerfilPublico,
} from "@/datos/servicios";
import { useSesion } from "@/estado/sesion";

export const Route = createFileRoute("/mi-chivichana")({
  head: () => ({
    meta: [
      { title: "Mi Chivichana — La Chivichana" },
      {
        name: "description",
        content: "Tu perfil público y tus datos privados, siempre separados.",
      },
      { property: "og:title", content: "Mi Chivichana — La Chivichana" },
      {
        property: "og:description",
        content: "Tu perfil público y tus datos privados, siempre separados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiChivichanaPage,
});

function MiChivichanaPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Mi Chivichana">
        <ContenidoMiChivichana />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ContenidoMiChivichana() {
  const { usuario, salir } = useSesion();
  const navegar = useNavigate();
  const alias = miAlias();

  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [anuncios, setAnuncios] = useState(0);
  const [errorCarga, setErrorCarga] = useState("");

  const [nombre, setNombre] = useState("");
  const [bio, setBio] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    if (!alias) {
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      const [p, articulos] = await Promise.all([
        obtenerPerfilPorAlias(alias),
        obtenerArticulosPorVendedor(alias).catch(() => []),
      ]);
      if (p) {
        setPerfil(p);
        setNombre(p.nombreVisible);
        setBio(p.bio);
        setErrorCarga("");
      }
      setAnuncios(articulos.length);
    } catch (error) {
      setErrorCarga(error instanceof Error ? error.message : "No se pudo cargar tu perfil.");
    } finally {
      setCargando(false);
    }
  }, [alias]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Vista previa del avatar elegido (se libera al cambiar o desmontar).
  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const elegido = e.target.files?.[0];
    if (elegido) setArchivo(elegido);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const datos: { nombre?: string; bio?: string } = { bio };
      const nombreLimpio = nombre.trim();
      if (nombreLimpio) datos.nombre = nombreLimpio;
      await actualizarMiPerfil(datos, archivo ?? undefined);
      toast.success("Tu perfil quedó actualizado");
      setArchivo(null);
      if (inputArchivo.current) inputArchivo.current.value = "";
      await cargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    salir();
    toast.success("Sesión cerrada. Nos vemos pronto.");
    navegar({ to: "/" });
  };

  if (cargando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (errorCarga && !perfil) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="texto-display text-lg font-bold text-primary">No se pudo cargar tu perfil</p>
        <p className="mt-1 text-sm text-muted-foreground">{errorCarga}</p>
        <Button variant="contorno" size="sm" className="mt-4" onClick={() => void cargar()}>
          <RefreshCw aria-hidden="true" /> Reintentar
        </Button>
      </div>
    );
  }

  const verificado = perfil?.insignias.includes("verificado") ?? false;
  const avatarMostrado = vistaPrevia ?? perfil?.avatar ?? "";

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative">
              <Avatar
                src={avatarMostrado}
                nombre={nombre || perfil?.nombreVisible || alias || "yo"}
                tamano="xl"
              />
              <button
                type="button"
                onClick={() => inputArchivo.current?.click()}
                aria-label="Cambiar foto de perfil"
                className="absolute -right-1 -bottom-1 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-primary shadow-sm transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Camera aria-hidden="true" className="h-4 w-4" />
              </button>
              <input
                ref={inputArchivo}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={elegirArchivo}
                aria-label="Elegir foto de perfil"
              />
            </div>
            <div className="min-w-0">
              <h1 className="texto-display flex flex-wrap items-center gap-2 text-2xl font-bold text-primary">
                <span className="truncate">{perfil?.nombreVisible ?? "Mi perfil"}</span>
                {verificado && <InsigniaVerificado />}
              </h1>
              <p className="text-sm text-muted-foreground">
                @{alias}
                {usuario?.email && (
                  <span className="block text-xs">Solo tú ves: {usuario.email}</span>
                )}
              </p>
            </div>
          </div>
          <Button variant="contorno" size="sm" onClick={cerrarSesion}>
            <LogOut aria-hidden="true" /> Cerrar sesión
          </Button>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-secondary/60 p-3 text-center">
            <dt className="text-xs text-muted-foreground">Seguidores</dt>
            <dd className="texto-display text-xl font-bold text-primary">
              {perfil?.seguidores ?? 0}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3 text-center">
            <dt className="text-xs text-muted-foreground">Seguidos</dt>
            <dd className="texto-display text-xl font-bold text-primary">
              {perfil?.seguidos ?? 0}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3 text-center">
            <dt className="text-xs text-muted-foreground">Mis anuncios</dt>
            <dd className="texto-display text-xl font-bold text-primary">{anuncios}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="sol" size="sm">
            <Link to="/mercadito/mis-publicaciones">Ver mis anuncios</Link>
          </Button>
          <Button asChild variant="contorno" size="sm">
            <Link to="/mis-caminos">Mis caminos</Link>
          </Button>
          {alias && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/perfil/$alias" params={{ alias }}>
                Ver mi perfil público
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="texto-display text-lg font-bold text-primary">Editar mi perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Esto es lo que ve la comunidad. Tu correo y tus datos privados no se muestran a nadie.
        </p>
        <form onSubmit={guardar} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nombre" className="text-sm font-medium text-foreground">
              Nombre visible
            </label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
              placeholder="Tu nombre o como te conocen"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Cuéntales a la comunidad quién eres, en qué andas…"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/280</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Foto de perfil</span>
            <p className="text-xs text-muted-foreground">
              {archivo
                ? `Elegiste: ${archivo.name}. Se guarda al pulsar "Guardar cambios".`
                : "Toca el icono de cámara sobre tu foto para elegir una nueva."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="sol" disabled={guardando}>
              {guardando && <Loader2 aria-hidden="true" className="animate-spin" />}
              Guardar cambios
            </Button>
            {archivo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setArchivo(null);
                  if (inputArchivo.current) inputArchivo.current.value = "";
                }}
              >
                Descartar foto
              </Button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
