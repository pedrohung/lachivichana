import type { Autor, HiloEsquina } from "../tipos";

const autor = (
  alias: string,
  nombreVisible: string,
  avatar: string,
  mostrarComo: Autor["mostrarComo"] = "alias",
  insignias: Autor["insignias"] = [],
): Autor => ({ alias, nombreVisible, avatar, mostrarComo, insignias, enlace: `/perfil/${alias}` });

export const LEMA_ESQUINA = "Aquí se discuten ideas; no se persigue a personas.";

export const HILOS: HiloEsquina[] = [
  {
    id: "hilo-1",
    formato: "articulo",
    titulo: "La ayuda que se explica dura más que la ayuda que se presume",
    entradilla:
      "Cuando una entrega se cuenta con cuentas claras, la próxima cuesta menos trabajo. Cuando se presume, cuesta el doble.",
    autor: autor("cafeconletras", "cafeconletras", "EV", "alias", ["verificado"]),
    fecha: "hace 7 horas",
    respuestas: 48,
    participantes: 31,
    climaRespeto: "alto",
    fuentes: [
      { titulo: "Informe final de la campaña de Holguín", origen: "La Mano · La Chivichana" },
    ],
    respuestaDestacada: {
      autor: "manosdealtamar",
      texto:
        "Coincido en el fondo y discrepo en algo: a veces la gente no publica por miedo, no por presumir. Habría que ayudarles a publicar sin exponerse.",
    },
    temas: ["Solidaridad", "Transparencia"],
  },
  {
    id: "hilo-2",
    formato: "pregunta",
    titulo: "¿Cómo mantener un negocio pequeño cuando cambia el precio cada semana?",
    entradilla:
      "Pregunta abierta para quien vende algo: ¿cómo ajustan los precios sin perder clientes ni perder dinero?",
    autor: autor("guajiroconwifi", "guajiroconwifi", "RP"),
    fecha: "hace 1 día",
    respuestas: 96,
    participantes: 64,
    climaRespeto: "alto",
    respuestaDestacada: {
      autor: "Mango y Miel",
      texto:
        "Nosotros publicamos el precio cada lunes y lo respetamos toda la semana, aunque perdamos un poco. La gente vuelve por eso.",
    },
    temas: ["Emprendimiento"],
  },
  {
    id: "hilo-3",
    formato: "encuesta",
    titulo: "¿Qué debería priorizar La Chivichana en los próximos meses?",
    entradilla: "Encuesta abierta a toda la comunidad. Puedes explicar tu voto en las respuestas.",
    autor: autor("solarhabana", "Lisbet Ferrer", "LF", "nombre"),
    fecha: "hace 2 días",
    respuestas: 141,
    participantes: 118,
    climaRespeto: "alto",
    encuesta: [
      { texto: "Que las campañas se vean más claras", votos: 512 },
      { texto: "Más herramientas para negocios", votos: 289 },
      { texto: "Mejor búsqueda de empleo", votos: 366 },
      { texto: "Más control sobre mi privacidad", votos: 421 },
    ],
    temas: ["Comunidad", "Producto"],
  },
  {
    id: "hilo-4",
    formato: "propuesta",
    titulo: "Propuesta: que cada barrio tenga un punto fijo de intercambio",
    entradilla:
      "Un lugar público y conocido donde dejar y recoger cosas sin dar direcciones a desconocidos.",
    autor: autor("vientodelsur", "vientodelsur", "YM", "alias", ["verificado"]),
    fecha: "hace 3 días",
    respuestas: 73,
    participantes: 52,
    climaRespeto: "medio",
    temas: ["Comunidad", "Seguridad"],
  },
  {
    id: "hilo-5",
    formato: "tema",
    titulo: "Irse o quedarse: hablemos sin juzgar a nadie",
    entradilla:
      "Hay quien se fue, quien volvió y quien no piensa moverse. Este hilo es para contarlo sin reproches.",
    autor: autor("orillanorte", "orillanorte", "MT", "alias", ["solidario"]),
    fecha: "hace 4 días",
    respuestas: 214,
    participantes: 137,
    climaRespeto: "atencion",
    temas: ["Migración", "Familia"],
  },
];

export function buscarHilo(id: string) {
  return HILOS.find((h) => h.id === id);
}