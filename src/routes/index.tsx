import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  HandHeart,
  Hammer,
  Users,
  ShieldCheck,
  MessageSquareQuote,
  Waves,
  Home,
  Route as RouteIcon,
  BadgeCheck,
  UserCog,
} from "lucide-react";

import hero from "@/assets/chivichana-hero.jpg";
import { AVISO_DEMO } from "@/datos/config";
import { Logo } from "@/components/marca/Logo";
import { FRASES_MARTI, FraseMarti } from "@/components/marca/FrasesMarti";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Chivichana — Cuba se conecta, se ayuda y crece" },
      {
        name: "description",
        content:
          "La comunidad donde los cubanos se conectan, se expresan, emprenden y se ayudan. Red social, mercado, empleo y ayuda humanitaria verificable.",
      },
      { property: "og:title", content: "La Chivichana" },
      {
        property: "og:description",
        content: "Cuba se conecta. Cuba se ayuda. Cuba crece.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "La Chivichana" },
      {
        name: "twitter:description",
        content: "Cuba se conecta. Cuba se ayuda. Cuba crece.",
      },
    ],
  }),
  component: Bienvenida,
});

const ESPACIOS = [
  {
    icono: Store,
    nombre: "El Mercadito",
    texto: "Ventas, intercambios, servicios y donaciones entre personas de confianza.",
  },
  {
    icono: HandHeart,
    nombre: "La Mano",
    texto: "Solicitudes y campañas de ayuda con seguimiento y entrega verificable.",
  },
  {
    icono: Hammer,
    nombre: "El Taller",
    texto: "Empleos, formación y oportunidades para crecer dentro y fuera de la Isla.",
  },
  {
    icono: Users,
    nombre: "La Colmena",
    texto: "Empresarios, profesionales y colaboradores que abren caminos juntos.",
  },
];

const SECCIONES = [
  { icono: Waves, nombre: "El Malecón", texto: "Muro principal" },
  { icono: Home, nombre: "Mi Barrio", texto: "Grupos y comunidades" },
  { icono: MessageSquareQuote, nombre: "La Esquina", texto: "Opinión y debate" },
  { icono: RouteIcon, nombre: "Mis Caminos", texto: "Contactos y conexiones" },
  { icono: BadgeCheck, nombre: "Los Promotores", texto: "Red acreditada de ayuda" },
  { icono: UserCog, nombre: "Mi Chivichana", texto: "Perfil y privacidad" },
];

