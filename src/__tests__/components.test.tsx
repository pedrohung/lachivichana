import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProveedorApp, useApp } from "@/components/app/contexto";
import { AvisoDemo } from "@/components/app/AvisoDemo";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import { Logo } from "@/components/marca/Logo";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { ARTICULOS } from "@/datos/demo/mercadito";
import { establecerModo, type ModoSesion } from "@/estado/sesion";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({
      to,
      params,
      children,
      ...props
    }: {
      to: string;
      params?: Record<string, string>;
      children: ReactNode;
    }) => {
      const href = params
        ? Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)
        : to;
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };
});

function renderWithApp(ui: ReactNode, modo: ModoSesion = "demo") {
  return render(<ProveedorApp modo={modo}>{ui}</ProveedorApp>);
}

function PanelSesionProtegida() {
  const { modo, invitado } = useApp();

  return (
    <>
      <p>Modo activo: {modo}</p>
      <p>Invitado: {String(invitado)}</p>
      <button type="button" onClick={() => establecerModo(modo === "demo" ? "visitante" : "demo")}>
        Cambiar modo real
      </button>
      <SoloConCuenta titulo="Zona protegida">
        <p>Contenido protegido</p>
      </SoloConCuenta>
    </>
  );
}

describe("renderizado mínimo de componentes estables", () => {
  it("renderiza el logo con identidad y lema corto", () => {
    render(<Logo />);

    expect(screen.getByText("La Chivichana")).toBeInTheDocument();
    expect(screen.getByText("Cuba se conecta")).toBeInTheDocument();
    expect(screen.getByAltText("Símbolo de La Chivichana")).toBeInTheDocument();
  });

  it("renderiza el aviso de demostración como datos ficticios", () => {
    render(<AvisoDemo corto />);

    expect(screen.getByText(/demostración/i)).toBeInTheDocument();
    expect(screen.getByText(/ficticios/i)).toBeInTheDocument();
  });

  it("alterna modo visitante y demo con el estado real de la aplicación", () => {
    render(
      <ProveedorApp>
        <PanelSesionProtegida />
      </ProveedorApp>,
    );

    expect(screen.getByText("Modo activo: visitante")).toBeInTheDocument();
    expect(screen.getByText("Invitado: true")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Zona protegida" })).toBeInTheDocument();
    expect(screen.getByText(/hace falta una cuenta/i)).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cambiar modo real" }));

    expect(screen.getByText("Modo activo: demo")).toBeInTheDocument();
    expect(screen.getByText("Invitado: false")).toBeInTheDocument();
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(screen.queryByText(/hace falta una cuenta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/autenticaci[oó]n real|backend real/i)).not.toBeInTheDocument();
  });

  it("renderiza una tarjeta del Mercadito con modalidad, detalle y contador simulado", () => {
    const articulo = ARTICULOS[0]!;

    renderWithApp(<TarjetaArticulo articulo={articulo} />);

    expect(screen.getByRole("link", { name: `Ver el anuncio ${articulo.titulo}` })).toHaveAttribute(
      "href",
      `/producto/${articulo.id}`,
    );
    expect(screen.getByRole("heading", { name: articulo.titulo })).toBeInTheDocument();
    expect(screen.getByText(/visualizaciones simuladas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar artículo/i })).toBeInTheDocument();
  });
});
