import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Logo } from "@/components/marca/Logo";

export const Route = createFileRoute("/apps")({
  component: AppsPage,
});

function AppsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/entrar" className="text-sm text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="texto-display text-4xl font-bold text-foreground">Descarga la app</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          La app Android de La Chivichana para entrar directo, sin barra del navegador.
        </p>

        <div className="mt-8">
          <a
            href="/apps/lachivichana-1.0.3.apk"
            download
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-xl font-bold text-primary-foreground shadow-lg transition hover:opacity-90"
          >
            <Download className="h-7 w-7" />
            Descargar para Android
          </a>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="texto-display text-xl font-semibold text-foreground">Datos</h2>
            <ul className="mt-3 grid gap-2">
              {["Versión 1.0.3 · Android 7.0 o superior · 1,5 MB"].map((p) => (
                <li
                  key={p}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 text-sm text-muted-foreground italic">
          Versión de prueba: al instalar permite «aplicaciones desconocidas» si el móvil lo pide.
        </p>
      </main>
    </div>
  );
}
