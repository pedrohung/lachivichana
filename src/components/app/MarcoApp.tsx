import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  MessageCircle,
  Menu,
  PenLine,
  Search,
  Waves,
  Store,
  HandHeart,
  UserCog,
  ChevronDown,
  LogIn,
} from "lucide-react";

import { Logo } from "@/components/marca/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAVEGACION } from "@/datos/navegacion";
import { listarConversaciones, listarNotificaciones } from "@/datos/servicios";
import { salir, type ModoSesion } from "@/estado/sesion";
import { cn } from "@/lib/utils";
import { AvatarIniciales, inicialesDe } from "./Avatar";
import { AvisoDemo } from "./AvisoDemo";
import { DialogoAcceso } from "./DialogoAcceso";
import { ProveedorApp, esRutaProtegida, useApp } from "./contexto";

type MarcoProps = {
  children: ReactNode;
  /** Contenido del panel contextual derecho (sólo escritorio ancho). */
  panelDerecho?: ReactNode;
  /** "visitante" fuerza la vista de invitado para esta ruta. */
  modo?: "visitante";
};

const NAV_MOVIL = [
  { ruta: "/malecon", nombre: "Malecón", icono: Waves },
  { ruta: "/mercadito", nombre: "Mercadito", icono: Store },
  { ruta: "/publicar", nombre: "Publicar", icono: PenLine, destacado: true },
  { ruta: "/la-mano", nombre: "La Mano", icono: HandHeart },
  { ruta: "/mi-chivichana", nombre: "Mi Chivichana", icono: UserCog },
];

export function MarcoApp({ children, panelDerecho, modo }: MarcoProps) {
  const modoFijo: ModoSesion | undefined = modo;
  return (
    <ProveedorApp modo={modoFijo}>
      <Estructura panelDerecho={panelDerecho}>{children}</Estructura>
      <DialogoAcceso />
    </ProveedorApp>
  );
}

function Estructura({ children, panelDerecho }: { children: ReactNode; panelDerecho?: ReactNode }) {
  const { invitado } = useApp();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <Cabecera menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />

      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-3 pt-4 pb-24 sm:px-5 lg:pb-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            <NavegacionLateral />
            {invitado ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-primary">Estás mirando sin cuenta</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Puedes recorrerlo todo. Para participar, crea tu cuenta cuando quieras.
                </p>
                <Button asChild variant="sol" size="sm" className="mt-3 w-full">
                  <Link to="/registro">Crear mi cuenta</Link>
                </Button>
              </div>
            ) : null}
            <AvisoDemo corto />
          </div>
        </aside>

        <main id="contenido" className="min-w-0 flex-1">
          {children}
        </main>

        {panelDerecho ? (
          <aside className="hidden w-80 shrink-0 xl:block" aria-label="Recomendaciones">
            <div className="sticky top-20">{panelDerecho}</div>
          </aside>
        ) : null}
      </div>

      <NavegacionInferior />
    </div>
  );
}

function useRutaActual() {
  return useRouterState({ select: (s) => s.location.pathname });
}

/** Contadores reales de no leídos; si la carga falla, se muestran sin insignia. */
function useContadoresNoLeidos(activo: boolean) {
  const [contadores, setContadores] = useState<{ sinLeer: number; mensajesSinLeer: number } | null>(
    null,
  );

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    Promise.all([listarNotificaciones(), listarConversaciones()])
      .then(([avisos, conversaciones]) => {
        if (!vigente) return;
        setContadores({
          sinLeer: avisos.filter((n) => !n.leida).length,
          mensajesSinLeer: conversaciones.reduce((total, c) => total + c.noLeidos, 0),
        });
      })
      .catch(() => {
        if (vigente) setContadores({ sinLeer: 0, mensajesSinLeer: 0 });
      });
    return () => {
      vigente = false;
    };
  }, [activo]);

  return contadores;
}