function Bienvenida() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <Logo className="min-w-0" />
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/entrar">Entrar</Link>
            </Button>
            <Button asChild variant="sol" size="sm">
              <Link to="/registro">Crear mi cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="superficie-mar relative isolate overflow-hidden">
          <div
            aria-hidden
            className="veta-madera pointer-events-none absolute inset-0 -z-10 opacity-30"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_1.05fr] lg:py-20">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-sol uppercase">
                Para cubanos dentro y fuera de Cuba
              </p>
              <h1 className="texto-display mt-4 text-4xl leading-[1.05] font-bold text-balance text-crema sm:text-6xl">
                Cuba se conecta.
                <br />
                Cuba se ayuda.
                <br />
                <span className="text-sol">Cuba crece.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-crema/80 sm:text-lg">
                La comunidad donde los cubanos comparten su voz, encuentran oportunidades, emprenden
                y convierten la solidaridad en ayuda real. Participa con respeto y decide siempre
                cómo mostrar tu identidad.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="sol" size="lg">
                  <Link to="/registro">Crear mi cuenta</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="border-2 border-crema/30 text-crema hover:bg-crema/10 hover:text-crema"
                >
                  <Link to="/explorar">Explorar La Chivichana</Link>
                </Button>
              </div>
              <ul className="mt-7 grid gap-2 text-sm text-crema/85 sm:grid-cols-3">
                {[
                  "Tu identidad pública la decides tú",
                  "Ayudas con seguimiento verificable",
                  "Todas las ideas, un mismo respeto",
                ].map((garantia) => (
                  <li
                    key={garantia}
                    className="flex items-start gap-2 rounded-xl border border-crema/15 bg-crema/5 px-3 py-2"
                  >
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sol" aria-hidden />
                    <span>{garantia}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-3xl border border-crema/15 shadow-[var(--shadow-alta)]">
              <img
                src={hero}
                alt="Chivichana artesanal de madera con la bandera cubana desgastada, sobre el mapa de Cuba, junto a una palma y una cuerda"
                width={1536}
                height={1152}
                className="w-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* Espacios */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="texto-display text-3xl font-bold text-foreground sm:text-4xl">
            Una plataforma, muchos caminos
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cada espacio de La Chivichana tiene nombre propio, como los lugares donde nos
            encontramos de verdad.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ESPACIOS.map(({ icono: Icono, nombre, texto }) => (
              <article
                key={nombre}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-madera)] transition-transform hover:-translate-y-1"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Icono className="size-5" />
                </span>
                <h3 className="texto-display mt-4 text-xl font-semibold text-foreground">
                  {nombre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECCIONES.map(({ icono: Icono, nombre, texto }) => (
              <div
                key={nombre}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-secondary/40 px-4 py-3"
              >
                <Icono className="size-4 shrink-0 text-turquesa" />
                <span className="min-w-0 text-sm">
                  <span className="font-semibold text-foreground">{nombre}</span>{" "}
                  <span className="text-muted-foreground">· {texto}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Privacidad */}
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-turquesa/40 bg-background px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                <ShieldCheck className="size-3.5" /> Identidad protegida
              </span>
              <h2 className="texto-display mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Tú decides cómo presentarte
              </h2>
              <p className="mt-4 text-muted-foreground">
                Participa con tu alias, con tu nombre o desde el perfil de tu negocio. Tu correo, tu
                teléfono, tu dirección y tus documentos nunca son públicos.
              </p>
            </div>
            <ul className="grid gap-3 self-center">
              {[
                "Publica como alias, como persona o como negocio.",
                "Elige quién ve cada publicación: toda la comunidad, tus conexiones o un grupo.",
                "Te avisamos si tu texto parece incluir datos sensibles.",
                "La información privada está separada del perfil público.",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Impacto */}
        <section className="mx-auto grid max-w-6xl gap-5 px-5 py-16 sm:grid-cols-3">
          {[
            { dato: "2 orillas", texto: "Una sola comunidad, dentro y fuera de Cuba." },
            {
              dato: "3 formas de participar",
              texto: "Con tu alias, con tu nombre o como negocio.",
            },
            {
              dato: "1 mismo respeto",
              texto: "Ninguna ayuda dependerá de una posición ideológica.",
            },
          ].map(({ dato, texto }) => (
            <div key={dato} className="rounded-2xl border border-border bg-card p-6">
              <p className="texto-display text-3xl font-bold text-balance text-rojo">{dato}</p>
              <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
            </div>
          ))}
        </section>

        {/* Fundamento martiano */}
        <section className="superficie-mar">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="texto-display text-2xl font-semibold text-crema sm:text-3xl">
              Nuestro fundamento
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-crema/70">
              Los principios humanistas de José Martí son nuestra referencia moral: libertad de
              pensamiento, convivencia y dignidad plena.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {FRASES_MARTI.map((frase) => (
                <FraseMarti key={frase} texto={frase} />
              ))}
            </div>
          </div>
        </section>

        {/* Empresarios y promotores */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-7">
              <h3 className="texto-display text-2xl font-semibold">¿Tienes un negocio?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Publica tus productos, ofrece empleos y suma proyectos solidarios con verificación
                empresarial e informe de impacto.
              </p>
              <Button asChild variant="contorno" className="mt-5">
                <Link to="/registro">Abrir Mi Negocio</Link>
              </Button>
            </article>
            <article className="rounded-2xl border border-border bg-card p-7">
              <h3 className="texto-display text-2xl font-semibold">¿Quieres ser promotor?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Acredítate para entregar y verificar ayudas en tu zona, con identidad protegida y
                valoración de la comunidad.
              </p>
              <Button asChild variant="contorno" className="mt-5">
                <Link to="/registro">Solicitar acreditación</Link>
              </Button>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pt-8">
          <Logo />
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link to="/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link to="/normas" className="hover:text-foreground">
              Normas de convivencia
            </Link>
            <Link to="/entrar" className="hover:text-foreground">
              Entrar
            </Link>
            <Link to="/registro" className="hover:text-foreground">
              Crear mi cuenta
            </Link>
          </nav>
        </div>
        <p className="mx-auto max-w-6xl px-5 pt-6 pb-8 text-xs leading-relaxed text-muted-foreground">
          {AVISO_DEMO}
        </p>
      </footer>
    </div>
  );
}
