/**
 * Utilidades para manejar errores de PocketBase de forma amable.
 * Las peticiones autocanceladas por el SDK no deben mostrarse como errores.
 */

export function esPeticionCancelada(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { isAbort?: unknown; name?: unknown; message?: unknown };
  if (e.isAbort === true) return true;
  if (e.name === "AbortError") return true;
  if (typeof e.message === "string") {
    const msg = e.message.toLowerCase();
    if (msg.includes("autocancel")) return true;
    if (msg.includes("the request was aborted")) return true;
    if (msg === "aborted") return true;
  }
  return false;
}
