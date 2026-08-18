import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

const requiredRoutes = [
  "/",
  "/entrar",
  "/registro",
  "/explorar",
  "/malecon",
  "/mercadito",
  "/mercadito/publicar",
  "/mercadito/mis-publicaciones",
  "/mercadito/guardados",
  "/producto/$id",
  "/perfil/$alias",
  "/negocio/$slug",
  "/la-mano",
  "/promotores",
  "/taller",
  "/colmena",
  "/la-esquina",
  "/mi-barrio",
  "/mis-caminos",
  "/mi-chivichana",
  "/publicar",
  "/notificaciones",
  "/mensajes",
  "/normas",
  "/privacidad",
] as const;

type RouterWithRoutesByPath = {
  routesByPath: Record<string, unknown>;
};

function createTestRouter(initialPath = "/") {
  return createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

function observedPathsFromRealRouter() {
  const router = createTestRouter();
  return Object.keys((router as unknown as RouterWithRoutesByPath).routesByPath);
}

describe("contrato de rutas principales", () => {
  it("registra las rutas esenciales en el árbol real generado por TanStack", () => {
    const observedPaths = observedPathsFromRealRouter();

    expect(observedPaths).toEqual(expect.arrayContaining([...requiredRoutes]));
  });

  it("reconoce rutas dinámicas con parámetros reales del router", () => {
    const observedPaths = observedPathsFromRealRouter();

    expect(observedPaths).toContain("/producto/$id");
    expect(observedPaths).toContain("/perfil/$alias");
    expect(observedPaths).toContain("/negocio/$slug");
  });

  it("mantiene un estado de no encontrado para una ruta desconocida", async () => {
    const router = createTestRouter("/ruta-que-no-existe");

    await router.load();

    expect(router.state.statusCode).toBe(404);
    expect(router.state.location.pathname).toBe("/ruta-que-no-existe");
  });
});
