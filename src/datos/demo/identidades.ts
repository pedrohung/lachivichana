import type { IdentidadTipo, Insignia } from "../tipos";

export type IdentidadVisible = {
  clave: string;
  tipo: IdentidadTipo;
  nombreVisible: string;
  avatar: string;
  detalle: string;
  insignias: Insignia[];
  enlace: string;
};

export const IDENTIDADES: IdentidadVisible[] = [
  {
    clave: "alias",
    tipo: "alias",
    nombreVisible: "vientodelsur",
    avatar: "YM",
    detalle: "Mi alias público",
    insignias: ["verificado"],
    enlace: "/perfil/vientodelsur",
  },
  {
    clave: "nombre",
    tipo: "nombre",
    nombreVisible: "Yaneisy Morales",
    avatar: "YM",
    detalle: "Mi nombre real",
    insignias: ["verificado"],
    enlace: "/perfil/vientodelsur",
  },
  {
    clave: "negocio",
    tipo: "negocio",
    nombreVisible: "Mango y Miel",
    avatar: "MM",
    detalle: "Mi negocio",
    insignias: ["negocio", "verificado"],
    enlace: "/negocio/mango-y-miel",
  },
];
