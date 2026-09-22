// Fase 3B: servicios de datos reales con PocketBase. Sin mocks.
//
// Esta capa mantiene la forma de los tipos de `src/datos/tipos.ts` y los
// rellena consultando la PocketBase dedicada de La Chivichana.
// Todo acceso a registros de PocketBase usa notación de corchetes
// (`registro["campo"]`) por `noPropertyAccessFromIndexSignature`.
import { obtenerPocketBase } from "@/lib/pocketbase";
import type {
  Anunciante,
  Articulo,
  Audiencia,
  Autor,
  Comentario,
  Conversacion,
  Grupo,
  HiloEsquina,
  Insignia,
  Mensaje,
  ModoArticulo,
  Negocio,
  Notificacion,
  Publicacion,
  ReaccionClave,
  SolicitudAyuda,
  Trabajo,
} from "./tipos";
import type PocketBase from "pocketbase";
import type { ListOptions, RecordModel } from "pocketbase";

// ===== Base =====

/** Registro genérico de PocketBase con acceso por corchetes. */
export type Registro = {
  id: string;
  created: string;
  updated: string;
  expand?: Record<string, Registro | Registro[] | undefined>;
  [clave: string]: unknown;
};

function comoRegistro(valor: unknown): Registro | undefined {
  if (typeof valor !== "object" || valor === null) return undefined;
  const r = valor as Record<string, unknown>;
  return typeof r["id"] === "string" ? (r as unknown as Registro) : undefined;
}

function texto(r: Registro, campo: string, defecto = ""): string {
  const v = r[campo];
  return typeof v === "string" ? v : defecto;
}

function numero(r: Registro, campo: string, defecto = 0): number {
  const v = r[campo];
  return typeof v === "number" && !Number.isNaN(v) ? v : defecto;
}

function booleano(r: Registro, campo: string): boolean {
  return r[campo] === true;
}

function expandUno(r: Registro, campo: string): Registro | undefined {
  const e = r.expand?.[campo];
  if (Array.isArray(e)) return e[0];
  return e;
}

function expandMuchos(r: Registro, campo: string): Registro[] {
  const e = r.expand?.[campo];
  return Array.isArray(e) ? e : [];
}

/** "hace 5 min", "ayer", "12/03/2026"… */
export function fechaRelativa(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  const diffMs = Date.now() - fecha.getTime();
  if (diffMs < 0) return "ahora mismo";
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return fecha.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
}

function pb(): PocketBase {
  const instancia = obtenerPocketBase();
  if (!instancia) throw new Error("PocketBase solo disponible en el navegador");
  return instancia;
}

function miId(): string | null {
  const modelo = obtenerPocketBase()?.authStore.model;
  return modelo ? modelo.id : null;
}

/** Alias del usuario autenticado, si hay sesión. */
export function miAlias(): string | null {
  const modelo = obtenerPocketBase()?.authStore.model as RecordModel | null;
  if (!modelo) return null;
  const alias = modelo["username"] ?? modelo["alias"];
  return typeof alias === "string" ? alias : null;
}

function urlArchivo(registro: Registro, archivo: string): string {
  const modelo = {
    collectionId: texto(registro, "collectionId"),
    id: registro.id,
  } as unknown as RecordModel;
  return pb().files.getURL(modelo, archivo);
}

function avatarDe(usuario: Registro | undefined): string {
  if (!usuario) return "";
  const archivo = texto(usuario, "avatar");
  return archivo ? urlArchivo(usuario, archivo) : "";
}

function aliasDe(usuario: Registro | undefined): string {
  if (!usuario) return "usuario";
  return texto(usuario, "username", texto(usuario, "alias", "usuario"));
}

function mapearAutor(usuario: Registro | undefined): Autor {
  const alias = aliasDe(usuario);
  const nombreVisible = usuario ? texto(usuario, "name", alias) : "Usuario";
  const insignias: Insignia[] = usuario && booleano(usuario, "verified") ? ["verificado"] : [];
  return {
    alias,
    mostrarComo: "alias",
    nombreVisible,
    avatar: avatarDe(usuario),
    insignias,
    enlace: `/perfil/${alias}`,
  };
}

function mapearAnunciante(usuario: Registro | undefined): Anunciante {
  const alias = aliasDe(usuario);
  const creado = usuario ? texto(usuario, "created") : "";
  return {
    alias,
    nombreVisible: usuario ? texto(usuario, "name", alias) : "Usuario",
    avatar: avatarDe(usuario),
    verificado: usuario ? booleano(usuario, "verified") : false,
    reputacion: usuario ? numero(usuario, "reputacion", 5) : 5,
    valoraciones: usuario ? numero(usuario, "valoraciones", 0) : 0,
    desde: creado ? creado.slice(0, 10) : "",
    tipo: usuario && texto(usuario, "accountType") === "negocio" ? "negocio" : "alias",
  };
}

/** Crea una notificación para otro usuario. Los fallos no interrumpen. */
export async function notificar(
  usuarioId: string,
  tipo: string,
  titulo: string,
  cuerpo: string,
  refTipo?: string,
  refId?: string,
): Promise<void> {
  try {
    await pb()
      .collection("notifications")
      .create({
        user: usuarioId,
        tipo,
        titulo,
        cuerpo,
        leida: false,
        ...(refTipo !== undefined ? { refTipo } : {}),
        ...(refId !== undefined ? { refId } : {}),
      });
  } catch {
    /* las notificaciones nunca rompen el flujo principal */
  }
}

async function listaPlana(coleccion: string, opciones?: ListOptions): Promise<Registro[]> {
  const res = await pb().collection(coleccion).getFullList(opciones);
  return res.map((r) => comoRegistro(r)).filter((r): r is Registro => r !== undefined);
}

// ===== EL MALECÓN =====

export type TipoReaccionUI = { clave: ReaccionClave; etiqueta: string; icono: string };

export const TIPOS_REACCION: TipoReaccionUI[] = [
  { clave: "gusta", etiqueta: "Me gusta", icono: "thumbs-up" },
  { clave: "inspira", etiqueta: "Me inspira", icono: "sparkles" },
  { clave: "apoyo", etiqueta: "Apoyo", icono: "heart-handshake" },
  { clave: "gracias", etiqueta: "Gracias", icono: "hand-heart" },
  { clave: "interesa", etiqueta: "Me interesa", icono: "eye" },
];

/** Los tipos que guarda PocketBase en `reactions.type` → clave de dominio. */
const MAPEO_REACCION_PB: Record<string, ReaccionClave> = {
  me_gusta: "gusta",
  me_encanta: "inspira",
  me_divierte: "gracias",
  me_asombra: "interesa",
  me_entristece: "apoyo",
  me_enoja: "gusta",
};

