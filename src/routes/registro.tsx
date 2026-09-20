import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentProps } from "react";
import { Check, Eye, EyeOff, Lock, Globe } from "lucide-react";

import { Logo } from "@/components/marca/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useSesion } from "@/estado/sesion";
import { PATRON_ALIAS } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear mi cuenta en La Chivichana" },
      {
        name: "description",
        content:
          "Crea tu cuenta paso a paso: datos privados, alias público, visibilidad e intereses. Tú decides qué se ve.",
      },
      { property: "og:title", content: "Crear mi cuenta en La Chivichana" },
      { property: "og:description", content: "Tú decides qué es privado y qué es público." },
    ],
  }),
  component: Registro,
});

const PASOS = [
  "Datos privados",
  "Tu alias",
  "Visibilidad",
  "Intereses",
  "Comunidad",
  "Normas",
  "Confirmar",
];

const INTERESES = [
  "Emprendimiento",
  "Empleo",
  "Ayuda humanitaria",
  "Cultura cubana",
  "Tecnología",
  "Salud",
  "Educación",
  "Debate y opinión",
  "Deporte",
  "Agricultura",
];

const VISIBILIDADES = [
  { id: "alias", titulo: "Solo con mi alias", texto: "Nadie ve tu nombre real." },
  { id: "alias-datos", titulo: "Alias y algunos datos", texto: "Alias más lo que tú elijas." },
  {
    id: "nombre",
    titulo: "Nombre real y datos parciales",
    texto: "Tu nombre y una parte de tu biografía.",
  },
  { id: "completo", titulo: "Perfil público completo", texto: "Todo lo que decidas compartir." },
];

