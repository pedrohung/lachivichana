import { useCallback, useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Loader2, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/app/Avatar";
import { MarcoApp } from "@/components/app/MarcoApp";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { esPeticionCancelada } from "@/datos/errores";
import {
  dejarDeSeguirPorAlias,
  listarCaminos,
  seguirPorAlias,
  type Contacto,
} from "@/datos/servicios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mis-caminos")({
  head: () => ({
    meta: [
      { title: "Mis Caminos — La Chivichana" },
      {
        name: "description",
        content: "A quién sigues y quién te sigue en La Chivichana.",
      },
      { property: "og:title", content: "Mis Caminos — La Chivichana" },
      {
        property: "og:description",
        content: "Tus conexiones y seguidores en la comunidad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MisCaminosPage,
});

type Pestana = "siguiendo" | "seguidores";

function MisCaminosPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Mis Caminos">
        <ContenidoCaminos />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ContenidoCaminos() {
  const [pestana, setPestana] = useState<Pestana>("siguiendo");
  const [siguiendo, setSiguiendo] = useState<Contacto[]>([]);
  const [seguidores, setSeguidores] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [accionando, setAccionando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarCaminos();
      setSiguiendo(datos.siguiendo);
      setSeguidores(datos.seguidores);
      setErrorCarga("");
    } catch (error) {
      if (esPeticionCancelada(error)) return;
      setErrorCarga("No se pudieron cargar tus caminos. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar, intentos]);

  const alternar = async (contacto: Contacto) => {
    const dejar = contacto.relacion === "siguiendo" || contacto.relacion === "mutuo";
    setAccionando(contacto.alias);
    try {
      if (dejar) {
        await dejarDeSeguirPorAlias(contacto.alias);
        toast.success(`Dejaste de seguir a @${contacto.alias}`);
      } else {
        await seguirPorAlias(contacto.alias);
        toast.success(`Ahora sigues a @${contacto.alias}`);
      }
      await cargar();
    } catch (error) {
      if (esPeticionCancelada(error)) return;
      toast.error("No se pudo actualizar el seguimiento. Inténtalo de nuevo.");
    } finally {
      setAccionando(null);
    }
  };

  const lista = pestana === "siguiendo" ? siguiendo : seguidores;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="texto-display text-2xl font-bold text-primary">Mis Caminos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A quién sigues y quién te sigue en la comunidad.
        </p>
      </header>

      <div role="tablist" aria-label="Mis caminos" className="flex gap-2">
        {(
          [
            { clave: "siguiendo", etiqueta: "Siguiendo", total: siguiendo.length },
            { clave: "seguidores", etiqueta: "Seguidores", total: seguidores.length },
          ] as { clave: Pestana; etiqueta: string; total: number }[]
        ).map((t) => (
          <button
            key={t.clave}
            type="button"
            role="tab"
            aria-selected={pestana === t.clave}
            onClick={() => setPestana(t.clave)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              pestana === t.clave
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t.etiqueta} ({t.total})
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : errorCarga ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="texto-display text-lg font-bold text-primary">
            No se pudieron cargar tus caminos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorCarga}</p>
          <Button
            variant="contorno"
            size="sm"
            className="mt-4"
            onClick={() => setIntentos((n) => n + 1)}
          >
            <RefreshCw aria-hidden="true" /> Reintentar
          </Button>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
            <Users aria-hidden="true" />
          </span>
          <p className="texto-display mt-3 font-bold text-primary">
            {pestana === "siguiendo" ? "Aún no sigues a nadie" : "Aún no te sigue nadie"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {pestana === "siguiendo"
              ? "Explora El Malecón y El Mercadito para encontrar gente de la comunidad."
              : "Comparte tus publicaciones y anuncios para que la comunidad te encuentre."}
          </p>
          <Button asChild variant="sol" size="sm" className="mt-4">
            <Link to="/malecon">Explorar El Malecón</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((contacto) => (
            <li key={contacto.alias}>
              <TarjetaContacto
                contacto={contacto}
                accionando={accionando === contacto.alias}
                onAlternar={() => void alternar(contacto)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TarjetaContacto({
  contacto,
  accionando,
  onAlternar,
}: {
  contacto: Contacto;
  accionando: boolean;
  onAlternar: () => void;
}) {
  const dejar = contacto.relacion === "siguiendo" || contacto.relacion === "mutuo";

  return (
    <article className="flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Link
        to="/perfil/$alias"
        params={{ alias: contacto.alias }}
        aria-label={`Ver el perfil de ${contacto.nombreVisible}`}
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Avatar src={contacto.avatar} nombre={contacto.nombreVisible} tamano="lg" />
      </Link>
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Link
            to="/perfil/$alias"
            params={{ alias: contacto.alias }}
            className="truncate rounded hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {contacto.nombreVisible}
          </Link>
          {contacto.relacion === "mutuo" && (
            <BadgeCheck
              aria-label="Se siguen mutuamente"
              className="h-4 w-4 shrink-0 text-turquesa"
            />
          )}
        </h2>
        <p className="truncate text-xs text-muted-foreground">@{contacto.alias}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{contacto.detalle}</p>
      </div>
      <Button
        variant={dejar ? "contorno" : "sol"}
        size="sm"
        onClick={onAlternar}
        disabled={accionando}
        className="shrink-0"
      >
        {accionando && <Loader2 aria-hidden="true" className="animate-spin" />}
        {dejar ? "Dejar de seguir" : "Seguir"}
      </Button>
    </article>
  );
}