const MAPEO_REACCION_DOMINIO: Record<ReaccionClave, string> = {
  gusta: "me_gusta",
  inspira: "me_encanta",
  apoyo: "me_entristece",
  gracias: "me_divierte",
  interesa: "me_asombra",
};

function reaccionesVacias(): Record<ReaccionClave, number> {
  return { gusta: 0, inspira: 0, apoyo: 0, gracias: 0, interesa: 0 };
}

export const FILTROS_MURO = [
  { clave: "para-ti", etiqueta: "Para ti" },
  { clave: "siguiendo", etiqueta: "Siguiendo" },
  { clave: "cuba", etiqueta: "Cuba" },
  { clave: "mi-comunidad", etiqueta: "Mi comunidad" },
  { clave: "ayuda", etiqueta: "Ayuda" },
  { clave: "emprendimiento", etiqueta: "Emprendimiento" },
  { clave: "opinion", etiqueta: "Opinión" },
] as const;
export type FiltroMuro = (typeof FILTROS_MURO)[number]["clave"];

/** Filtros temáticos → etiquetas (#) que deben aparecer en la publicación. */
const TEMAS_POR_FILTRO: Record<string, string[]> = {
  ayuda: ["ayuda", "apoyo", "solidaridad", "mano"],
  emprendimiento: ["negocio", "emprendimiento", "ventas", "colmena"],
  opinion: ["opinion", "debate", "esquina"],
};

export function filtrarPublicaciones(lista: Publicacion[], filtro: FiltroMuro): Publicacion[] {
  if (
    filtro === "para-ti" ||
    filtro === "siguiendo" ||
    filtro === "cuba" ||
    filtro === "mi-comunidad"
  ) {
    return lista;
  }
  const temas = TEMAS_POR_FILTRO[filtro] ?? [];
  if (temas.length === 0) return lista;
  return lista.filter((p) => p.temas.some((t) => temas.includes(t)));
}

export type OpcionesMuro = {
  filtro: FiltroMuro;
  forzarError?: boolean;
};

async function idsSeguidos(): Promise<string[]> {
  const uid = miId();
  if (!uid) return [];
  const segs = await listaPlana("follows", { filter: `follower = "${uid}"` });
  return segs.map((s) => texto(s, "following")).filter((id) => id.length > 0);
}

function extraerTemas(textoLibre: string): string[] {
  const temas = new Set<string>();
  const re = /#([a-záéíóúñü0-9_-]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(textoLibre)) !== null) {
    const tag = m[1];
    if (tag) temas.add(tag.toLowerCase());
  }
  return [...temas];
}

function mapearAudiencia(visibilidad: string): Audiencia {
  if (visibilidad === "conexiones") return "conexiones";
  return "comunidad";
}

function mapearComentario(c: Registro): Comentario {
  return {
    id: c.id,
    autor: mapearAutor(expandUno(c, "author")),
    fecha: fechaRelativa(c.created),
    texto: texto(c, "text"),
  };
}

function mapearPublicacion(
  post: Registro,
  reacciones: Registro[],
  comentarios: Registro[],
): Publicacion {
  const conteo = reaccionesVacias();
  for (const r of reacciones) {
    const clave = MAPEO_REACCION_PB[texto(r, "type")] ?? "gusta";
    conteo[clave] += 1;
  }
  const archivos = Array.isArray(post["images"]) ? (post["images"] as unknown[]) : [];
  const imagenes = archivos
    .filter((a): a is string => typeof a === "string")
    .map((img) => ({ url: urlArchivo(post, img), alt: texto(post, "title") }));
  const textoPost = texto(post, "text");
  const pub: Publicacion = {
    id: post.id,
    tipo: imagenes.length > 0 ? "foto" : "texto",
    autor: mapearAutor(expandUno(post, "author")),
    fecha: fechaRelativa(post.created),
    audiencia: mapearAudiencia(texto(post, "visibility")),
    texto: textoPost,
    reacciones: conteo,
    comentarios: comentarios.map(mapearComentario),
    guardados: 0,
    compartidos: 0,
    temas: extraerTemas(textoPost),
  };
  if (imagenes.length > 0) pub.imagenes = imagenes;
  const ubicacion = texto(post, "location");
  if (ubicacion) pub.ubicacion = ubicacion;
  return pub;
}

export async function obtenerPublicaciones(opciones: OpcionesMuro): Promise<Publicacion[]> {
  const { filtro, forzarError } = opciones;
  if (forzarError) throw new Error("No se pudieron cargar las publicaciones");
  const instancia = pb();
  const filtros: string[] = ['visibility = "publico"'];
  if (filtro === "siguiendo") {
    const seguidos = await idsSeguidos();
    if (seguidos.length === 0) return [];
    filtros.push(`author ~ "${seguidos.join("|")}"`);
  }
  const pagina = await instancia.collection("posts").getList(1, 30, {
    filter: filtros.join(" && "),
    sort: "-created",
    expand: "author",
  });
  const posts = pagina.items
    .map((p) => comoRegistro(p))
    .filter((p): p is Registro => p !== undefined);
  const ids = posts.map((p) => p.id);
  let reacciones: Registro[] = [];
  let comentarios: Registro[] = [];
  if (ids.length > 0) {
    const fIds = `post ~ "${ids.join("|")}"`;
    const [rs, cs] = await Promise.all([
      listaPlana("reactions", { filter: fIds }),
      listaPlana("comments", { filter: fIds, sort: "created", expand: "author" }),
    ]);
    reacciones = rs;
    comentarios = cs;
  }
  const pubs = posts.map((post) =>
    mapearPublicacion(
      post,
      reacciones.filter((r) => texto(r, "post") === post.id),
      comentarios.filter((c) => texto(c, "post") === post.id),
    ),
  );
  return filtrarPublicaciones(pubs, filtro);
}

export async function crearPublicacion(textoPost: string, imagenes?: File[]): Promise<Publicacion> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = { author: uid, text: textoPost, visibility: "publico" };
  if (imagenes && imagenes.length > 0) cuerpo["images"] = imagenes;
  const creado = await instancia.collection("posts").create(cuerpo, { expand: "author" });
  const post = comoRegistro(creado);
  if (!post) throw new Error("No se pudo crear la publicación");
  return mapearPublicacion(post, [], []);
}

export async function eliminarPublicacion(id: string): Promise<void> {
  await pb().collection("posts").delete(id);
}

export async function agregarComentario(
  postId: string,
  textoComentario: string,
): Promise<Comentario> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const creado = await instancia
    .collection("comments")
    .create({ post: postId, author: uid, text: textoComentario }, { expand: "author" });
  const c = comoRegistro(creado);
  if (!c) throw new Error("No se pudo publicar el comentario");
  const post = comoRegistro(
    await instancia
      .collection("posts")
      .getOne(postId)
      .catch(() => null),
  );
  if (post && texto(post, "author") !== uid) {
    await notificar(
      texto(post, "author"),
      "comentario",
      "Nuevo comentario",
      "Comentaron tu publicación",
      "post",
      postId,
    );
  }
  return mapearComentario(c);
}