function Registro() {
  const [paso, setPaso] = useState(0);
  const [verClave, setVerClave] = useState(false);
  const [alias, setAlias] = useState("");
  const [nombre, setNombre] = useState("");
  const [visibilidad, setVisibilidad] = useState("alias");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [pais, setPais] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [exito, setExito] = useState(false);
  const { registrar } = useSesion();

  const ultimo = paso === PASOS.length - 1;

  async function manejarRegistro() {
    setError(null);
    const aliasLimpio = alias.trim();
    if (!PATRON_ALIAS.test(aliasLimpio)) {
      setError("El alias solo puede contener letras, números, guion, guion bajo y punto.");
      setPaso(1);
      return;
    }
    if (!correo.trim() || clave.length < 8) {
      setError("Escribe tu correo y una contraseña de al menos 8 caracteres.");
      setPaso(0);
      return;
    }
    setCreando(true);
    try {
      await registrar({ alias: aliasLimpio, correo: correo.trim(), contrasena: clave });
      setExito(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos crear tu cuenta. Inténtalo de nuevo.");
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/entrar" className="text-sm text-muted-foreground hover:text-foreground">
            Ya tengo cuenta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}
        </p>
        <Progress value={((paso + 1) / PASOS.length) * 100} className="mt-3 h-2" />

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-madera)] sm:p-8">
          {paso === 0 && (
            <section className="space-y-5">
              <Encabezado
                titulo="Tus datos de acceso"
                texto="Esta información es privada. No se muestra en tu perfil público."
                privado
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nombre y apellidos" value={nombre} onChange={setNombre} />
                <Campo
                  label="Correo electrónico"
                  type="email"
                  value={correo}
                  onChange={setCorreo}
                />
                <Campo label="País de residencia" value={pais} onChange={setPais} />
                <Campo label="Fecha de nacimiento" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clave">Contraseña segura</Label>
                <div className="relative">
                  <Input
                    id="clave"
                    type={verClave ? "text" : "password"}
                    className="pr-11"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave((v) => !v)}
                    aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </section>
          )}

          {paso === 1 && (
            <section className="space-y-5">
              <Encabezado
                titulo="Crea tu alias público"
                texto="Así te verá la comunidad. Es obligatorio y puedes cambiarlo más adelante."
              />
              <Campo
                label="Alias público"
                value={alias}
                onChange={setAlias}
                placeholder="ej. ManoDelBarrio"
              />
              <Campo
                label="Biografía pública (opcional)"
                placeholder="Cuenta en una línea quién eres"
              />
            </section>
          )}

          {paso === 2 && (
            <section className="space-y-5">
              <Encabezado
                titulo="¿Cómo quieres aparecer?"
                texto="Nunca mostramos tu correo, tu teléfono, tu dirección ni tus documentos."
              />
              <div className="grid gap-3">
                {VISIBILIDADES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVisibilidad(v.id)}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-colors",
                      visibilidad === v.id
                        ? "border-turquesa bg-secondary"
                        : "border-border hover:border-turquesa/50",
                    )}
                  >
                    <span className="block font-semibold text-foreground">{v.titulo}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{v.texto}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {paso === 3 && (
            <section className="space-y-5">
              <Encabezado
                titulo="¿Qué te interesa?"
                texto="Nos ayuda a mostrarte lo que importa."
              />
              <div className="flex flex-wrap gap-2">
                {INTERESES.map((i) => {
                  const activo = intereses.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setIntereses((prev) =>
                          activo ? prev.filter((x) => x !== i) : [...prev, i],
                        )
                      }
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        activo
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border hover:border-turquesa",
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {paso === 4 && (
            <section className="space-y-5">
              <Encabezado
                titulo="Tu país o comunidad"
                texto="Solo mostramos una zona general, nunca tu ubicación exacta."
              />
              <Campo
                label="País o comunidad"
                value={pais}
                onChange={setPais}
                placeholder="Cuba · La Habana"
              />
            </section>
          )}

          {paso === 5 && (
            <section className="space-y-5">
              <Encabezado
                titulo="Normas de convivencia"
                texto="Aquí se critican ideas, decisiones e instituciones. No se amenaza, acosa ni expone a personas."
              />
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {[
                  "Respeto a quien piensa distinto.",
                  "Pluralismo político y solidaridad sin requisitos ideológicos.",
                  "Prohibido amenazar, acosar, perseguir o revelar datos privados.",
                  "Participación cívica pacífica y dignidad plena de cada persona.",
                ].map((n) => (
                  <li key={n} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                    {n}
                  </li>
                ))}
              </ul>
              <Label htmlFor="acepta" className="flex items-center gap-2 text-sm font-normal">
                <Checkbox
                  id="acepta"
                  checked={acepta}
                  onCheckedChange={(v) => setAcepta(v === true)}
                />
                Acepto las normas de convivencia y la política de privacidad.
              </Label>
            </section>
          )}

          {paso === 6 && (
            <section className="space-y-5">
              <Encabezado
                titulo="Así te verá la comunidad"
                texto="Revisa tu perfil público antes de terminar."
              />
              <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {(alias || "C").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {visibilidad === "alias"
                        ? alias || "Tu alias"
                        : nombre || alias || "Tu nombre"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {pais || "País por definir"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Correo, teléfono, fecha completa de nacimiento y
                  documentos: privados.
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="size-3.5" /> Público: alias, foto, biografía e intereses que
                  elijas.
                </p>
              </div>
            </section>
          )}

          {error && (
            <p className="mt-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {exito && (
            <p className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm">
              ¡Cuenta creada! Ya puedes entrar con tu correo o alias.
            </p>
          )}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setPaso((p) => Math.max(0, p - 1))}
              disabled={paso === 0}
            >
              Atrás
            </Button>
            {ultimo ? (
              <Button
                variant="sol"
                size="lg"
                disabled={!acepta || creando}
                onClick={manejarRegistro}
              >
                <Check className="size-4" /> {creando ? "Creando tu cuenta…" : "Crear mi cuenta"}
              </Button>
            ) : (
              <Button
                variant="mar"
                size="lg"
                onClick={() => setPaso((p) => Math.min(PASOS.length - 1, p + 1))}
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Encabezado({
  titulo,
  texto,
  privado,
}: {
  titulo: string;
  texto: string;
  privado?: boolean;
}) {
  return (
    <div>
      {privado && (
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <Lock className="size-3" /> Privado
        </span>
      )}
      <h1 className="texto-display text-2xl font-bold text-foreground sm:text-3xl">{titulo}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange">) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange?.(e.target.value)} {...props} />
    </div>
  );
}
