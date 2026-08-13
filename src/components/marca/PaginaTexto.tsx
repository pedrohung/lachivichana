import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/marca/Logo";

export function PaginaTexto({
  titulo,
  entrada,
  bloques,
  nota,
}: {
  titulo: string;
  entrada: string;
  bloques: { titulo: string; puntos: string[] }[];
  nota?: string;
}) {
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
        <h1 className="texto-display text-4xl font-bold text-foreground">{titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{entrada}</p>

        <div className="mt-10 space-y-8">
          {bloques.map((b) => (
            <section key={b.titulo}>
              <h2 className="texto-display text-xl font-semibold text-foreground">{b.titulo}</h2>
              <ul className="mt-3 grid gap-2">
                {b.puntos.map((p) => (
                  <li
                    key={p}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {nota && <p className="mt-10 text-sm text-muted-foreground italic">{nota}</p>}
      </main>
    </div>
  );
}