export async function alternarReaccion(postId: string, tipo: ReaccionClave): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const tipoPB = MAPEO_REACCION_DOMINIO[tipo];
  const existentes = await listaPlana("reactions", {
    filter: `post = "${postId}" && author = "${uid}"`,
  });
  const misma = existentes.find((r) => texto(r, "type") === tipoPB);
  if (misma) {
    await instancia.collection("reactions").delete(misma.id);
    return;
  }
  await Promise.all(existentes.map((r) => instancia.collection("reactions").delete(r.id)));
  await instancia.collection("reactions").create({ post: postId, author: uid, type: tipoPB });
  const post = comoRegistro(
    await instancia
      .collection("posts")
      .getOne(postId)
      .catch(() => null),
  );
  if (post && texto(post, "author") !== uid) {
    await notificar(
      texto(post, "author"),
      "reaccion",
      "Nueva reacción",
      "Reaccionaron a tu publicación",
      "post",
      postId,
    );
  }
}

export async function seguirPorAlias(alias: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const u = comoRegistro(
    await instancia
      .collection("users")
      .getFirstListItem(`username = "${alias}" || alias = "${alias}"`)
      .catch(() => null),
  );
  if (!u) throw new Error("Usuario no encontrado");
  const ya = await listaPlana("follows", {
    filter: `follower = "${uid}" && following = "${u.id}"`,
  });
  if (ya.length === 0) {
    await instancia.collection("follows").create({ follower: uid, following: u.id });
    await notificar(
      u.id,
      "seguimiento",
      "Nuevo seguidor",
      "Alguien comenzó a seguirte",
      "perfil",
      alias,
    );
  }
}

export async function dejarDeSeguirPorAlias(alias: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const u = comoRegistro(
    await instancia
      .collection("users")
      .getFirstListItem(`username = "${alias}" || alias = "${alias}"`)
      .catch(() => null),
  );
  if (!u) return;
  const segs = await listaPlana("follows", {
    filter: `follower = "${uid}" && following = "${u.id}"`,
  });
  await Promise.all(segs.map((s) => instancia.collection("follows").delete(s.id)));
}

/**
 * Busca una persona por alias exacto (`username` o `alias`).
 * Devuelve el alias canónico si existe, o `null` si no se encuentra.
 * No requiere sesión: la usa la búsqueda global.
 */
