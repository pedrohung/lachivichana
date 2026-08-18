import { describe, expect, it } from "vitest";

import { AVISO_DEMO, LEMA, MODO_DEMO } from "@/datos/config";
import { IDENTIDADES } from "@/datos/demo/identidades";
import { ARTICULOS } from "@/datos/demo/mercadito";
import { CAMPANAS } from "@/datos/demo/mano";
import { NEGOCIOS } from "@/datos/demo/colmena";
import { PERSONAS } from "@/datos/demo/personas";
import { PROMOTORES } from "@/datos/demo/promotores";
import { PUBLICACIONES } from "@/datos/demo/publicaciones";
import { CONVERSACIONES, NOTIFICACIONES } from "@/datos/demo/avisos";
import { Route as HomeRoute } from "@/routes/index";
import { Route as RootRoute } from "@/routes/__root";

type MetaItem = Record<string, string>;

type RouteWithHead = {
  options: {
    head?: (...args: never[]) => { meta?: MetaItem[] };
  };
};

function metaFrom(route: unknown) {
  return ((route as RouteWithHead).options.head?.() ?? {}).meta ?? [];
}

function metaContent(meta: MetaItem[], key: "title" | string, value?: string) {
  if (key === "title") return meta.find((item) => "title" in item)?.["title"];
  return (
    meta.find((item) => item["name"] === key || item["property"] === key)?.["content"] ?? value
  );
}

describe("identidad del proyecto y metadatos", () => {
  it("conserva nombre, lema y metadatos sociales esenciales", () => {
    const rootMeta = metaFrom(RootRoute);
    const homeMeta = metaFrom(HomeRoute);

    expect(metaContent(homeMeta, "title")).toContain("La Chivichana");
    expect(metaContent(homeMeta, "title")).toContain("Cuba se conecta");
    expect(metaContent(homeMeta, "description")).toMatch(/cubanos se conectan/i);
    expect(metaContent(homeMeta, "og:title")).toBe("La Chivichana");
    expect(metaContent(homeMeta, "og:description")).toContain("Cuba se ayuda");
    expect(metaContent(homeMeta, "og:type")).toBe("website");
    expect(metaContent(homeMeta, "twitter:card")).toBe("summary_large_image");
    expect(metaContent(homeMeta, "twitter:title")).toBe("La Chivichana");
    expect(metaContent(homeMeta, "twitter:description")).toContain("Cuba crece");

    expect(metaContent(rootMeta, "title")).toContain("La Chivichana");
    expect(LEMA).toBe("Cuba se conecta. Cuba se ayuda. Cuba crece.");
  });
});

describe("modo demostración y privacidad de datos demo", () => {
  it("mantiene identificado el modo demo sin presentarlo como backend real", () => {
    expect(MODO_DEMO).toBe(true);
    expect(AVISO_DEMO).toMatch(/demostraci[oó]n/i);
    expect(AVISO_DEMO).toMatch(/simulados|ficticios/i);
    expect(AVISO_DEMO).not.toMatch(/autenticaci[oó]n real|backend real/i);
  });

  it("no expone correos, teléfonos, documentos o direcciones personales en datos demo", () => {
    const datasets = {
      articulos: ARTICULOS,
      campanas: CAMPANAS,
      identidades: IDENTIDADES,
      negocios: NEGOCIOS,
      personas: PERSONAS,
      promotores: PROMOTORES,
      publicaciones: PUBLICACIONES,
      notificaciones: NOTIFICACIONES,
      conversaciones: CONVERSACIONES,
    };
    const payload = JSON.stringify(datasets);

    expect(payload).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(payload).not.toMatch(/(?:\+?\d[\s().-]?){8,}/);
    expect(payload).not.toMatch(
      /\b(?:DNI|NIE|pasaporte|carnet de identidad)\s*[:#-]?\s*[A-Z0-9-]{5,}\b/i,
    );
    expect(payload).not.toMatch(/\bdocumento\s*[:#-]\s*[A-Z0-9-]{5,}\b/i);
    expect(payload).not.toMatch(
      /\b(?:calle|avenida|av\.|n[uú]mero|piso|apto\.?|apartamento)\s+\d+\b/i,
    );
  });
});
