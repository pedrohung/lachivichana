import type { Promotor, TipoPromotor } from "../tipos";

export const TIPOS_PROMOTOR: Record<TipoPromotor, string> = {
  comunitario: "Comunitario",
  entrega: "De entrega",
  verificador: "Verificador",
  empresarial: "Empresarial",
  internacional: "Internacional",
  bienestar: "Protección y bienestar",
};

export const PROMOTORES: Promotor[] = [
  {
    id: "pro-1",
    nombrePublico: "Dayana C.",
    avatar: "DC",
    tipo: "internacional",
    zona: "Sevilla, España · enlaza con Villa Clara",
    acreditacion: "acreditado",
    ayudasCompletadas: 34,
    valoracion: 4.9,
    desde: "marzo de 2026",
    insignias: ["Entrega verificada", "Informes completos"],
    codigoAceptado: true,
    presentacion:
      "Coordino desde fuera y trabajo siempre con un promotor de entrega en la Isla. Publico cada acta con los datos personales tapados.",
  },
  {
    id: "pro-2",
    nombrePublico: "Promotor del Cerro",
    avatar: "PC",
    tipo: "entrega",
    zona: "La Habana (municipio Cerro)",
    acreditacion: "acreditado",
    ayudasCompletadas: 61,
    valoracion: 4.8,
    desde: "enero de 2026",
    insignias: ["Entrega verificada", "Trato respetuoso"],
    codigoAceptado: true,
    presentacion:
      "Llevo las entregas a pie por el municipio. No fotografío rostros y nunca comparto direcciones.",
  },
  {
    id: "pro-3",
    nombrePublico: "Yordanka R.",
    avatar: "YR",
    tipo: "verificador",
    zona: "Villa Clara",
    acreditacion: "acreditado",
    ayudasCompletadas: 47,
    valoracion: 5,
    desde: "febrero de 2026",
    insignias: ["Verificación en el terreno"],
    codigoAceptado: true,
    presentacion: "Visito el lugar antes de que una campaña se abra y confirmo lo que se pide.",
  },
  {
    id: "pro-4",
    nombrePublico: "Taller Almendares",
    avatar: "TA",
    tipo: "empresarial",
    zona: "La Habana",
    acreditacion: "acreditado",
    ayudasCompletadas: 22,
    valoracion: 4.7,
    desde: "abril de 2026",
    insignias: ["Negocio solidario"],
    codigoAceptado: true,
    presentacion: "Aportamos reparaciones gratuitas y transporte para campañas del municipio.",
  },
  {
    id: "pro-5",
    nombrePublico: "Casa de Todos",
    avatar: "CT",
    tipo: "bienestar",
    zona: "Camagüey",
    acreditacion: "en-formacion",
    ayudasCompletadas: 6,
    valoracion: 4.5,
    desde: "julio de 2026",
    insignias: ["Formación en curso"],
    codigoAceptado: true,
    presentacion:
      "Acompañamos a personas mayores que viven solas. Estamos completando la formación obligatoria.",
  },
  {
    id: "pro-6",
    nombrePublico: "Vecinos de Bayamo",
    avatar: "VB",
    tipo: "comunitario",
    zona: "Bayamo, Granma",
    acreditacion: "en-revision",
    ayudasCompletadas: 0,
    valoracion: 0,
    desde: "agosto de 2026",
    insignias: [],
    codigoAceptado: false,
    presentacion: "Grupo de vecinos que pide acreditarse para organizar ayudas tras las lluvias.",
  },
];

export function buscarPromotor(id: string) {
  return PROMOTORES.find((p) => p.id === id);
}
