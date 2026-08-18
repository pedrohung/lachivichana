import { describe, expect, it } from "vitest";

import { AVISO_DEMO } from "@/datos/config";
import { IDENTIDADES } from "@/datos/demo/identidades";
import { ARTICULOS, buscarArticulo } from "@/datos/demo/mercadito";
import { CAMPANAS } from "@/datos/demo/mano";
import { PROMOTORES } from "@/datos/demo/promotores";
import type { EstadoAnuncio, EstadoCampana, IdentidadTipo, ModoArticulo } from "@/datos/tipos";

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("contratos del Mercadito demo", () => {
  it("mantiene catálogo con identificadores únicos, modalidades válidas y detalle construible", () => {
    const modalidadesValidas = new Set<ModoArticulo>([
      "venta",
      "donacion",
      "intercambio",
      "servicio",
    ]);

    expect(ARTICULOS.length).toBeGreaterThan(0);
    expectUnique(ARTICULOS.map((articulo) => articulo.id));

    for (const articulo of ARTICULOS) {
      expect(modalidadesValidas.has(articulo.modo)).toBe(true);
      expect(`/producto/${articulo.id}`).toMatch(/^\/producto\/[a-z0-9-]+$/i);
      expect(buscarArticulo(articulo.id)).toEqual(articulo);
    }
  });

  it("conserva estados suficientes para anuncios activos, retirados o no disponibles", () => {
    const estadosValidos = new Set<EstadoAnuncio>([
      "activo",
      "reservado",
      "vendido",
      "donado",
      "intercambiado",
      "pausado",
      "borrador",
      "retirado",
    ]);
    const estados = new Set(ARTICULOS.map((articulo) => articulo.estadoAnuncio ?? "activo"));

    expect(estados.has("activo")).toBe(true);
    expect([...estados].some((estado) => estado !== "activo")).toBe(true);
    for (const estado of estados) expect(estadosValidos.has(estado)).toBe(true);
  });

  it("no confunde el catálogo demo con transacciones reales", () => {
    expect(AVISO_DEMO).toMatch(/demostraci[oó]n/i);
    expect(AVISO_DEMO).toMatch(/ficticios|simulados/i);
    expect(JSON.stringify(ARTICULOS)).not.toMatch(
      /pago confirmado|transacci[oó]n real|contrato cerrado/i,
    );
  });
});

describe("contratos de La Mano y promotores", () => {
  it("mantiene campañas trazables con estados, cantidades válidas y comprobantes protegidos", () => {
    const estadosValidos = new Set<EstadoCampana>([
      "revision",
      "verificada",
      "recaudando",
      "en-camino",
      "entregada",
      "justificacion",
      "completada",
      "suspendida",
    ]);

    expect(CAMPANAS.length).toBeGreaterThan(0);
    expectUnique(CAMPANAS.map((campana) => campana.id));
    expect(CAMPANAS.some((campana) => campana.comprobantes.some((c) => c.protegido))).toBe(true);

    for (const campana of CAMPANAS) {
      expect(estadosValidos.has(campana.estado)).toBe(true);
      expect(campana.meta).toBeGreaterThanOrEqual(0);
      expect(campana.recaudado).toBeGreaterThanOrEqual(0);
      expect(campana.recaudado).toBeLessThanOrEqual(campana.meta);
      expect(campana.apoyos).toBeGreaterThanOrEqual(0);
    }
  });

  it("mantiene promotores y verificadores como perfiles públicos simulados sin contacto privado", () => {
    expect(PROMOTORES.length).toBeGreaterThan(0);
    expectUnique(PROMOTORES.map((promotor) => promotor.id));
    expect(PROMOTORES.some((promotor) => promotor.tipo === "verificador")).toBe(true);

    for (const promotor of PROMOTORES) {
      expect(promotor.nombrePublico).toBeTruthy();
      expect(promotor.presentacion).not.toMatch(/@|\+?\d[\d\s().-]{7,}/);
    }
  });
});

describe("identidades visibles", () => {
  it("mantiene alias, nombre y negocio como tratamientos visibles previstos", () => {
    const tipos = new Set<IdentidadTipo>(IDENTIDADES.map((identidad) => identidad.tipo));

    expect(tipos).toEqual(new Set(["alias", "nombre", "negocio"]));
  });

  it("no expone automáticamente datos privados del suscriptor", () => {
    for (const identidad of IDENTIDADES) {
      expect(Object.keys(identidad)).not.toEqual(
        expect.arrayContaining(["correo", "email", "telefono", "direccion", "documento"]),
      );
      expect(JSON.stringify(identidad)).not.toMatch(
        /@|\+?\d[\d\s().-]{7,}|documento|direcci[oó]n/i,
      );
    }
  });
});
