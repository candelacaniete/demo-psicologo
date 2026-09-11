import type { NicheType } from "@/src/types/funnel";

export type LandingContent = {
  brand: string;
  badge: string;
  headline: string;
  subhead: string;
  stickyCta: string;
  formEyebrow: string;
  formTitle: string;
  step1Title: string;
  step2Title: string;
  trustLine: string;
  howTitle: string;
  howSteps: Array<{ title: string; text: string }>;
  socialTitle: string;
  testimonials: Array<{ quote: string; author: string }>;
  stats: Array<{ value: string; label: string }>;
  specializeTitle: string;
  specializeText: string;
  specializeTags: string[];
  urgency: string;
  priceTitle: string;
  priceText: string;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
  resultHot: string;
  resultWarm: string;
  resultCold: string;
  theme: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    border: string;
    heroOverlay: string;
  };
};

export const LANDING_CONTENT: Record<NicheType, LandingContent> = {
  inmobiliaria: {
    brand: "Inmobiliaria Demo Sur",
    badge: "Especialistas en compra y alquiler",
    headline: "Encontrá tu próxima propiedad sin perder semanas en portales",
    subhead:
      "Completá 2 minutos de preguntas. Te calificamos al instante y un asesor te continúa por WhatsApp.",
    stickyCta: "Empezar consulta",
    formEyebrow: "Consulta gratuita",
    formTitle: "Contanos qué buscás",
    step1Title: "1 · Tu búsqueda",
    step2Title: "2 · Tus datos",
    trustLine: "Sin compromiso · No compartimos tu número · Respuesta hoy",
    howTitle: "Cómo funciona",
    howSteps: [
      {
        title: "Completás el formulario",
        text: "Presupuesto, zona y urgencia. Sin vueltas.",
      },
      {
        title: "Te calificamos al instante",
        text: "Sabemos si podemos ayudarte antes de pedirte tiempo.",
      },
      {
        title: "Seguís por WhatsApp",
        text: "Un asesor humano continúa con opciones concretas.",
      },
    ],
    socialTitle: "Lo que dicen quienes ya consultaron",
    testimonials: [
      {
        quote:
          "En 10 minutos ya tenía tres opciones alineadas a mi presupuesto. Cero spam.",
        author: "M.L. · compra en Palermo",
      },
      {
        quote:
          "Me filtraron lo que no servía. Por fin alguien que entiende urgencia real.",
        author: "R.G. · alquiler ejecutivos",
      },
      {
        quote: "El formulario fue claro y después WhatsApp fue directo al punto.",
        author: "A.P. · primer depto",
      },
    ],
    stats: [
      { value: "48h", label: "primeras opciones en promedio" },
      { value: "1.2k+", label: "consultas acompañadas" },
      { value: "15 min", label: "primera respuesta típica" },
    ],
    specializeTitle: "No somos un portal genérico",
    specializeText:
      "Trabajamos con busca activa y presupuesto definido. Si estás solo mirando sin rango, te lo decimos con honestidad.",
    specializeTags: ["CABA & GBA", "Compra desde USD 50k", "Alquileres selectos"],
    urgency: "Quedan turnos de asesoría para esta semana.",
    priceTitle: "¿Cuánto cuesta consultar?",
    priceText:
      "La orientación inicial es sin cargo. Si avanzás, te explicamos honorarios con claridad antes de cualquier compromiso.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Me van a llamar sin avisar?",
        a: "No. Seguimos por WhatsApp según tu ritmo, salvo que pidas llamada.",
      },
      {
        q: "¿Atienden fuera de CABA?",
        a: "Sí, GBA y algunas plazas del interior con operación concreta.",
      },
      {
        q: "¿Qué pasa si mi presupuesto es bajo?",
        a: "Te lo decimos de frente. Preferimos filtrar antes que generar falsas expectativas.",
      },
      {
        q: "¿Cuánto tardan en responder?",
        a: "En horario hábil, suele ser en minutos después de que abras WhatsApp.",
      },
    ],
    resultHot:
      "Prioridad alta: tu perfil encaja. Un asesor te continúa ahora por WhatsApp.",
    resultWarm:
      "Recibimos tu consulta. Continuá por WhatsApp para afinar opciones.",
    resultCold:
      "Gracias. Con estos datos hoy no podemos avanzar bien; igual podés escribirnos por WhatsApp si querés orientación.",
    theme: {
      bg: "bg-[#f4f7f5]",
      surface: "bg-white",
      text: "text-zinc-900",
      muted: "text-zinc-600",
      accent: "bg-emerald-700",
      accentHover: "hover:bg-emerald-800",
      accentSoft: "bg-emerald-50 text-emerald-900",
      border: "border-emerald-900/10",
      heroOverlay:
        "linear-gradient(120deg, rgba(6,46,32,0.72), rgba(6,46,32,0.25))",
    },
  },
  arquitectos: {
    brand: "Estudio Norte Arquitectura",
    badge: "Obra nueva y remodelación",
    headline: "Diseño con criterio: proyectos que se pueden construir",
    subhead:
      "Contanos metros, terreno y alcance. Te decimos al instante si encaja con el estudio y seguimos por WhatsApp.",
    stickyCta: "Evaluar mi proyecto",
    formEyebrow: "Diagnóstico de encaje",
    formTitle: "Datos de tu proyecto",
    step1Title: "1 · El proyecto",
    step2Title: "2 · Contacto",
    trustLine: "Sin compromiso · Respuesta clara · Sin jerga innecesaria",
    howTitle: "Cómo trabajamos el primer contacto",
    howSteps: [
      {
        title: "Definís el alcance",
        text: "Tipo de obra, m² y si ya hay terreno.",
      },
      {
        title: "Vemos si hay fit",
        text: "Filtramos proyectos chicos o indefinidos sin rodeos.",
      },
      {
        title: "Coordinamos por WhatsApp",
        text: "Si hay match, agendamos el siguiente paso con el estudio.",
      },
    ],
    socialTitle: "Clientes del estudio",
    testimonials: [
      {
        quote:
          "Nos dijeron rápido qué era viable. Ahorramos meses de idas y vueltas.",
        author: "Familia R. · remodelación 160 m²",
      },
      {
        quote: "El formulario ya ordenó la conversación. Llegamos preparados.",
        author: "Inversor C. · obra nueva",
      },
      {
        quote: "Claridad total sobre tiempos y alcance desde el día uno.",
        author: "M.S. · vivienda unifamiliar",
      },
    ],
    stats: [
      { value: "100m²+", label: "proyectos donde mejor rendimos" },
      { value: "12+", label: "años de obra acompañada" },
      { value: "72h", label: "respuesta de encaje" },
    ],
    specializeTitle: "Para quién sí (y para quién no)",
    specializeText:
      "Priorizamos obras con terreno o remodelaciones serias. Briefs vagos o micro-intervenciones no son nuestro foco.",
    specializeTags: ["≥ 100 m²", "Terreno o propiedad", "Obra / remodelación"],
    urgency: "Estamos tomando 4 proyectos nuevos este trimestre.",
    priceTitle: "Inversión y transparencia",
    priceText:
      "La evaluación de encaje no tiene costo. Si seguimos, te compartimos rangos de honorarios antes de avanzar.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Hacen solo diseño o también dirección?",
        a: "Ambos, según el proyecto. Lo definimos después del encaje.",
      },
      {
        q: "¿Trabajan fuera de la ciudad?",
        a: "Sí, con logística clara. Contanos ubicación en el formulario.",
      },
      {
        q: "¿Qué pasa si aún no tengo terreno?",
        a: "Podemos orientarte, pero el fit fuerte es con terreno/propiedad definida.",
      },
      {
        q: "¿Cuánto tarda un anteproyecto?",
        a: "Depende del alcance; te damos una estimación realista en el primer intercambio.",
      },
    ],
    resultHot:
      "Hay buen fit con el estudio. Continuá por WhatsApp para coordinar el próximo paso.",
    resultWarm:
      "Proyecto recibido. Sigamos por WhatsApp para precisar alcance y tiempos.",
    resultCold:
      "Con este alcance probablemente no somos el estudio ideal. Igual podés escribirnos si querés una orientación breve.",
    theme: {
      bg: "bg-[#f3f1ee]",
      surface: "bg-white",
      text: "text-stone-900",
      muted: "text-stone-600",
      accent: "bg-stone-800",
      accentHover: "hover:bg-stone-900",
      accentSoft: "bg-stone-100 text-stone-800",
      border: "border-stone-300/70",
      heroOverlay:
        "linear-gradient(120deg, rgba(41,37,36,0.75), rgba(41,37,36,0.2))",
    },
  },
  abogados: {
    brand: "Estudio Legal Atlas",
    badge: "Corporativo · Civil · Laboral",
    headline: "Orientación legal clara, sin rodeos ni falsa urgencia",
    subhead:
      "Contanos área, urgencia y capacidad de avance. Te clasificamos al instante y un abogado continúa por WhatsApp.",
    stickyCta: "Consultar ahora",
    formEyebrow: "Primera orientación",
    formTitle: "Datos de tu consulta",
    step1Title: "1 · Tu caso",
    step2Title: "2 · Contacto",
    trustLine: "Confidencial · Sin compromiso · Respuesta humana",
    howTitle: "Del formulario al estudio",
    howSteps: [
      {
        title: "Describís el caso",
        text: "Área, urgencia y capacidad de abono mensual.",
      },
      {
        title: "Filtramos viabilidad",
        text: "Si no atendemos esa área, te lo decimos ya.",
      },
      {
        title: "Seguís por WhatsApp",
        text: "Un abogado retoma con los próximos pasos.",
      },
    ],
    socialTitle: "Confianza de quienes consultaron",
    testimonials: [
      {
        quote:
          "Me explicaron viabilidad en una charla corta. Cero presión comercial.",
        author: "Empresa familiar · societario",
      },
      {
        quote: "Respuesta rápida y tono humano. Eso hoy es raro.",
        author: "Consulta laboral",
      },
      {
        quote: "El formulario evitó que pierda tiempo en una área que no cubren.",
        author: "Cliente civil",
      },
    ],
    stats: [
      { value: "<1h", label: "respuesta hábil típica" },
      { value: "3 áreas", label: "corporativo, civil, laboral" },
      { value: "100%", label: "confidencialidad" },
    ],
    specializeTitle: "Áreas que sí atendemos",
    specializeText:
      "Corporativo, civil/familia y laboral. Si tu caso es otra rama, te lo marcamos para no hacerte perder tiempo.",
    specializeTags: ["Corporativo", "Civil", "Laboral", "Urgencias reales"],
    urgency: "Prioridad esta semana para casos de urgencia alta.",
    priceTitle: "Honorarios con claridad",
    priceText:
      "La primera orientación no implica contratación. Si hay encaje, hablamos de abono o esquema antes de avanzar.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Es confidencial?",
        a: "Sí. Tratamos tu consulta con reserva profesional desde el primer mensaje.",
      },
      {
        q: "¿Atienden online?",
        a: "Sí. Muchas gestiones arrancan 100% virtuales.",
      },
      {
        q: "¿Qué pasa si no cubren mi área?",
        a: "Te lo informamos al instante. Preferimos honestidad a forzar una consulta que no podemos atender.",
      },
      {
        q: "¿Puedo enviar documentos?",
        a: "Sí, una vez abierto el canal de WhatsApp con el estudio.",
      },
    ],
    resultHot:
      "Caso prioritario. Continuá por WhatsApp para que un abogado tome la consulta.",
    resultWarm:
      "Consulta recibida. Seguí por WhatsApp para completar detalles con el estudio.",
    resultCold:
      "Con esta información quizás no seamos el estudio adecuado. Podés escribir igual si querés una derivación orientativa.",
    theme: {
      bg: "bg-[#eef1f5]",
      surface: "bg-white",
      text: "text-slate-900",
      muted: "text-slate-600",
      accent: "bg-slate-800",
      accentHover: "hover:bg-slate-900",
      accentSoft: "bg-slate-100 text-slate-800",
      border: "border-slate-300/80",
      heroOverlay:
        "linear-gradient(120deg, rgba(15,23,42,0.78), rgba(15,23,42,0.25))",
    },
  },
  hospedajes: {
    brand: "Boutique Stay Patagonia",
    badge: "Estadías con atención real",
    headline: "Reservá con claridad: fechas, huéspedes y respuesta humana",
    subhead:
      "Indicá noches y fechas. Te confirmamos encaje al instante y seguimos la reserva por WhatsApp.",
    stickyCta: "Consultar disponibilidad",
    formEyebrow: "Consulta de estadía",
    formTitle: "Armá tu pedido",
    step1Title: "1 · La estadía",
    step2Title: "2 · Tus datos",
    trustLine: "Sin cargo por consultar · Confirmación por WhatsApp · Cupos reales",
    howTitle: "De la web a tu reserva",
    howSteps: [
      {
        title: "Pasás fechas y huéspedes",
        text: "Noches, tipo de viaje y fechas tentativas.",
      },
      {
        title: "Vemos disponibilidad",
        text: "Si no hay cupo o fit, te lo decimos rápido.",
      },
      {
        title: "Cerrás por WhatsApp",
        text: "Te mandamos opciones y siguientes pasos.",
      },
    ],
    socialTitle: "Huéspedes recientes",
    testimonials: [
      {
        quote: "Consulté un viernes y el sábado ya tenía opciones claras.",
        author: "Pareja · fin de semana",
      },
      {
        quote: "Ideal para viaje corporativo: rápido y sin formularios eternos.",
        author: "Equipo comercial",
      },
      {
        quote: "El WhatsApp precargado ya llevaba mis fechas. Impecable.",
        author: "Familia · 4 huéspedes",
      },
    ],
    stats: [
      { value: "2+ noches", label: "donde mejor resolvemos" },
      { value: "24/7", label: "canal WhatsApp activo" },
      { value: "98%", label: "consultas respondidas mismo día" },
    ],
    specializeTitle: "Estadías con criterio boutique",
    specializeText:
      "Priorizamos estadías de 2+ noches y pedidos con fechas. Pedidos indefinidos se orientan, pero no se priorizan.",
    specializeTags: ["Placer", "Corporativo", "2+ noches", "Grupos chicos"],
    urgency: "Fines de semana cercanos con cupos limitados.",
    priceTitle: "Consultar no obliga",
    priceText:
      "Pedís disponibilidad sin costo. Tarifas y condiciones se confirman antes de cualquier seña.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Puedo reservar para la misma semana?",
        a: "A veces sí. Completá fechas y lo vemos al instante por WhatsApp.",
      },
      {
        q: "¿Aceptan mascotas / cuna?",
        a: "Depende de la unidad. Consultalo en el chat con el detalle de tu estadía.",
      },
      {
        q: "¿Hay check-in flexible?",
        a: "Lo coordinamos según ocupación del día.",
      },
      {
        q: "¿Cómo se paga?",
        a: "Te explicamos medios y seña cuando confirmemos disponibilidad.",
      },
    ],
    resultHot:
      "Hay buena señal de disponibilidad. Continuá por WhatsApp para confirmar opciones.",
    resultWarm:
      "Pedido recibido. Seguí por WhatsApp para chequear cupos exactos.",
    resultCold:
      "Con estos datos es difícil avanzar. Escribinos por WhatsApp si querés ajustar fechas.",
    theme: {
      bg: "bg-[#eef6f5]",
      surface: "bg-white",
      text: "text-teal-950",
      muted: "text-teal-900/70",
      accent: "bg-teal-700",
      accentHover: "hover:bg-teal-800",
      accentSoft: "bg-teal-50 text-teal-900",
      border: "border-teal-900/10",
      heroOverlay:
        "linear-gradient(120deg, rgba(19,78,74,0.72), rgba(19,78,74,0.22))",
    },
  },
};