export async function buscarPersonaPorAlias(alias: string): Promise<string | null> {
  const limpio = alias.trim().replace(/^@+/, "").replace(/["\\]/g, "");
  if (!limpio) return null;
  const u = comoRegistro(
    await pb()
      .collection("users")
      .getFirstListItem(`username = "${limpio}" || alias = "${limpio}"`)
      .catch(() => null),
  );
  if (!u) return null;
  return aliasDe(u) || null;
}

// ===== LA ESQUINA (debates: publicaciones marcadas con #esquina) =====

const ETIQUETA_ESQUINA = "#esquina";

export async function listarHilosEsquina(): Promise<HiloEsquina[]> {
  const pubs = await obtenerPublicaciones({ filtro: "para-ti" });
  return pubs
    .filter((p) => p.temas.includes("esquina"))
    .map((p) => ({
      id: p.id,
      formato: "tema" as const,
      titulo: p.texto.split("\n")[0]?.slice(0, 120) ?? "Debate",
      entradilla: p.texto.slice(0, 200),
      autor: p.autor,
      fecha: p.fecha,
      respuestas: p.comentarios.length,
      participantes: 0,
      climaRespeto: "alto" as const,
      temas: p.temas,
    }));
}

export async function crearHiloEsquina(titulo: string, detalle: string): Promise<Publicacion> {
  const textoHilo = `${titulo.trim()}\n\n${detalle.trim()}\n\n${ETIQUETA_ESQUINA} #debate`;
  return crearPublicacion(textoHilo);
}

// ===== EL MERCADITO =====

export type OrdenMercadito = "recientes" | "precio-asc" | "precio-desc" | "valorados";
export type QuienAnuncia = "todos" | "personas" | "negocios" | "verificados";

export type FiltrosMercadito = {
  texto: string;
  modo: "todas" | ModoArticulo;
  categoria: string;
  pais: string;
  zona: string;
  precioMin: string;
  precioMax: string;
  estado: string;
  quien: QuienAnuncia;
  orden: OrdenMercadito;
};

export const FILTROS_MERCADITO_INICIALES: FiltrosMercadito = {
  texto: "",
  modo: "todas",
  categoria: "todas",
  pais: "todos",
  zona: "todas",
  precioMin: "",
  precioMax: "",
  estado: "todos",
  quien: "todos",
  orden: "recientes",
};

/** Listas de referencia (antes vivían en los datos de demostración). */
export const CATEGORIAS_MERCADITO = [
  "Alimentos",
  "Ropa y calzado",
  "Hogar",
  "Tecnología",
  "Transporte",
  "Servicios",
  "Artesanía",
  "Formación",
  "Herramientas",
  "Salud y bienestar",
  "Regalos y donaciones",
  "Otros",
];

export const PAISES_MERCADITO = ["Cuba", "España", "Estados Unidos", "México"];

export const ESTADOS_ARTICULO = [
  { valor: "nuevo", texto: "Nuevo" },
  { valor: "como-nuevo", texto: "Como nuevo" },
  { valor: "usado", texto: "Usado" },
  { valor: "para-piezas", texto: "Para piezas" },
  { valor: "no-aplica", texto: "No aplica" },
] as const;

export const MOTIVOS_DENUNCIA = [
  "Posible fraude",
  "Producto prohibido",
  "Información engañosa",
  "Suplantación",
  "Acoso",
  "Datos personales expuestos",
  "Contenido duplicado",
  "Otro",
];

export const CONSEJOS_SEGURIDAD = [
  "No compartas contraseñas ni códigos de seguridad.",
  "No publiques tu dirección exacta.",
  "Comprueba la identidad pública y la reputación antes de cerrar un trato.",
  "No envíes dinero fuera de mecanismos autorizados.",
  "Denuncia comportamientos sospechosos.",
];

const CONDICIONES_VALIDAS: Articulo["estado"][] = [
  "nuevo",
  "como-nuevo",
  "usado",
  "para-piezas",
  "no-aplica",
];

function aModo(valor: string): ModoArticulo {
  if (valor === "donacion" || valor === "intercambio" || valor === "servicio") return valor;
  return "venta";
}

function aCondicion(valor: string): Articulo["estado"] {
  const v = valor as Articulo["estado"];
  return CONDICIONES_VALIDAS.includes(v) ? v : "usado";
}

function aMoneda(valor: string): "CUP" | "USD" | "EUR" | undefined {
  if (valor === "USD" || valor === "EUR" || valor === "CUP") return valor;
  return undefined;
}

function estadoAnuncioDesdePB(estado: string): "activo" | "reservado" | "vendido" | "pausado" {
  if (estado === "reservado") return "reservado";
  if (estado === "vendido") return "vendido";
  if (estado === "retirado" || estado === "pausado") return "pausado";
  return "activo";
}

function mapearArticulo(p: Registro): Articulo {
  const archivos = Array.isArray(p["images"]) ? (p["images"] as unknown[]) : [];
  const titulo = texto(p, "title");
  const imagenes = archivos
    .filter((a): a is string => typeof a === "string")
    .map((img) => ({ url: urlArchivo(p, img), alt: titulo }));
  const articulo: Articulo = {
    id: p.id,
    titulo,
    descripcion: texto(p, "description"),
    categoria: texto(p, "category", "Otros"),
    modo: aModo(texto(p, "mode", "venta")),
    estado: aCondicion(texto(p, "condition", "usado")),
    zona: texto(p, "location"),
    pais: texto(p, "country", "Cuba"),
    publicado: fechaRelativa(p.created),
    imagenAlt: titulo,
    vendedor: mapearAnunciante(expandUno(p, "seller")),
    entrega: texto(p, "delivery", "Se coordina por mensaje en un punto público"),
    interesados: numero(p, "interesado", 0),
    estadoAnuncio: estadoAnuncioDesdePB(texto(p, "status", "disponible")),
  };
  const precioBruto = p["price"];
  if (typeof precioBruto === "number" && !Number.isNaN(precioBruto)) articulo.precio = precioBruto;
  const moneda = aMoneda(texto(p, "currency"));
  if (moneda) articulo.moneda = moneda;
  if (imagenes.length > 0) articulo.imagenes = imagenes;
  return articulo;
}

export function filtrarArticulos(lista: Articulo[], f: FiltrosMercadito): Articulo[] {
  const consulta = f.texto.trim().toLowerCase();
  const min = f.precioMin.trim() ? Number(f.precioMin) : null;
  const max = f.precioMax.trim() ? Number(f.precioMax) : null;
  const res = lista.filter((a) => {
    if (f.modo !== "todas" && a.modo !== f.modo) return false;
    if (f.categoria !== "todas" && a.categoria !== f.categoria) return false;
    if (f.pais !== "todos" && a.pais !== f.pais) return false;
    if (f.zona !== "todas" && a.zona !== f.zona) return false;
    if (f.estado !== "todos" && a.estado !== f.estado) return false;
    if (f.quien === "verificados" && !a.vendedor.verificado) return false;
    if (f.quien === "personas" && a.vendedor.tipo === "negocio") return false;
    if (f.quien === "negocios" && a.vendedor.tipo !== "negocio") return false;
    if (min !== null && !Number.isNaN(min) && (a.precio === undefined || a.precio < min))
      return false;
    if (max !== null && !Number.isNaN(max) && (a.precio === undefined || a.precio > max))
      return false;
    if (consulta && !(a.titulo + " " + a.descripcion).toLowerCase().includes(consulta))
      return false;
    return true;
  });
  const ordenada = [...res];
  if (f.orden === "precio-asc") ordenada.sort((x, y) => (x.precio ?? 0) - (y.precio ?? 0));
  else if (f.orden === "precio-desc") ordenada.sort((x, y) => (y.precio ?? 0) - (x.precio ?? 0));
  else if (f.orden === "valorados")
    ordenada.sort((x, y) => y.vendedor.reputacion - x.vendedor.reputacion);
  else ordenada.sort((x, y) => y.id.localeCompare(x.id));
  return ordenada;
}

export type OpcionesCatalogo = {
  filtros?: FiltrosMercadito;
  forzarError?: boolean;
};

async function articulosConFiltroPB(filtroPB: string): Promise<Articulo[]> {
  const pagina = await pb().collection("products").getList(1, 60, {
    filter: filtroPB,
    sort: "-created",
    expand: "seller",
  });
  return pagina.items
    .map((p) => comoRegistro(p))
    .filter((p): p is Registro => p !== undefined)
    .map(mapearArticulo);
}

/** Catálogo público: disponibles para todos + los propios en cualquier estado. */
export async function obtenerArticulos(opciones: OpcionesCatalogo = {}): Promise<Articulo[]> {
  const { filtros, forzarError } = opciones;
  if (forzarError) throw new Error("No se pudieron cargar los artículos");
  const uid = miId();
  const filtroPB = uid ? `(status = "disponible" || seller = "${uid}")` : 'status = "disponible"';
  const articulos = await articulosConFiltroPB(filtroPB);
  return filtros ? filtrarArticulos(articulos, filtros) : articulos;
}

/** Todos los anuncios del usuario autenticado, en cualquier estado. */
export async function obtenerMisArticulos(): Promise<Articulo[]> {
  const uid = miId();
  if (!uid) return [];
  return articulosConFiltroPB(`seller = "${uid}"`);
}

/** Anuncios disponibles de un vendedor concreto (para perfiles públicos). */
export async function obtenerArticulosPorVendedor(alias: string): Promise<Articulo[]> {
  const articulos = await obtenerArticulos();
  return articulos.filter((a) => a.vendedor.alias === alias);
}

export async function obtenerArticuloPorId(id: string): Promise<Articulo | null> {
  const p = comoRegistro(
    await pb()
      .collection("products")
      .getOne(id, { expand: "seller" })
      .catch(() => null),
  );
  return p ? mapearArticulo(p) : null;
}

export function articulosSimilares(articulo: Articulo, lista: Articulo[], limite = 3): Articulo[] {
  return lista
    .filter((a) => a.id !== articulo.id && a.categoria === articulo.categoria)
    .slice(0, limite);
}

export type DatosArticulo = {
  titulo: string;
  descripcion: string;
  precio?: number;
  moneda?: "CUP" | "USD" | "EUR";
  categoria: string;
  modo: ModoArticulo;
  estado: Articulo["estado"];
  zona: string;
  pais: string;
  entrega?: string;
};

export async function crearArticulo(datos: DatosArticulo, fotos?: File[]): Promise<Articulo> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = {
    seller: uid,
    title: datos.titulo,
    description: datos.descripcion,
    category: datos.categoria,
    mode: datos.modo,
    condition: datos.estado,
    location: datos.zona,
    country: datos.pais,
    status: "disponible",
    ...(datos.precio !== undefined ? { price: datos.precio } : {}),
    ...(datos.moneda ? { currency: datos.moneda } : {}),
    ...(datos.entrega ? { delivery: datos.entrega } : {}),
  };
  if (fotos && fotos.length > 0) cuerpo["images"] = fotos;
  const creado = await instancia.collection("products").create(cuerpo, { expand: "seller" });
  const p = comoRegistro(creado);
  if (!p) throw new Error("No se pudo publicar el anuncio");
  return mapearArticulo(p);
}

export async function actualizarArticulo(
  id: string,
  datos: DatosArticulo,
  fotos?: File[],
): Promise<Articulo> {
  const cuerpo: Record<string, unknown> = {
    title: datos.titulo,
    description: datos.descripcion,
    category: datos.categoria,
    mode: datos.modo,
    condition: datos.estado,
    location: datos.zona,
    country: datos.pais,
    // null limpia el campo en PocketBase (el precio puede quitarse al editar)
    price: datos.precio ?? null,
    currency: datos.moneda ?? null,
    ...(datos.entrega ? { delivery: datos.entrega } : { delivery: null }),
  };
  // Las fotos nuevas se añaden a las existentes en PocketBase
  if (fotos && fotos.length > 0) cuerpo["images"] = fotos;
  const actualizado = await pb().collection("products").update(id, cuerpo, { expand: "seller" });
  const p = comoRegistro(actualizado);
  if (!p) throw new Error("No se pudo actualizar el anuncio");
  return mapearArticulo(p);
}

export async function cambiarEstadoArticulo(
  id: string,
  estado: "disponible" | "reservado" | "vendido" | "retirado",
): Promise<void> {
  await pb().collection("products").update(id, { status: estado });
}

export async function eliminarArticulo(id: string): Promise<void> {
  await pb().collection("products").delete(id);
}

// ===== MENSAJES =====

export async function listarConversaciones(): Promise<Conversacion[]> {
  const uid = miId();
  if (!uid) return [];
  const convs = await listaPlana("conversations", {
    filter: `participants ~ "${uid}"`,
    sort: "-updated",
    expand: "participants",
    perPage: 30,
  });
  const resultado: Conversacion[] = [];
  for (const c of convs) {
    const participantes = expandMuchos(c, "participants");
    const otros = participantes.filter((p) => p.id !== uid);
    const interlocutor = otros[0];
    const hilos = await listaPlana("messages", {
      filter: `conversation = "${c.id}"`,
      sort: "-created",
      perPage: 30,
      expand: "sender",
    });
    const mensajes: Mensaje[] = hilos
      .slice()
      .reverse()
      .map((m) => ({
        id: m.id,
        conversacionId: c.id,
        autor: mapearAutor(expandUno(m, "sender")),
        texto: texto(m, "text"),
        fecha: fechaRelativa(m.created),
        propio: texto(m, "sender") === uid,
      }));
    const ultimo = mensajes[mensajes.length - 1];
    const interlocutorAutor = interlocutor ? mapearAutor(interlocutor) : mapearAutor(undefined);
    resultado.push({
      id: c.id,
      nombreVisible: interlocutor ? interlocutorAutor.nombreVisible : "Conversación",
      avatar: interlocutor ? interlocutorAutor.avatar : "",
      contexto: texto(c, "titulo", "Mensaje directo"),
      ultimaFecha: ultimo?.fecha ?? fechaRelativa(c.created),
      noLeidos: hilos.filter((m) => !booleano(m, "read") && texto(m, "sender") !== uid).length,
      mensajes,
    });
  }
  return resultado;
}

export async function iniciarConversacion(aliasOtro: string): Promise<string> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const u = comoRegistro(
    await instancia
      .collection("users")
      .getFirstListItem(`username = "${aliasOtro}" || alias = "${aliasOtro}"`)
      .catch(() => null),
  );
  if (!u) throw new Error("Usuario no encontrado");
  const existentes = await listaPlana("conversations", {
    filter: `participants ~ "${uid}" && participants ~ "${u.id}"`,
  });
  if (existentes.length > 0 && existentes[0]) return existentes[0].id;
  const creada = await instancia.collection("conversations").create({
    participants: [uid, u.id],
    titulo: "Mensaje directo",
  });
  return creada.id;
}

