import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

import hero from "@/assets/chivichana-hero.jpg";
import { Logo } from "@/components/marca/Logo";
import { FRASES_MARTI, FraseMarti } from "@/components/marca/FrasesMarti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entra en La Chivichana" },
      {
        name: "description",
        content:
          "Accede a La Chivichana: tu comunidad, tus ideas y tus caminos. Tu identidad pública la decides tú.",
      },
      { property: "og:title", content: "Entra en La Chivichana" },
      {
        property: "og:description",
        content: "Tu comunidad, tus ideas y tus caminos.",
      },
    ],
  }),
  component: Entrar,
});

type Estado =
  | { tipo: "inactivo" }
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "bloqueo"; mensaje: string }
  | { tipo: "recuperacion"; mensaje: string }
  | { tipo: "exito"; mensaje: string };

function Entrar() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [estado, setEstado] = useState<Estado>({ tipo: "inactivo" });
  const [intentos, setIntentos] = useState(0);

  const cargando = estado.tipo === "cargando";

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !clave.trim()) {
      setEstado({
        tipo: "error",
        mensaje: "Nos falta un dato. Escribe tu correo o teléfono y tu contraseña.",
      });
      return;
    }
    setEstado({ tipo: "cargando" });
    await new Promise((r) => setTimeout(r, 900));

    if (clave.length < 6) {
      const siguientes = intentos + 1;
      setIntentos(siguientes);
      if (siguientes >= 3) {
        setEstado({
          tipo: "bloqueo",
          mensaje:
            "Por tu seguridad hemos pausado el acceso unos minutos. Puedes recuperar tu contraseña mientras tanto.",
        });
        return;
      }
      setEstado({
        tipo: "error",
        mensaje: "Esos datos no coinciden. Revísalos con calma e inténtalo otra vez.",
      });
      return;
    }

    setIntentos(0);
    setEstado({ tipo: "exito", mensaje: "¡Bienvenido de vuelta! Preparando El Malecón…" });
  }

  function recuperar() {
    setEstado({
      tipo: "recuperacion",
      mensaje: usuario.trim()
        ? `Si ${usuario.trim()} está registrado, te enviaremos un enlace para volver a entrar.`
        : "Escribe tu correo o teléfono y te enviaremos un enlace para volver a entrar.",
    });
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.9fr_1fr]">
      {/* Área visual principal */}
      <section className="superficie-mar relative isolate overflow-hidden px-6 py-10 sm:px-10 lg:flex lg:flex-col lg:justify-between lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] veta-madera"
        />
        <Logo tono="claro" className="relative z-10" />

        <div className="relative z-10 mx-auto mt-8 w-full max-w-5xl lg:mt-0">
          <div className="relative overflow-hidden rounded-3xl border border-crema/15 shadow-[var(--shadow-alta)]">
            <img
              src={hero}
              alt="Chivichana artesanal de madera con la bandera cubana desgastada, sobre el mapa de Cuba, junto a una palma y una cuerda"
              width={1536}
              height={1152}
              className="h-full w-full object-contain"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[oklch(0.2_0.07_255)] via-[oklch(0.2_0.07_255)]/70 to-transparent"
            />
            <p className="texto-display absolute inset-x-0 bottom-0 p-5 text-center text-lg font-semibold text-crema sm:text-2xl">
              Cuba se conecta. Cuba se ayuda. Cuba avanza.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FRASES_MARTI.map((frase) => (
              <FraseMarti key={frase} texto={frase} />
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-8 text-sm text-crema/70">
          La comunidad donde los cubanos se conectan, se expresan, emprenden y se ayudan.
        </p>
      </section>

      {/* Panel de acceso */}
      <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Logo variant="compacto" />
          <h1 className="texto-display mt-6 text-3xl font-bold text-foreground">
            Entra en La Chivichana
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu comunidad, tus ideas y tus caminos.
          </p>

          <form onSubmit={enviar} className="mt-7 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="usuario">Correo electrónico o teléfono</Label>
              <Input
                id="usuario"
                autoComplete="username"
                placeholder="tucorreo@ejemplo.cu"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <div className="relative">
                <Input
                  id="clave"
                  type={verClave ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-11"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label htmlFor="recordar" className="flex items-center gap-2 text-sm font-normal">
                <Checkbox id="recordar" defaultChecked />
                Recordarme
              </Label>
              <button
                type="button"
                onClick={recuperar}
                className="text-sm font-medium text-accent-foreground underline underline-offset-4 hover:text-primary"
              >
                Olvidé mi contraseña
              </button>
            </div>

            <Mensaje estado={estado} />

            <Button type="submit" variant="sol" size="lg" className="w-full" disabled={cargando}>
              {cargando && <Loader2 className="size-4 animate-spin" />}
              {cargando ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs tracking-widest text-muted-foreground uppercase">o</span>
            <Separator className="flex-1" />
          </div>

          <Button asChild variant="contorno" size="lg" className="w-full">
            <Link to="/registro">Crear mi cuenta</Link>
          </Button>

          <div className="mt-7 rounded-xl border border-border bg-secondary/60 p-4">
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-turquesa" />
              Tu identidad pública la decides tú. Participa con tu alias, con tu nombre o desde el
              perfil de tu negocio.
            </p>
          </div>

          <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link to="/privacidad" className="underline underline-offset-4 hover:text-foreground">
              Privacidad
            </Link>
            <Link to="/normas" className="underline underline-offset-4 hover:text-foreground">
              Normas de convivencia
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Mensaje({ estado }: { estado: Estado }) {
  if (estado.tipo === "inactivo" || estado.tipo === "cargando") return null;

  const esBueno = estado.tipo === "exito" || estado.tipo === "recuperacion";
  const Icono = esBueno ? CheckCircle2 : AlertCircle;

  return (
    <p
      role="status"
      className={
        esBueno
          ? "flex gap-2 rounded-xl border border-turquesa/40 bg-secondary p-3 text-sm text-secondary-foreground"
          : "flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
      }
    >
      <Icono className="mt-0.5 size-4 shrink-0" />
      {estado.mensaje}
    </p>
  );
}