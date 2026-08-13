import type { Conversacion, Notificacion } from "../tipos";

export const NOTIFICACIONES: Notificacion[] = [
  {
    id: "not-1",
    clase: "reaccion",
    texto: "A Lisbet Ferrer y a 23 personas más les inspira tu publicación sobre las libretas.",
    fecha: "hace 10 minutos",
    leida: false,
    enlace: "/malecon",
  },
  {
    id: "not-2",
    clase: "campana",
    texto: "La campaña del consultorio de Sakenaf publicó un comprobante de entrega.",
    fecha: "hace 1 hora",
    leida: false,
    enlace: "/la-mano",
  },
  {
    id: "not-3",
    clase: "comentario",
    texto: "orillanorte respondió en el hilo sobre precios en La Esquina.",
    fecha: "hace 3 horas",
    leida: false,
    enlace: "/la-esquina",
  },
  {
    id: "not-4",
    clase: "mercadito",
    texto: "Alguien preguntó por tu bicicleta eléctrica en El Mercadito.",
    fecha: "hace 5 horas",
    leida: true,
    enlace: "/mercadito",
  },
  {
    id: "not-5",
    clase: "empleo",
    texto: "Mango y Miel publicó dos plazas de ayudante de taller en Matanzas.",
    fecha: "hace 8 horas",
    leida: true,
    enlace: "/taller",
  },
  {
    id: "not-6",
    clase: "promotor",
    texto: "Dayana C. fue acreditada como promotora de entrega en Villa Clara.",
    fecha: "hace 1 día",
    leida: true,
    enlace: "/promotores",
  },
  {
    id: "not-7",
    clase: "invitacion",
    texto: "Te invitaron al grupo Holguineros en cualquier parte.",
    fecha: "hace 2 días",
    leida: true,
    enlace: "/mi-barrio",
  },
];

export const CONVERSACIONES: Conversacion[] = [
  {
    id: "con-1",
    nombreVisible: "Dayana Cruz",
    avatar: "DC",
    contexto: "Campaña · Consultorio de Sakenaf",
    ultimaFecha: "hace 12 minutos",
    noLeidos: 2,
    mensajes: [
      { id: "m-1", mio: false, texto: "¿Puedes acompañar la entrega del jueves?", hora: "9:12" },
      { id: "m-2", mio: true, texto: "Sí, salgo temprano de la escuela.", hora: "9:20" },
      { id: "m-3", mio: false, texto: "Perfecto, te paso el acta el miércoles.", hora: "9:22" },
    ],
  },
  {
    id: "con-2",
    nombreVisible: "guajiroconwifi",
    avatar: "RP",
    contexto: "El Mercadito · Bicicleta eléctrica",
    ultimaFecha: "hace 2 horas",
    noLeidos: 1,
    mensajes: [
      { id: "m-4", mio: false, texto: "La batería es nueva, de litio.", hora: "7:40" },
      { id: "m-5", mio: true, texto: "Gracias, lo comento en casa.", hora: "7:55" },
    ],
  },
  {
    id: "con-3",
    nombreVisible: "Lisbet Ferrer",
    avatar: "LF",
    contexto: "Taller de diseño en el solar",
    ultimaFecha: "ayer",
    noLeidos: 0,
    mensajes: [
      { id: "m-6", mio: false, texto: "El sábado repetimos la clase, ¿te apuntas?", hora: "18:02" },
      { id: "m-7", mio: true, texto: "Cuenta conmigo para llevar libretas.", hora: "18:30" },
    ],
  },
];