export async function enviarMensaje(conversacionId: string, textoMsg: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  await instancia.collection("messages").create({
    conversation: conversacionId,
    sender: uid,
    text: textoMsg,
  });
  const conv = comoRegistro(await instancia.collection("conversations").getOne(conversacionId));
  if (conv) {
    const otros = expandMuchos(conv, "participants").filter((p) => p.id !== uid);
    for (const o of otros) {
      await notificar(
        o.id,
        "mensaje",
        "Nuevo mensaje",
        textoMsg.slice(0, 80),
        "conversacion",
        conversacionId,
      );
    }
  }
}

/** Marca como leídos los mensajes ajenos de una conversación. */
export async function marcarConversacionLeida(conversacionId: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) return;
  const pendientes = await listaPlana("messages", {
    filter: `conversation = "${conversacionId}" && sender != "${uid}" && read = false`,
  });
  await Promise.all(
    pendientes.map((m) => instancia.collection("messages").update(m.id, { read: true })),
  );
}

/** Suscripción en tiempo real a los mensajes de un hilo. Devuelve función para cancelar. */
export function suscribirHilo(
  conversacionId: string,
  alRecibir: (mensaje: Mensaje) => void,
): () => void {
  const instancia = obtenerPocketBase();
  if (!instancia) return () => undefined;
  const uid = miId();
  const promesa = instancia.collection("messages").subscribe(
    "*",
    (e) => {
      const m = comoRegistro(e.record);
      if (!m || texto(m, "conversation") !== conversacionId || e.action !== "create") return;
      alRecibir({
        id: m.id,
        conversacionId,
        autor: mapearAutor(undefined),
        texto: texto(m, "text"),
        fecha: fechaRelativa(m.created),
        propio: texto(m, "sender") === uid,
      });
    },
    { filter: `conversation = "${conversacionId}"` },
  );
  return () => {
    promesa.then(() => instancia.collection("messages").unsubscribe("*")).catch(() => undefined);
  };
}

// ===== NOTIFICACIONES =====

const CLASE_POR_TIPO: Record<string, Notificacion["clase"]> = {
  reaccion: "reaccion",
  comentario: "comentario",
  seguimiento: "seguimiento",
  mensaje: "mensaje",
  mercadito: "mercadito",
  empleo: "empleo",
  campana: "campana",
  promotor: "promotor",
  invitacion: "invitacion",
};

