import {
  Waves,
  Home,
  Store,
  HandHeart,
  Hammer,
  Users,
  MessageSquareQuote,
  Route as RouteIcon,
  BadgeCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type EntradaNavegacion = {
  ruta: string;
  nombre: string;
  icono: LucideIcon;
  descripcion: string;
};

export const NAVEGACION: EntradaNavegacion[] = [
  {
    ruta: "/malecon",
    nombre: "El Malecón",
    icono: Waves,
    descripcion: "El muro donde la comunidad cuenta lo que pasa.",
  },
  {
    ruta: "/mi-barrio",
    nombre: "Mi Barrio",
    icono: Home,
    descripcion: "Grupos y comunidades por provincia, oficio o afinidad.",
  },
  {
    ruta: "/mercadito",
    nombre: "El Mercadito",
    icono: Store,
    descripcion: "Ventas, intercambios, servicios y donaciones.",
  },
  {
    ruta: "/la-mano",
    nombre: "La Mano",
    icono: HandHeart,
    descripcion: "Campañas de ayuda con seguimiento y entrega verificable.",
  },
  {
    ruta: "/taller",
    nombre: "El Taller",
    icono: Hammer,
    descripcion: "Empleos, mentorías y formación dentro y fuera de la Isla.",
  },
  {
    ruta: "/colmena",
    nombre: "La Colmena",
    icono: Users,
    descripcion: "Negocios, profesionales y colaboraciones.",
  },
  {
    ruta: "/la-esquina",
    nombre: "La Esquina",
    icono: MessageSquareQuote,
    descripcion: "Opinión y debate sin faltarle el respeto a nadie.",
  },
  {
    ruta: "/mis-caminos",
    nombre: "Mis Caminos",
    icono: RouteIcon,
    descripcion: "Conexiones, seguidores e invitaciones.",
  },
  {
    ruta: "/promotores",
    nombre: "Los Promotores",
    icono: BadgeCheck,
    descripcion: "Red acreditada que verifica y entrega la ayuda.",
  },
  {
    ruta: "/mi-chivichana",
    nombre: "Mi Chivichana",
    icono: UserCog,
    descripcion: "Tu perfil público y tus datos privados, separados.",
  },
];

export function buscarSeccion(ruta: string) {
  return NAVEGACION.find((n) => n.ruta === ruta);
}