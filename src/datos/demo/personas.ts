import type { Persona } from "../tipos";

export const PERSONAS: Persona[] = [
  {
    alias: "vientodelsur",
    nombre: "Yaneisy Morales",
    avatar: "YM",
    biografia:
      "Maestra de primaria en Cienfuegos. Escribo sobre lo que pasa en mi cuadra y organizo meriendas para el aula.",
    ubicacion: "Cienfuegos, Cuba",
    insignias: ["verificado"],
    conexiones: 184,
    desde: "marzo de 2026",
    intereses: ["Educación", "Comunidad", "Recetas"],
    identidadPreferida: "alias",
  },
  {
    alias: "guajiroconwifi",
    nombre: "Raúl Pérez",
    avatar: "RP",
    biografia: "Reparo motos y bicicletas eléctricas. Si se mueve, lo arreglo.",
    ubicacion: "Sancti Spíritus, Cuba",
    insignias: [],
    conexiones: 96,
    desde: "abril de 2026",
    intereses: ["Mecánica", "Transporte", "Emprendimiento"],
    identidadPreferida: "alias",
  },
  {
    alias: "manosdealtamar",
    nombre: "Dayana Cruz",
    avatar: "DC",
    biografia:
      "Cubana en Sevilla. Coordino envíos de medicinas con promotores en Villa Clara.",
    ubicacion: "Sevilla, España",
    insignias: ["promotor", "solidario"],
    conexiones: 402,
    desde: "febrero de 2026",
    intereses: ["Ayuda humanitaria", "Logística", "Salud"],
    identidadPreferida: "nombre",
  },
  {
    alias: "cafeconletras",
    nombre: "Ernesto Valdés",
    avatar: "EV",
    biografia:
      "Escribo columnas sobre economía doméstica. Prefiero discutir ideas y no personas.",
    ubicacion: "La Habana, Cuba",
    insignias: ["verificado"],
    conexiones: 613,
    desde: "enero de 2026",
    intereses: ["Opinión", "Economía", "Historia"],
    identidadPreferida: "alias",
  },
  {
    alias: "solarhabana",
    nombre: "Lisbet Ferrer",
    avatar: "LF",
    biografia: "Diseñadora gráfica y madre. Doy clases gratis de Canva los sábados.",
    ubicacion: "La Habana, Cuba",
    insignias: [],
    conexiones: 271,
    desde: "mayo de 2026",
    intereses: ["Diseño", "Formación", "Familia"],
    identidadPreferida: "nombre",
  },
  {
    alias: "orillanorte",
    nombre: "Michel Tamayo",
    avatar: "MT",
    biografia: "Cubano en Miami. Conecto ofertas de trabajo remoto con gente de la Isla.",
    ubicacion: "Miami, Estados Unidos",
    insignias: ["solidario"],
    conexiones: 528,
    desde: "marzo de 2026",
    intereses: ["Empleo", "Tecnología", "Mentoría"],
    identidadPreferida: "alias",
  },
];

export function buscarPersona(alias: string) {
  return PERSONAS.find((p) => p.alias === alias);
}