export async function listarNotificaciones(): Promise<Notificacion[]> {
  const uid = miId();
  if (!uid) return [];
  const avisos = await listaPlana("notifications", {
    filter: `user = "${uid}"`,
    sort: "-created",
    perPage: 50,
  });
  return avisos.map((n): Notificacion => {
    const tipo = texto(n, "tipo", "sistema");
    const titulo = texto(n, "titulo");
    const cuerpo = texto(n, "cuerpo");
    return {
      id: n.id,
      clase: CLASE_POR_TIPO[tipo] ?? "sistema",
      texto: cuerpo ? `${titulo}: ${cuerpo}` : titulo,
      fecha: fechaRelativa(n.created),
      leida: booleano(n, "leida"),
      enlace: enlaceNotificacion(tipo, texto(n, "refId"), texto(n, "refTipo")),
    };
  });
}

function enlaceNotificacion(tipo: string, refId: string, refTipo: string): string {
  if (refTipo === "conversacion" && refId) return `/mensajes?hilo=${refId}`;
  if (tipo === "mensaje" && refId) return `/mensajes?hilo=${refId}`;
  if (tipo === "comentario" || tipo === "reaccion") return "/malecon";
  if (tipo === "seguimiento") return "/mis-caminos";
  return "/mi-chivichana";
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  await pb().collection("notifications").update(id, { leida: true });
}

export async function marcarTodasLeidas(): Promise<void> {
  const pendientes = await listarNotificaciones();
  await Promise.all(pendientes.filter((n) => !n.leida).map((n) => marcarNotificacionLeida(n.id)));
}

// ===== PERFIL =====

export type PerfilPublico = {
  alias: string;
  nombreVisible: string;
  avatar: string;
  bio: string;
  insignias: Insignia[];
  esMiPerfil: boolean;
  seguidores: number;
  seguidos: number;
  loSigo: boolean;
  meSigue: boolean;
};

export async function obtenerPerfilPorAlias(alias: string): Promise<PerfilPublico | null> {
  const instancia = pb();
  const u = comoRegistro(
    await instancia
      .collection("users")
      .getFirstListItem(`username = "${alias}" || alias = "${alias}"`, { expand: "perfil" })
      .catch(() => null),
  );
  if (!u) return null;
  const perfil = expandUno(u, "perfil");
  const uid = miId();
  const [seguidores, seguidos] = await Promise.all([
    listaPlana("follows", { filter: `following = "${u.id}"` }),
    listaPlana("follows", { filter: `follower = "${u.id}"` }),
  ]);
  return {
    alias: aliasDe(u),
    nombreVisible: texto(u, "name", aliasDe(u)),
    avatar: avatarDe(u),
    bio: perfil ? texto(perfil, "bio") : "",
    insignias: booleano(u, "verified") ? ["verificado"] : [],
    esMiPerfil: uid === u.id,
    seguidores: seguidores.length,
    seguidos: seguidos.length,
    loSigo: uid ? seguidores.some((f) => texto(f, "follower") === uid) : false,
    meSigue: uid ? seguidos.some((f) => texto(f, "following") === uid) : false,
  };
}

export async function actualizarMiPerfil(
  datos: { nombre?: string; bio?: string },
  avatar?: File,
): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = {};
  if (datos.nombre !== undefined) cuerpo["name"] = datos.nombre;
  if (avatar) cuerpo["avatar"] = avatar;
  await instancia.collection("users").update(uid, cuerpo);
  if (datos.bio !== undefined) {
    const perfiles = await listaPlana("profiles", { filter: `user = "${uid}"` });
    if (perfiles.length > 0 && perfiles[0]) {
      await instancia.collection("profiles").update(perfiles[0].id, { bio: datos.bio });
    } else {
      await instancia.collection("profiles").create({ user: uid, bio: datos.bio });
    }
  }
}

// ===== FAVORITOS =====

export type TipoFavorito = "producto" | "publicacion";

export async function listarFavoritos(): Promise<{ tipo: TipoFavorito; objetivo: string }[]> {
  const uid = miId();
  if (!uid) return [];
  const favs = await listaPlana("favorites", { filter: `user = "${uid}"` });
  return favs.map((f) => ({
    tipo: (texto(f, "tipo", "producto") === "publicacion"
      ? "publicacion"
      : "producto") as TipoFavorito,
    objetivo: texto(f, "objetivo"),
  }));
}

export async function alternarFavorito(
  tipo: TipoFavorito,
  objetivo: string,
): Promise<{ guardado: boolean }> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const existentes = await listaPlana("favorites", {
    filter: `user = "${uid}" && tipo = "${tipo}" && objetivo = "${objetivo}"`,
  });
  if (existentes.length > 0) {
    await Promise.all(existentes.map((f) => instancia.collection("favorites").delete(f.id)));
    return { guardado: false };
  }
  await instancia.collection("favorites").create({ user: uid, tipo, objetivo });
  return { guardado: true };
}

export async function esFavorito(tipo: TipoFavorito, objetivo: string): Promise<boolean> {
  const uid = miId();
  if (!uid) return false;
  const existentes = await listaPlana("favorites", {
    filter: `user = "${uid}" && tipo = "${tipo}" && objetivo = "${objetivo}"`,
  });
  return existentes.length > 0;
}

// ===== MIS CAMINOS (seguidos / seguidores) =====

export type Contacto = {
  alias: string;
  nombreVisible: string;
  avatar: string;
  detalle: string;
  relacion: "siguiendo" | "seguidor" | "mutuo";
};

export async function listarCaminos(): Promise<{ siguiendo: Contacto[]; seguidores: Contacto[] }> {
  const uid = miId();
  if (!uid) return { siguiendo: [], seguidores: [] };
  const [segsSiguiendo, segsSeguidores] = await Promise.all([
    listaPlana("follows", { filter: `follower = "${uid}"`, expand: "following" }),
    listaPlana("follows", { filter: `following = "${uid}"`, expand: "follower" }),
  ]);
  const aContacto = (u: Registro, relacion: Contacto["relacion"]): Contacto => ({
    alias: aliasDe(u),
    nombreVisible: texto(u, "name", aliasDe(u)),
    avatar: avatarDe(u),
    detalle: booleano(u, "verified") ? "Cuenta verificada" : "Miembro de la comunidad",
    relacion,
  });
  const idsSiguiendo = new Set(segsSiguiendo.map((s) => texto(s, "following")));
  const idsSeguidores = new Set(segsSeguidores.map((s) => texto(s, "follower")));
  const siguiendo = segsSiguiendo
    .map((s) => expandUno(s, "following"))
    .filter((u): u is Registro => u !== undefined)
    .map((u) => aContacto(u, idsSeguidores.has(u.id) ? "mutuo" : "siguiendo"));
  const seguidores = segsSeguidores
    .map((s) => expandUno(s, "follower"))
    .filter((u): u is Registro => u !== undefined)
    .map((u) => aContacto(u, idsSiguiendo.has(u.id) ? "mutuo" : "seguidor"));
  return { siguiendo, seguidores };
}

