"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "¿Aceptan seguro médico?",
    answer:
      "Trabajo como proveedor fuera de red (out-of-network). Al finalizar cada sesión te entrego un recibo (superbilla) para que puedas solicitar reembolso a tu seguro, según tu cobertura. Si querés, te oriento sobre cómo hacerlo.",
  },
  {
    question: "¿Cómo es la primera sesión?",
    answer:
      "Es una conversación cálida y estructurada: hablamos de lo que te trae, de tu historia reciente y de qué te gustaría cambiar. Al final, te comparto cómo veo el proceso y acordamos juntos los próximos pasos. Dura 50 minutos.",
  },
  {
    question: "¿Es confidencial?",
    answer:
      "Sí. Todo lo que compartís en sesión está protegido por la confidencialidad profesional, con las excepciones legales habituales (riesgo de daño a vos o a terceros). Tu historia se trata con respeto y cuidado en todo momento.",
  },
  {
    question: "¿Atienden online desde cualquier estado?",
    answer:
      "Las sesiones online están disponibles para personas ubicadas en Florida, donde tengo licencia activa. Si estás en otro estado y querés explorar opciones, escribime y te oriento sobre lo que es posible.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="preguntas" className="border-t border-borde bg-fondo py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-salvia-dark">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-3xl tracking-tight text-texto md:text-4xl">
            Resolvé tus dudas antes de empezar
          </h2>
        </div>

        <div className="mt-10 divide-y divide-borde border-y border-borde">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={faq.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-display text-lg text-texto md:text-xl">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={[
                        "h-5 w-5 shrink-0 text-salvia-dark transition-transform",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-5"
                >
                  <p className="max-w-2xl text-sm leading-relaxed text-texto/75 md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