function NavegacionLateral({ alNavegar }: { alNavegar?: () => void }) {
  const ruta = useRutaActual();
  const { invitado, requiereCuenta } = useApp();

  const alPulsar = (destino: string) => (evento: React.MouseEvent) => {
    if (invitado && esRutaProtegida(destino)) {
      evento.preventDefault();
      requiereCuenta();
      return;
    }
    alNavegar?.();
  };

  return (
    <nav
      aria-label="Secciones de La Chivichana"
      className="rounded-2xl border border-border bg-card p-2"
    >
      <ul className="space-y-0.5">
        {NAVEGACION.map((item) => {
          const activo = ruta === item.ruta;
          const Icono = item.icono;
          return (
            <li key={item.ruta}>
              <Link
                to={item.ruta}
                onClick={alPulsar(item.ruta)}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  activo
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icono aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.nombre}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-2">
        <Button asChild variant="sol" className="w-full">
          <Link to="/publicar" onClick={alPulsar("/publicar")}>
            <PenLine aria-hidden="true" />
            Crear publicación
          </Link>
        </Button>
      </div>
    </nav>
  );
}

function Cabecera({
  menuAbierto,
  setMenuAbierto,
}: {
  menuAbierto: boolean;
  setMenuAbierto: (v: boolean) => void;
}) {
  const { invitado, identidad } = useApp();
  const navegar = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const contadores = useContadoresNoLeidos(!invitado);
  const sinLeer = contadores?.sinLeer ?? 0;
  const mensajesSinLeer = contadores?.mensajesSinLeer ?? 0;

  const enviarBusqueda = (evento: React.FormEvent) => {
    evento.preventDefault();
    const q = busqueda.trim();
    if (!q) return;
    navegar({ to: "/mercadito", search: { texto: q } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú de secciones"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-xs overflow-y-auto p-4">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="sr-only">Secciones</SheetTitle>
                <Logo variant="horizontal" />
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <NavegacionLateral alNavegar={() => setMenuAbierto(false)} />
                <AvisoDemo corto />
              </div>
            </SheetContent>
          </Sheet>
          <Link
            to="/"
            className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Logo variant="compacto" className="sm:hidden" />
            <Logo variant="horizontal" className="hidden sm:inline-flex" />
          </Link>
        </div>

        <form role="search" className="min-w-0" onSubmit={enviarBusqueda}>
          <label htmlFor="buscador-global" className="sr-only">
            Buscar en La Chivichana
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="buscador-global"
              type="search"
              placeholder="Buscar personas, negocios, ayuda…"
              className="h-10 rounded-full pl-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          {!invitado && (
            <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Link to="/notificaciones" aria-label={`Notificaciones (${sinLeer} sin leer)`}>
                <Bell aria-hidden="true" />
                {sinLeer > 0 && (
                  <span
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rojo"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </Button>
          )}
          {!invitado && (
            <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <Link
                to="/mensajes"
                search={{ hilo: undefined }}
                aria-label={`Mensajes (${mensajesSinLeer} sin leer)`}
              >
                <MessageCircle aria-hidden="true" />
                {mensajesSinLeer > 0 && (
                  <span
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-turquesa"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </Button>
          )}

          {invitado ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/entrar">
                  <LogIn aria-hidden="true" />
                  Entrar
                </Link>
              </Button>
              <Button asChild variant="sol" size="sm">
                <Link to="/registro">Crear cuenta</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 gap-2 px-2">
                  <AvatarIniciales
                    iniciales={inicialesDe(identidad.nombreVisible)}
                    nombre={identidad.nombreVisible}
                    tamano="sm"
                  />
                  <span className="hidden min-w-0 text-left leading-tight md:block">
                    <span className="block truncate text-xs font-semibold">
                      {identidad.nombreVisible}
                    </span>
                    <span className="block truncate text-[0.65rem] text-muted-foreground">
                      {identidad.detalle}
                    </span>
                  </span>
                  <ChevronDown aria-hidden="true" className="hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Participando como</DropdownMenuLabel>
                <div className="px-2 pb-2">
                  <p className="truncate text-sm font-medium">{identidad.nombreVisible}</p>
                  <p className="truncate text-xs text-muted-foreground">{identidad.detalle}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-chivichana">Mi Chivichana</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notificaciones">Notificaciones</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mensajes" search={{ hilo: undefined }}>
                    Mensajes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/privacidad">Privacidad</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => salir()}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

function NavegacionInferior() {
  const ruta = useRutaActual();
  const { invitado, requiereCuenta } = useApp();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_MOVIL.map((item) => {
          const activo = ruta === item.ruta;
          const Icono = item.icono;
          return (
            <li key={item.ruta}>
              <Link
                to={item.ruta}
                onClick={(evento) => {
                  if (invitado && esRutaProtegida(item.ruta)) {
                    evento.preventDefault();
                    requiereCuenta();
                  }
                }}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.65rem] font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  activo ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full",
                    item.destacado
                      ? "bg-[image:var(--gradient-sol)] text-[oklch(0.22_0.06_70)]"
                      : activo
                        ? "bg-secondary"
                        : "",
                  )}
                >
                  <Icono aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <span className="truncate">{item.nombre}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