// ===== GRUPOS (Mi Barrio) =====

function mapearGrupo(g: Registro): Grupo {
  const miembros = expandMuchos(g, "group_members");
  const uid = miId();
  const imagenArchivo = texto(g, "image");
  const grupo: Grupo = {
    id: g.id,
    nombre: texto(g, "name"),
    miembros: miembros.length,
    esMiembro: uid ? miembros.some((m) => texto(m, "user") === uid) : false,
    fecha: fechaRelativa(g.created),
  };
  const descripcion = texto(g, "description");
  if (descripcion) grupo.descripcion = descripcion;
  const barrio = texto(g, "location");
  if (barrio) grupo.barrio = barrio;
  if (imagenArchivo) grupo.imagen = urlArchivo(g, imagenArchivo);
  return grupo;
}

export async function listarGrupos(): Promise<Grupo[]> {
  const grupos = await listaPlana("groups", { sort: "-created", expand: "group_members" });
  return grupos.map(mapearGrupo);
}

export async function crearGrupo(
  datos: { nombre: string; descripcion?: string; categoria?: string; zona?: string },
  imagen?: File,
): Promise<Grupo> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = {
    name: datos.nombre,
    ...(datos.descripcion !== undefined ? { description: datos.descripcion } : {}),
    ...(datos.categoria ? { category: datos.categoria } : {}),
    ...(datos.zona ? { location: datos.zona } : {}),
    ...(imagen ? { image: imagen } : {}),
  };
  const creado = await instancia.collection("groups").create(cuerpo);
  const g = comoRegistro(creado);
  if (!g) throw new Error("No se pudo crear el grupo");
  await instancia.collection("group_members").create({ group: g.id, user: uid, role: "admin" });
  const recargado = comoRegistro(
    await instancia
      .collection("groups")
      .getOne(g.id, { expand: "group_members" })
      .catch(() => null),
  );
  return mapearGrupo(recargado ?? g);
}

export async function unirseAGrupo(grupoId: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const ya = await listaPlana("group_members", {
    filter: `group = "${grupoId}" && user = "${uid}"`,
  });
  if (ya.length === 0) {
    await instancia
      .collection("group_members")
      .create({ group: grupoId, user: uid, role: "miembro" });
  }
}

export async function salirDeGrupo(grupoId: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const membresias = await listaPlana("group_members", {
    filter: `group = "${grupoId}" && user = "${uid}"`,
  });
  await Promise.all(membresias.map((m) => instancia.collection("group_members").delete(m.id)));
}

// ===== EL TALLER (empleos y oportunidades) =====

function mapearTrabajo(t: Registro): Trabajo {
  const trabajo: Trabajo = {
    id: t.id,
    titulo: texto(t, "title"),
    tipo: "oferta",
    estado: texto(t, "status") === "cerrado" ? "cerrado" : "abierto",
    autor: mapearAutor(expandUno(t, "postedBy")),
    fecha: fechaRelativa(t.created),
  };
  const descripcion = texto(t, "description") || texto(t, "entity");
  if (descripcion) trabajo.descripcion = descripcion;
  const categoria = texto(t, "category");
  if (categoria) trabajo.categoria = categoria;
  const ubicacion = texto(t, "location");
  if (ubicacion) trabajo.ubicacion = ubicacion;
  return trabajo;
}

export async function listarTrabajos(): Promise<Trabajo[]> {
  const trabajos = await listaPlana("jobs", { sort: "-created", expand: "postedBy" });
  return trabajos.map(mapearTrabajo);
}

export type DatosTrabajo = {
  titulo: string;
  entidad: string;
  modalidad?: string;
  remuneracion?: string;
  zona?: string;
  categoria?: string;
  descripcion?: string;
};

export async function crearTrabajo(datos: DatosTrabajo): Promise<Trabajo> {
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const creado = await pb()
    .collection("jobs")
    .create({
      title: datos.titulo,
      entity: datos.entidad,
      ...(datos.modalidad ? { mode: datos.modalidad } : {}),
      ...(datos.remuneracion ? { pay: datos.remuneracion } : {}),
      ...(datos.zona ? { location: datos.zona } : {}),
      ...(datos.categoria ? { category: datos.categoria } : {}),
      ...(datos.descripcion ? { description: datos.descripcion } : {}),
      status: "abierto",
      postedBy: uid,
    });
  const t = comoRegistro(creado);
  if (!t) throw new Error("No se pudo publicar la oportunidad");
  return mapearTrabajo(t);
}

export async function cambiarEstadoTrabajo(
  id: string,
  estado: "abierto" | "cerrado",
): Promise<void> {
  await pb().collection("jobs").update(id, { status: estado });
}

// ===== LA MANO (campañas de ayuda) =====

function mapearSolicitud(s: Registro): SolicitudAyuda {
  const estadoBruto = texto(s, "status", "abierta");
  const estado: SolicitudAyuda["estado"] =
    estadoBruto === "resuelta" ? "resuelta" : estadoBruto === "en_curso" ? "en_curso" : "abierta";
  const solicitud: SolicitudAyuda = {
    id: s.id,
    titulo: texto(s, "title"),
    estado,
    autor: mapearAutor(expandUno(s, "author")),
    fecha: fechaRelativa(s.created),
  };
  const descripcion = texto(s, "description");
  if (descripcion) solicitud.descripcion = descripcion;
  const categoria = texto(s, "category");
  if (categoria) solicitud.categoria = categoria;
  const ubicacion = texto(s, "location");
  if (ubicacion) solicitud.ubicacion = ubicacion;
  return solicitud;
}

export async function listarSolicitudes(): Promise<SolicitudAyuda[]> {
  const solicitudes = await listaPlana("help_requests", {
    sort: "-created",
    expand: "author",
  });
  return solicitudes.map(mapearSolicitud);
}

export type DatosSolicitud = {
  titulo: string;
  descripcion: string;
  zona?: string;
  categoria?: string;
  meta?: number;
};

export async function crearSolicitud(
  datos: DatosSolicitud,
  fotos?: File[],
): Promise<SolicitudAyuda> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = {
    title: datos.titulo,
    description: datos.descripcion,
    ...(datos.zona ? { location: datos.zona } : {}),
    ...(datos.categoria ? { category: datos.categoria } : {}),
    ...(datos.meta !== undefined ? { goal: datos.meta } : {}),
    status: "abierta",
    author: uid,
  };
  if (fotos && fotos.length > 0) cuerpo["images"] = fotos;
  const creada = await instancia.collection("help_requests").create(cuerpo, { expand: "author" });
  const s = comoRegistro(creada);
  if (!s) throw new Error("No se pudo publicar la campaña");
  return mapearSolicitud(s);
}

