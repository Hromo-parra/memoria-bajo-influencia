/*
 * Contenido científico del protocolo.
 * Mantener este archivo separado de la interfaz facilita auditar preguntas,
 * claves y condiciones antes de cada versión del estudio.
 */
window.STUDY_DATA = {
  meta: {
    title: "Memoria bajo influencia",
    version: "0.1.0",
    delayDays: 7,
    seed: "MEMORIA-2026-v01",
    authors: [
      "Mariana Rodríguez Martínez",
      "María Fernanda Negrete Martín del Campo"
    ]
  },

  assignments: {
    V1: { immediate: "A", delayed: "B", list: 1 },
    V2: { immediate: "A", delayed: "B", list: 2 },
    V3: { immediate: "A", delayed: "B", list: 3 },
    V4: { immediate: "B", delayed: "A", list: 1 },
    V5: { immediate: "B", delayed: "A", list: 2 },
    V6: { immediate: "B", delayed: "A", list: 3 }
  },

  details: [
    {
      id: "DC01", short: "Mochila", real: "Mochila negra", misleading: "Mochila azul",
      correctText: "La estudiante entró al establecimiento con una mochila negra.",
      misleadingText: "La estudiante entró al establecimiento con una mochila azul.",
      conditions: ["C", "E", "N"]
    },
    {
      id: "DC02", short: "Sudadera", real: "Sudadera gris", misleading: "Sudadera beige",
      correctText: "Llevaba una sudadera gris.",
      misleadingText: "Llevaba una sudadera beige.",
      conditions: ["E", "N", "C"]
    },
    {
      id: "DC03", short: "Bebida", real: "Café", misleading: "Té",
      correctText: "En el mostrador pidió un café.",
      misleadingText: "En el mostrador pidió un té.",
      conditions: ["C", "E", "N"]
    },
    {
      id: "DC04", short: "Pago", real: "Efectivo", misleading: "Tarjeta",
      correctText: "Pagó su bebida en efectivo.",
      misleadingText: "Pagó su bebida con tarjeta.",
      conditions: ["N", "C", "E"]
    },
    {
      id: "DC05", short: "Mesa", real: "Junto a una ventana", misleading: "Junto a la puerta",
      correctText: "Después eligió una mesa situada junto a una ventana.",
      misleadingText: "Después eligió una mesa situada junto a la puerta.",
      conditions: ["C", "E", "N"]
    },
    {
      id: "DC06", short: "Objeto en mesa", real: "Llaves", misleading: "Audífonos",
      correctText: "Al acomodarse, dejó unas llaves sobre la mesa.",
      misleadingText: "Al acomodarse, dejó unos audífonos sobre la mesa.",
      conditions: ["E", "N", "C"]
    },
    {
      id: "DC07", short: "Cuaderno", real: "Cuaderno azul", misleading: "Cuaderno verde",
      correctText: "Sacó un cuaderno azul para comenzar a trabajar.",
      misleadingText: "Sacó un cuaderno verde para comenzar a trabajar.",
      conditions: ["E", "N", "C"]
    },
    {
      id: "DC08", short: "Dispositivo", real: "Celular", misleading: "Reloj",
      correctText: "Mientras estudiaba, revisó brevemente su celular.",
      misleadingText: "Mientras estudiaba, revisó brevemente su reloj.",
      conditions: ["N", "C", "E"]
    },
    {
      id: "DC09", short: "Playera", real: "Playera blanca", misleading: "Playera negra",
      correctText: "Más tarde llegó un joven que llevaba una playera blanca.",
      misleadingText: "Más tarde llegó un joven que llevaba una playera negra.",
      conditions: ["N", "C", "E"]
    },
    {
      id: "DC10", short: "Posición", real: "Enfrente de ella", misleading: "A su lado",
      correctText: "El joven se sentó enfrente de la estudiante.",
      misleadingText: "El joven se sentó a un lado de la estudiante.",
      conditions: ["C", "E", "N"]
    },
    {
      id: "DC11", short: "Objeto entregado", real: "Hoja de papel", misleading: "Libro",
      correctText: "Al reunirse con ella, le entregó una hoja de papel.",
      misleadingText: "Al reunirse con ella, le entregó un libro.",
      conditions: ["E", "N", "C"]
    },
    {
      id: "DC12", short: "Bebidas", real: "Dos", misleading: "Tres",
      correctText: "Durante la reunión había dos bebidas visibles sobre la mesa.",
      misleadingText: "Durante la reunión había tres bebidas visibles sobre la mesa.",
      conditions: ["N", "C", "E"]
    },
    {
      id: "DC13", short: "Guarda cuaderno", real: "Ella", misleading: "Él",
      correctText: "Al terminar, la estudiante guardó el cuaderno.",
      misleadingText: "Al terminar, el compañero guardó el cuaderno.",
      conditions: ["C", "E", "N"]
    },
    {
      id: "DC14", short: "Recoge llaves", real: "Ella", misleading: "Él",
      correctText: "Antes de irse, la estudiante recogió las llaves.",
      misleadingText: "Antes de irse, el compañero recogió las llaves.",
      conditions: ["N", "C", "E"]
    },
    {
      id: "DC15", short: "Salida", real: "Ella primero", misleading: "Él primero",
      correctText: "La estudiante salió primero de la cafetería.",
      misleadingText: "El compañero salió primero de la cafetería.",
      conditions: ["E", "N", "C"]
    }
  ],

  questions: {
    A: [
      {
        id: "DC01", item: "A1", type: "choice",
        prompt: "¿De qué color era la mochila que llevaba la chica al entrar a la cafetería?",
        options: ["Azul", "Negra", "Roja", "Blanca", "No lo recuerdo"],
        correct: ["negra"], misleading: ["azul"]
      },
      {
        id: "DC02", item: "A2", type: "choice",
        prompt: "¿De qué color era la sudadera de la chica?",
        options: ["Azul", "Beige", "Gris", "Negra", "No lo recuerdo"],
        correct: ["gris"], misleading: ["beige"]
      },
      {
        id: "DC04", item: "A3", type: "open",
        prompt: "¿Con qué medio de pago pagó la chica antes de sentarse?",
        placeholder: "Escribe una respuesta breve",
        correct: ["efectivo", "en efectivo", "con efectivo", "dinero", "billete", "billetes"],
        misleading: ["tarjeta", "con tarjeta"]
      },
      {
        id: "DC05", item: "A4", type: "choice",
        prompt: "¿En qué parte de la cafetería estaba la mesa donde se sentó la chica?",
        options: ["Junto al mostrador", "Junto a la puerta", "Junto a una ventana", "En el centro del lugar", "No lo recuerdo"],
        correct: ["junto a una ventana"], misleading: ["junto a la puerta"]
      },
      {
        id: "DC07", item: "A5", type: "choice",
        prompt: "¿De qué color era el cuaderno que utilizó la chica?",
        options: ["Verde", "Negro", "Rojo", "Azul", "No lo recuerdo"],
        correct: ["azul"], misleading: ["verde"]
      },
      {
        id: "DC08", item: "A6", type: "choice",
        prompt: "¿Qué dispositivo tomó en sus manos y miró brevemente mientras estaba sentada sola?",
        options: ["Un reloj", "El cuaderno", "La bebida", "Un celular", "No lo recuerdo"],
        correct: ["un celular", "celular"], misleading: ["un reloj", "reloj"]
      },
      {
        id: "DC13", item: "A7", type: "choice",
        prompt: "Al prepararse para salir, ¿quién guardó el cuaderno?",
        options: ["La chica", "Ambos", "La empleada", "El chico", "No lo recuerdo"],
        correct: ["la chica", "chica"], misleading: ["el chico", "chico"]
      },
      {
        id: "DC15", item: "A8", type: "open",
        prompt: "¿Quién salió primero de la cafetería?",
        placeholder: "Escribe quién salió primero",
        correct: ["ella", "la chica", "chica", "la mujer", "mujer", "estudiante"],
        misleading: ["él", "el", "el chico", "chico", "compañero"]
      }
    ],
    B: [
      {
        id: "DC03", item: "B1", type: "choice",
        prompt: "¿Qué bebida recibió la chica?",
        options: ["Té", "Chocolate caliente", "Café", "Agua", "No lo recuerdo"],
        correct: ["café", "cafe"], misleading: ["té", "te"]
      },
      {
        id: "DC06", item: "B2", type: "open",
        prompt: "¿Qué objeto pequeño dejó la chica sobre la mesa?",
        placeholder: "Escribe una respuesta breve",
        correct: ["llaves", "unas llaves", "las llaves", "llave", "llavero"],
        misleading: ["audífonos", "audifonos", "unos audífonos", "unos audifonos"]
      },
      {
        id: "DC09", item: "B3", type: "choice",
        prompt: "¿De qué color era la playera del chico que se sentó con ella?",
        options: ["Negra", "Gris", "Blanca", "Azul", "No lo recuerdo"],
        correct: ["blanca"], misleading: ["negra"]
      },
      {
        id: "DC10", item: "B4", type: "choice",
        prompt: "¿Dónde se sentó el chico con respecto a la chica?",
        options: ["A su lado", "En otra mesa", "Enfrente de ella", "Detrás de ella", "No lo recuerdo"],
        correct: ["enfrente de ella"], misleading: ["a su lado"]
      },
      {
        id: "DC11", item: "B5", type: "open",
        prompt: "¿Qué tipo de material revisaron juntos la chica y el chico?",
        placeholder: "Escribe una respuesta breve",
        correct: ["hoja", "papel", "hoja de papel", "una hoja", "una hoja de papel"],
        misleading: ["libro", "un libro"]
      },
      {
        id: "DC12", item: "B6", type: "choice",
        prompt: "Cuando ambos estaban sentados, ¿cuántas bebidas había sobre la mesa?",
        options: ["Tres", "Una", "Cuatro", "Dos", "No lo recuerdo"],
        correct: ["dos"], misleading: ["tres"]
      },
      {
        id: "DC14", item: "B7", type: "choice",
        prompt: "Al prepararse para salir, ¿quién recogió las llaves de la mesa?",
        options: ["El chico", "Ambos", "La chica", "La empleada", "No lo recuerdo"],
        correct: ["la chica", "chica"], misleading: ["el chico", "chico"]
      },
      {
        id: "F01", item: "B8", type: "choice", filler: true,
        prompt: "¿En qué tipo de lugar ocurrió la escena principal?",
        options: ["Una biblioteca", "Una cafetería", "Una oficina", "Un salón de clases", "No lo recuerdo"],
        correct: ["una cafetería", "cafetería", "cafeteria"], misleading: []
      }
    ]
  },

  distractors: [
    { common: "●", odd: "○" },
    { common: "▲", odd: "△" },
    { common: "■", odd: "□" },
    { common: "◆", odd: "◇" },
    { common: "★", odd: "☆" },
    { common: "◀", odd: "▶" },
    { common: "◐", odd: "◑" },
    { common: "⊕", odd: "⊗" },
    { common: "▲", odd: "▼" },
    { common: "◉", odd: "◎" },
    { common: "⬢", odd: "⬡" },
    { common: "◢", odd: "◣" }
  ],

  sources: [
    { value: "video", label: "Video" },
    { value: "postevent", label: "Información posterior" },
    { value: "inference", label: "Inferencia" },
    { value: "no_recall", label: "No recuerda" }
  ]
};
