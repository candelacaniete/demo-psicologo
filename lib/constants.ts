export const SITE = {
  name: "Dra. Camila Ríos",
  specialty: "Psicóloga clínica — terapia individual, de pareja y ansiedad",
  shortSpecialty: "Psicóloga clínica",
  city: "Miami, FL",
  address: "Brickell Avenue, Miami, FL 33131",
  email: "hola@dracamilarios.com",
  phoneDisplay: "+1 (305) 555-0142",
  phoneWhatsApp: "13055550142",
  license: "Lic. #PY000000",
  experience: "8 años de experiencia",
  languages: "español e inglés",
  sessionMinutes: 50,
  instagram: "https://instagram.com/dracamilarios",
  linkedin: "https://linkedin.com/in/dracamilarios",
} as const;

export const WHATSAPP_MESSAGE =
  "Hola, quisiera agendar una consulta con la Dra. Camila Ríos";

export function whatsappUrl(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${SITE.phoneWhatsApp}?text=${encodeURIComponent(message)}`;
}