export async function cambiarEstadoSolicitud(
  id: string,
  estado: SolicitudAyuda["estado"],
): Promise<void> {
  await pb().collection("help_requests").update(id, { status: estado });
}

// ===== LA COLMENA (negocios) =====

function slugify(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapearNegocio(b: Registro): Negocio {
  const negocio: Negocio = {
    id: b.id,
    nombre: texto(b, "name"),
    slug: slugify(texto(b, "name", b.id)),
    fecha: fechaRelativa(b.created),
  };
  const descripcion = texto(b, "description");
  if (descripcion) negocio.descripcion = descripcion;
  const categoria = texto(b, "sector");
  if (categoria) negocio.categoria = categoria;
  const direccion = texto(b, "location");
  if (direccion) negocio.direccion = direccion;
  const logoArchivo = texto(b, "logo");
  if (logoArchivo) negocio.logo = urlArchivo(b, logoArchivo);
  return negocio;
}

export async function listarNegocios(): Promise<Negocio[]> {
  const negocios = await listaPlana("businesses", { sort: "-created", expand: "owner" });
  return negocios.map(mapearNegocio);
}

export async function obtenerNegocioPorSlug(slug: string): Promise<Negocio | null> {
  const negocios = await listarNegocios();
  return negocios.find((n) => n.slug === slug) ?? null;
}

export type DatosNegocio = {
  nombre: string;
  descripcion?: string;
  sector?: string;
  pais?: string;
  zona?: string;
  solidario?: boolean;
};

export async function crearNegocio(datos: DatosNegocio, logo?: File): Promise<Negocio> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión");
  const cuerpo: Record<string, unknown> = {
    name: datos.nombre,
    owner: uid,
    ...(datos.descripcion !== undefined ? { description: datos.descripcion } : {}),
    ...(datos.sector ? { sector: datos.sector } : {}),
    ...(datos.pais ? { country: datos.pais } : {}),
    ...(datos.zona ? { location: datos.zona } : {}),
    ...(datos.solidario !== undefined ? { solidary: datos.solidario } : {}),
    ...(logo ? { logo } : {}),
  };
  const creado = await instancia.collection("businesses").create(cuerpo, { expand: "owner" });
  const b = comoRegistro(creado);
  if (!b) throw new Error("No se pudo registrar el negocio");
  return mapearNegocio(b);
}

// ===== PROMOTORES =====

export type PromotorSimple = {
  alias: string;
  nombreVisible: string;
  avatar: string;
  desde: string;
};

/**
 * Los promotores son usuarios marcados con el indicador `promotor` en
 * su registro. Si ningún usuario lleva esa marca, la red aparece vacía.
 */
export async function listarPromotores(): Promise<PromotorSimple[]> {
  // El campo 'promotor' no existe en el esquema de PocketBase (la API devuelve 400).
  // Se muestran usuarios verificados como red de promotores.
  const usuarios = await listaPlana("users", { filter: "verified = true", sort: "created" });
  return usuarios.map((u) => ({
    alias: aliasDe(u),
    nombreVisible: texto(u, "name", aliasDe(u)),
    avatar: avatarDe(u),
    desde: texto(u, "created").slice(0, 10),
  }));
}

// ---------------------------------------------------------------------------
// Búsqueda de personas (colección pública "profiles").
// La colección "users" tiene la listRule restringida al admin (migración
// 1789927200): la resolución alias -> usuario se hace SIEMPRE contra
// "profiles", que solo contiene datos públicos (migración 1790072188).
// ---------------------------------------------------------------------------

export type PerfilBusqueda = {
  id: string; // id del usuario (profiles.user)
  alias: string;
  bio: string;
  avatarUrl: string | null;
};

/** Llama al endpoint /api/buscar/personas (requiere sesión). */
export async function buscarPersonasPorAlias(q: string): Promise<PerfilBusqueda[]> {
  const instancia = pb();
  const token = instancia?.authStore.token;
  if (!token || q.trim().length < 2) return [];
  try {
    const res = await fetch("/api/buscar/personas?q=" + encodeURIComponent(q.trim()), {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) return [];
    const datos = await res.json();
    return (datos.personas ?? []) as PerfilBusqueda[];
  } catch {
    return [];
  }
}

/** Perfil público por alias exacto (cabeceras de perfil y redirecciones). */
export async function obtenerPerfilPublicoPorAlias(alias: string): Promise<PerfilBusqueda | null> {
  const lista = await buscarPersonasPorAlias(alias.trim());
  const limpio = alias.trim().toLowerCase();
  return lista.find((p) => p.alias.toLowerCase() === limpio) ?? null;
}

/** ¿Sigo ya a este usuario? (reutiliza la colección "follows"). */
export async function estoySiguiendoA(userId: string): Promise<boolean> {
  const instancia = pb();
  const uid = miId();
  if (!uid || !userId || uid === userId) return false;
  const r = await instancia.collection("follows")
    .getFirstListItem("follower = \"" + uid + "\" && following = \"" + userId + "\"")
    .catch(() => null);
  return !!r;
}

export async function seguirAUsuario(userId: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid || !userId || uid === userId) return;
  const existente = await instancia.collection("follows")
    .getFirstListItem("follower = \"" + uid + "\" && following = \"" + userId + "\"")
    .catch(() => null);
  if (existente) return;
  await instancia.collection("follows").create({ follower: uid, following: userId });
}

export async function dejarDeSeguirAUsuario(userId: string): Promise<void> {
  const instancia = pb();
  const uid = miId();
  if (!uid || !userId) return;
  const existente = await instancia.collection("follows")
    .getFirstListItem("follower = \"" + uid + "\" && following = \"" + userId + "\"")
    .catch(() => null);
  if (existente?.id) await instancia.collection("follows").delete(existente.id);
}

/** Abre o crea la conversación directa con un usuario (por id). Reutiliza conversations. */
export async function iniciarConversacionCon(userId: string): Promise<string> {
  const instancia = pb();
  const uid = miId();
  if (!uid) throw new Error("Debes iniciar sesión para escribir mensajes.");
  if (!userId || userId === uid) throw new Error("No puedes escribirte a ti mismo.");
  const existentes = await instancia.collection("conversations")
    .getList(1, 20, { filter: "participants.id ?= \"" + uid + "\" && participants.id ?= \"" + userId + "\" && tipo = \"directo\"" })
    .catch(() => ({ items: [] as any[] }));
  const ya = (existentes.items ?? [])[0];
  if (ya?.id) return ya.id;
  const conversacion = await instancia.collection("conversations").create({
    participants: [uid, userId],
    title: "Mensaje directo",
    ultimoMensaje: "",
    tipo: "directo",
  });
  return conversacion.id;
}
