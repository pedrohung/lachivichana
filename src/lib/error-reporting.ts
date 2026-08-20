type AllowedErrorContext = {
  component?: unknown;
  boundary?: unknown;
  route?: unknown;
};

export type ClientErrorContext = {
  component?: string;
  boundary?: string;
  route?: string;
};

export type NormalizedClientError =
  | {
      kind: "error";
      name: string;
      message: string;
    }
  | {
      kind: "response";
      status: number;
      statusText: string;
      url?: string;
    }
  | {
      kind: "unknown";
      type: string;
      message: "Non-error value captured";
    };

const MAX_FIELD_LENGTH = 160;

export function normalizeClientError(error: unknown): NormalizedClientError {
  if (error instanceof Error) {
    return {
      kind: "error",
      name: limitText(error.name || "Error"),
      message: limitText(error.message || "Unknown error"),
    };
  }

  if (error instanceof Response) {
    return {
      kind: "response",
      status: error.status,
      statusText: limitText(error.statusText),
      ...(error.url && { url: sanitizeUrl(error.url) }),
    };
  }

  return {
    kind: "unknown",
    type: typeof error,
    message: "Non-error value captured",
  };
}

export function reportClientError(error: unknown, context: AllowedErrorContext = {}) {
  if (!import.meta.env.DEV) return;

  console.error("La Chivichana client error", {
    error: normalizeClientError(error),
    context: sanitizeContext(context),
  });
}

function sanitizeContext(context: AllowedErrorContext): ClientErrorContext {
  return {
    ...(typeof context.component === "string" && { component: limitText(context.component) }),
    ...(typeof context.boundary === "string" && { boundary: limitText(context.boundary) }),
    ...(typeof context.route === "string" && { route: sanitizeRoute(context.route) }),
  };
}

function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value);
    return limitText(`${url.origin}${url.pathname}`);
  } catch {
    return sanitizeRoute(value);
  }
}

function sanitizeRoute(value: string): string {
  return limitText(value.split(/[?#]/, 1)[0] || "/");
}

function limitText(value: string): string {
  return value.slice(0, MAX_FIELD_LENGTH);
}
