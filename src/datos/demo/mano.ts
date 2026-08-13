import type { Campana } from "../tipos";

export const CATEGORIAS_CAMPANA = [
  "Salud",
  "Educación",
  "Alimentación",
  "Vivienda",
  "Adultos mayores",
  "Desastres naturales",
];

export const ETIQUETA_ESTADO: Record<Campana["estado"], string> = {
  revision: "En revisión",
  verificada: "Verificada",
  recaudando: "Recaudando",
  "en-camino": "Ayuda en camino",
  entregada: "Entregada",
  justificacion: "Justificación pendiente",
  completada: "Completada",
  suspendida: "Suspendida",
};

export const CAMPANAS: Campana[] = [
  {
    id: "cmp-1",
    titulo: "Insumos básicos para el consultorio de Sakenaf",
    resumen:
      "Guantes, gasas y dos tensiómetros para el consultorio que atiende a 340 familias del reparto.",
    descripcion:
      "El consultorio atiende consultas diarias sin material fungible suficiente. Pedimos guantes, gasas estériles y dos tensiómetros. La entrega se hace al personal del consultorio con acta firmada y se publica el comprobante con los datos personales tapados.",
    categoria: "Salud",
    zona: "Santa Clara, Villa Clara",
    estado: "recaudando",
    meta: 100,
    recaudado: 64,
    unidad: "% de lo necesario",
    apoyos: 187,
    creada: "2 de agosto de 2026",
    entregaEstimada: "12 de septiembre de 2026",
    promotor: "Dayana C. — promotora de entrega",
    actualizaciones: [
      {
        fecha: "2 de agosto",
        titulo: "Solicitud recibida",
        detalle: "Una vecina del reparto presenta la necesidad con el aval del consultorio.",
        estado: "revision",
      },
      {
        fecha: "5 de agosto",
        titulo: "Verificación en el terreno",
        detalle: "Un promotor verificador visita el consultorio y confirma el listado de insumos.",
        estado: "verificada",
      },
      {
        fecha: "8 de agosto",
        titulo: "Recogida abierta",
        detalle: "Se abre el apoyo de la comunidad con seguimiento público de cada avance.",
        estado: "recaudando",
      },
    ],
    comprobantes: [
      {
        titulo: "Aval del consultorio",
        nota: "Documento con datos personales ocultos",
        protegido: true,
      },
      { titulo: "Listado de insumos", nota: "Revisado por promotor verificador", protegido: false },
    ],
    mensajePromotor:
      "Voy al consultorio los martes. Publico foto del acta en cuanto se entregue la primera parte.",
  },
  {
    id: "cmp-2",
    titulo: "Merienda escolar para el aula de tercer grado",
    resumen: "Pan, leche en polvo y frutas para 28 niños durante un trimestre.",
    descripcion:
      "Un grupo de familias y la maestra organizan la merienda del aula. Sin fotos de los niños ni nombres: se publica solo el conteo de entregas y el comprobante de compra.",
    categoria: "Educación",
    zona: "Cienfuegos",
    estado: "en-camino",
    meta: 100,
    recaudado: 92,
    unidad: "% de lo necesario",
    apoyos: 233,
    creada: "18 de julio de 2026",
    entregaEstimada: "1 de septiembre de 2026",
    promotor: "Promotor comunitario de Cienfuegos",
    actualizaciones: [
      {
        fecha: "18 de julio",
        titulo: "Solicitud recibida",
        detalle: "Presentada por la maestra del aula.",
        estado: "revision",
      },
      {
        fecha: "21 de julio",
        titulo: "Campaña verificada",
        detalle: "Se comprueba el aula y la matrícula.",
        estado: "verificada",
      },
      {
        fecha: "10 de agosto",
        titulo: "Compra realizada",
        detalle: "Se compran los primeros lotes de leche y pan.",
        estado: "en-camino",
      },
    ],
    comprobantes: [
      {
        titulo: "Factura del primer lote",
        nota: "Importe visible, datos privados ocultos",
        protegido: false,
      },
    ],
    mensajePromotor: "El reparto empieza la primera semana de curso.",
  },
  {
    id: "cmp-3",
    titulo: "Techo para la casa de doña Amparo",
    resumen: "Reposición de planchas de techo tras las lluvias de julio.",
    descripcion:
      "La vivienda perdió parte del techo. Se solicitan planchas y clavos. La beneficiaria pidió no aparecer en fotos: se publican imágenes de la obra, nunca de la persona.",
    categoria: "Vivienda",
    zona: "Bayamo, Granma",
    estado: "entregada",
    meta: 100,
    recaudado: 100,
    unidad: "% de lo necesario",
    apoyos: 412,
    creada: "3 de julio de 2026",
    entregaEstimada: "20 de agosto de 2026",
    promotor: "Promotor de entrega de Granma",
    actualizaciones: [
      {
        fecha: "3 de julio",
        titulo: "Solicitud recibida",
        detalle: "Presentada por un vecino con permiso de la familia.",
        estado: "revision",
      },
      {
        fecha: "6 de julio",
        titulo: "Verificada",
        detalle: "Visita del verificador y fotos de la obra.",
        estado: "verificada",
      },
      {
        fecha: "19 de agosto",
        titulo: "Materiales entregados",
        detalle: "Se entregan 14 planchas y la clavazón.",
        estado: "entregada",
      },
      {
        fecha: "22 de agosto",
        titulo: "Falta el informe final",
        detalle: "El promotor prepara el informe con fotos de la obra terminada.",
        estado: "justificacion",
      },
    ],
    comprobantes: [
      { titulo: "Acta de entrega", nota: "Firmas y documento ocultos", protegido: true },
    ],
    mensajePromotor: "La obra está terminada; subo el informe esta semana.",
  },
  {
    id: "cmp-4",
    titulo: "Medicinas para adultos mayores del Cerro",
    resumen: "Antihipertensivos y analgésicos para nueve personas mayores que viven solas.",
    descripcion:
      "Campaña coordinada entre una promotora internacional y un promotor de entrega en La Habana. Cada entrega se registra por número de caso, sin nombres.",
    categoria: "Adultos mayores",
    zona: "La Habana",
    estado: "verificada",
    meta: 100,
    recaudado: 12,
    unidad: "% de lo necesario",
    apoyos: 46,
    creada: "9 de agosto de 2026",
    entregaEstimada: "30 de septiembre de 2026",
    promotor: "Dayana C. — promotora internacional",
    actualizaciones: [
      {
        fecha: "9 de agosto",
        titulo: "Solicitud recibida",
        detalle: "Presentada por un grupo de vecinos del municipio.",
        estado: "revision",
      },
      {
        fecha: "11 de agosto",
        titulo: "Campaña verificada",
        detalle: "Se confirman los casos con el consultorio del área.",
        estado: "verificada",
      },
    ],
    comprobantes: [],
    mensajePromotor: "Estamos empezando. Toda ayuda, por pequeña que sea, cuenta.",
  },
  {
    id: "cmp-5",
    titulo: "Reparar la bomba de agua del edificio 12",
    resumen: "Una pieza y mano de obra para devolver el agua a 32 apartamentos.",
    descripcion:
      "Los vecinos reunieron parte del dinero. Falta la pieza principal. El trabajo lo hace un taller del barrio con garantía escrita.",
    categoria: "Vivienda",
    zona: "Camagüey",
    estado: "revision",
    meta: 100,
    recaudado: 0,
    unidad: "% de lo necesario",
    apoyos: 0,
    creada: "10 de agosto de 2026",
    entregaEstimada: "por confirmar",
    promotor: "Pendiente de asignación",
    actualizaciones: [
      {
        fecha: "10 de agosto",
        titulo: "Solicitud recibida",
        detalle: "En espera de que un verificador visite el edificio.",
        estado: "revision",
      },
    ],
    comprobantes: [],
  },
  {
    id: "cmp-6",
    titulo: "Libros y libretas para la biblioteca del barrio",
    resumen: "Material de lectura y escritura para un espacio comunitario de estudio.",
    descripcion:
      "Campaña cerrada con informe final publicado. Se entregaron 180 libretas, 60 libros y material de dibujo.",
    categoria: "Educación",
    zona: "Holguín",
    estado: "completada",
    meta: 100,
    recaudado: 100,
    unidad: "% de lo necesario",
    apoyos: 356,
    creada: "2 de junio de 2026",
    entregaEstimada: "30 de julio de 2026",
    promotor: "Promotor comunitario de Holguín",
    actualizaciones: [
      {
        fecha: "2 de junio",
        titulo: "Solicitud recibida",
        detalle: "Presentada por el grupo del barrio.",
        estado: "revision",
      },
      {
        fecha: "7 de junio",
        titulo: "Verificada",
        detalle: "Visita al local y listado de necesidades.",
        estado: "verificada",
      },
      {
        fecha: "28 de julio",
        titulo: "Entrega realizada",
        detalle: "Material entregado y contado con dos testigos.",
        estado: "entregada",
      },
      {
        fecha: "30 de julio",
        titulo: "Informe final publicado",
        detalle: "Cuentas y fotos del local disponibles para la comunidad.",
        estado: "completada",
      },
    ],
    comprobantes: [
      { titulo: "Informe final", nota: "Cuentas completas de la campaña", protegido: false },
      { titulo: "Acta de entrega", nota: "Firmas ocultas", protegido: true },
    ],
    informeFinal:
      "Se recibieron aportes de 356 personas. Se compraron 180 libretas, 60 libros y material de dibujo. Sobró un 4 %, que quedó registrado para la próxima campaña del mismo barrio.",
  },
];

export function buscarCampana(id: string) {
  return CAMPANAS.find((c) => c.id === id);
}
