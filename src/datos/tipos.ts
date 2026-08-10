// Tipos centrales de La Chivichana.
// Esta capa describe los datos que más adelante servirá el backend.

export type IdentidadTipo = "alias" | "nombre" | "negocio";

export type Audiencia =
  | "comunidad"
  | "conexiones"
  | "barrio"
  | "grupo"
  | "seleccionadas";

export type Insignia =
  | "verificado"
  | "promotor"
  | "negocio"
  | "solidario"
  | "fundador";

export type Persona = {
  alias: string;
  nombre?: string;
  avatar: string;
  biografia: string;
  ubicacion: string;
  insignias: Insignia[];
  conexiones: number;
  desde: string;
  intereses: string[];
  identidadPreferida: IdentidadTipo;
};

export type Autor = {
  alias: string;
  mostrarComo: IdentidadTipo;
  nombreVisible: string;
  avatar: string;
  insignias: Insignia[];
  enlace: string;
};

export type TipoPublicacion =
  | "texto"
  | "foto"
  | "opinion"
  | "encuesta"
  | "producto"
  | "servicio"
  | "empleo"
  | "campana"
  | "negocio"
  | "comunidad";

export type ReaccionClave = "gusta" | "inspira" | "apoyo" | "gracias" | "interesa";

export type OpcionEncuesta = { texto: string; votos: number };

export type Comentario = {
  id: string;
  autor: Autor;
  fecha: string;
  texto: string;
};

export type Publicacion = {
  id: string;
  tipo: TipoPublicacion;
  autor: Autor;
  fecha: string;
  ubicacion?: string;
  audiencia: Audiencia;
  texto: string;
  imagenes?: { url: string; alt: string }[];
  encuesta?: OpcionEncuesta[];
  adjunto?: {
    titulo: string;
    detalle: string;
    enlace?: string;
    etiqueta: string;
  };
  reacciones: Record<ReaccionClave, number>;
  comentarios: Comentario[];
  guardados: number;
  compartidos: number;
  temas: string[];
  comentariosCerrados?: boolean;
};

export type ModoArticulo = "venta" | "donacion" | "intercambio" | "servicio";

export type Articulo = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  modo: ModoArticulo;
  precio?: number;
  moneda?: "CUP" | "USD" | "EUR";
  estado: "nuevo" | "como-nuevo" | "usado" | "para-piezas" | "no-aplica";
  zona: string;
  publicado: string;
  imagenAlt: string;
  vendedor: {
    alias: string;
    nombreVisible: string;
    avatar: string;
    verificado: boolean;
    reputacion: number;
    valoraciones: number;
    desde: string;
    tipo: IdentidadTipo;
  };
  entrega: string;
  interesados: number;
};

export type EstadoCampana =
  | "revision"
  | "verificada"
  | "recaudando"
  | "en-camino"
  | "entregada"
  | "justificacion"
  | "completada"
  | "suspendida";

export type HitoCampana = {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: EstadoCampana;
};

export type Campana = {
  id: string;
  titulo: string;
  resumen: string;
  descripcion: string;
  categoria: string;
  zona: string;
  estado: EstadoCampana;
  meta: number;
  recaudado: number;
  unidad: string;
  apoyos: number;
  creada: string;
  entregaEstimada: string;
  promotor: string;
  actualizaciones: HitoCampana[];
  comprobantes: { titulo: string; nota: string; protegido: boolean }[];
  informeFinal?: string;
  mensajePromotor?: string;
};

export type TipoPromotor =
  | "comunitario"
  | "entrega"
  | "verificador"
  | "empresarial"
  | "internacional"
  | "bienestar";

export type Promotor = {
  id: string;
  nombrePublico: string;
  avatar: string;
  tipo: TipoPromotor;
  zona: string;
  acreditacion: "acreditado" | "en-formacion" | "en-revision";
  ayudasCompletadas: number;
  valoracion: number;
  desde: string;
  insignias: string[];
  codigoAceptado: boolean;
  presentacion: string;
};

export type TipoOportunidad =
  | "empleo"
  | "temporal"
  | "servicio"
  | "mentoria"
  | "curso"
  | "beca"
  | "recurso";

export type Oportunidad = {
  id: string;
  titulo: string;
  entidad: string;
  tipo: TipoOportunidad;
  pais: string;
  modalidad: "remoto" | "presencial" | "mixto";
  sector: string;
  experiencia: "sin-experiencia" | "inicial" | "intermedia" | "avanzada";
  resumen: string;
  descripcion: string;
  requisitos: string[];
  publicado: string;
  compensacion: string;
  interesados: number;
};

export type Negocio = {
  slug: string;
  nombre: string;
  descripcion: string;
  sector: string;
  pais: string;
  area: string;
  logoTexto: string;
  verificado: boolean;
  solidario: boolean;
  productos: string[];
  representantes: { nombreVisible: string; papel: string; alias: string }[];
  empleos: number;
  proyectos: { titulo: string; detalle: string }[];
  insignias: string[];
  contacto: string[];
  impacto: { dato: string; texto: string }[];
  colaboracion: string;
};

export type HiloEsquina = {
  id: string;
  formato: "tema" | "pregunta" | "encuesta" | "articulo" | "propuesta";
  titulo: string;
  entradilla: string;
  autor: Autor;
  fecha: string;
  respuestas: number;
  participantes: number;
  climaRespeto: "alto" | "medio" | "atencion";
  fuentes?: { titulo: string; origen: string }[];
  encuesta?: OpcionEncuesta[];
  respuestaDestacada?: { autor: string; texto: string };
  temas: string[];
};

export type Grupo = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  miembros: number;
  privacidad: "abierto" | "solicitud" | "privado";
  zona: string;
  actividad: string;
  unido: boolean;
};

export type Conexion = {
  alias: string;
  nombreVisible: string;
  avatar: string;
  detalle: string;
  relacion: "conexion" | "sigues" | "seguidor" | "invitacion" | "sugerencia";
};

export type Notificacion = {
  id: string;
  clase:
    | "reaccion"
    | "comentario"
    | "invitacion"
    | "campana"
    | "promotor"
    | "mercadito"
    | "empleo";
  texto: string;
  fecha: string;
  leida: boolean;
  enlace: string;
};

export type Conversacion = {
  id: string;
  nombreVisible: string;
  avatar: string;
  contexto: string;
  ultimaFecha: string;
  noLeidos: number;
  mensajes: { id: string; mio: boolean; texto: string; hora: string }[];
};