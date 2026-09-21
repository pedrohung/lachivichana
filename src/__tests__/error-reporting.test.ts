import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeClientError, reportClientError } from "@/lib/error-reporting";

// Identificadores antiguos prohibidos. Se construyen por codigos de
// caracteres para que su texto literal no aparezca en el repositorio.
const cc = (...c: number[]) => String.fromCharCode(...c);
const _lv = cc(108, 111, 118, 97, 98, 108, 101);
const _Lv = cc(76, 111, 118, 97, 98, 108, 101);
const oldFileName = `${_lv}-error-reporting`;
const oldReporterName = `report${_Lv}Error`;
const oldEventsGlobal = `_${_lv}Events`;
const oldRuntimeGlobal = `_${_lv}ReportRuntimeError`;
const forbiddenOldReferences = [oldFileName, oldReporterName, oldEventsGlobal, oldRuntimeGlobal];
const sourceFiles = [
  "src/lib/error-reporting.ts",
  "src/routes/__root.tsx",
  "src/__tests__/error-reporting.test.ts",
];

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("reporter neutral de errores de cliente", () => {
  it("normaliza un Error sin perder su mensaje y sin exponer trazas", () => {
    const error = new Error("Fallo controlado del boundary");
    error.stack = "STACK PRIVADO";

    expect(normalizeClientError(error)).toEqual({
      kind: "error",
      name: "Error",
      message: "Fallo controlado del boundary",
    });
  });

  it("representa un Response mediante estado y URL, no como [object Response]", () => {
    const response = new Response("No encontrado", {
      status: 404,
      statusText: "Not Found",
    });
    Object.defineProperty(response, "url", {
      value: "https://lachivichana.local/ruta-que-no-existe?privado=1",
    });

    expect(normalizeClientError(response)).toEqual({
      kind: "response",
      status: 404,
      statusText: "Not Found",
      url: "https://lachivichana.local/ruta-que-no-existe",
    });
    expect(JSON.stringify(normalizeClientError(response))).not.toContain("[object Response]");
    expect(JSON.stringify(normalizeClientError(response))).not.toContain("privado=1");
  });

  it("trata valores desconocidos de forma segura", () => {
    const value = { email: "persona@example.com", nested: { token: "secreto" } };

    expect(normalizeClientError(value)).toEqual({
      kind: "unknown",
      type: "object",
      message: "Non-error value captured",
    });
  });

  it("en producción no llama a red ni consola", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("PROD", true);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    reportClientError(new Error("fallo producción"), {
      boundary: "root",
      route: "/mercadito",
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("en desarrollo registra solo campos autorizados", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("PROD", false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const unsafeContext = {
      component: "ErrorComponent",
      boundary: "root",
      route: "/explorar",
      arbitrary: { email: "persona@example.com" },
    } as unknown as Parameters<typeof reportClientError>[1];

    reportClientError(new Error("fallo desarrollo"), unsafeContext);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const [label, payload] = consoleSpy.mock.calls[0]!;
    expect(label).toBe("La Chivichana client error");
    expect(payload).toEqual({
      error: { kind: "error", name: "Error", message: "fallo desarrollo" },
      context: {
        component: "ErrorComponent",
        boundary: "root",
        route: "/explorar",
      },
    });
    expect(JSON.stringify(payload)).not.toContain("persona@example.com");
    expect(JSON.stringify(payload)).not.toContain("arbitrary");
    expect(JSON.stringify(payload)).not.toContain("stack");
  });

  it("no contiene referencias antiguas ni invoca fetch", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("PROD", true);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    reportClientError(new Error("sin red"), { route: "/" });

    expect(fetchSpy).not.toHaveBeenCalled();
    for (const file of sourceFiles) {
      const content = readFileSync(resolve(file), "utf8");
      for (const oldReference of forbiddenOldReferences) {
        expect(content).not.toContain(oldReference);
      }
    }
  });

  it("no serializa objetos de contexto arbitrarios", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("PROD", false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const unsafeContext = {
      route: "/perfil/vientodelsur",
      metadata: { telefono: "+34 600 000 000" },
    } as unknown as Parameters<typeof reportClientError>[1];

    reportClientError(new Error("contexto"), unsafeContext);

    const payload = consoleSpy.mock.calls[0]![1];
    expect(payload).toEqual({
      error: { kind: "error", name: "Error", message: "contexto" },
      context: { route: "/perfil/vientodelsur" },
    });
    expect(JSON.stringify(payload)).not.toContain("telefono");
    expect(JSON.stringify(payload)).not.toContain("600");
  });

  it("el componente raíz utiliza el reporter neutral", () => {
    const rootSource = readFileSync(resolve("src/routes/__root.tsx"), "utf8");

    expect(rootSource).toContain('import { reportClientError } from "../lib/error-reporting"');
    expect(rootSource).toContain("reportClientError(error");
    expect(rootSource).not.toContain("console.error(error)");
    expect(rootSource).not.toContain(oldReporterName);
  });
});
