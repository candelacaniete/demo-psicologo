"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const AVAILABLE_HOURS = ["9:00", "10:00", "11:30", "14:00", "15:30", "17:00"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("es-US", { month: "long", year: "numeric" });
}

function formatSelected(date: Date) {
  return date.toLocaleDateString("es-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function BookingCalendar() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const monthDays = useMemo(() => {
    const total = daysInMonth(viewMonth);
    const firstWeekday = (viewMonth.getDay() + 6) % 7; // Monday-first
    const cells: (Date | null)[] = Array(firstWeekday).fill(null);

    for (let day = 1; day <= total; day += 1) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }

    return cells;
  }, [viewMonth]);

  const canBook = (date: Date) => {
    if (date < today) return false;
    if (isWeekend(date)) return false;
    return true;
  };

  const bookingMessage = selectedDay
    ? `Hola, quisiera agendar una consulta${
        selectedHour ? ` el ${formatSelected(selectedDay)} a las ${selectedHour}` : ` el ${formatSelected(selectedDay)}`
      }`
    : undefined;

  return (
    <div className="rounded-softer border border-borde bg-fondo p-5 shadow-[0_12px_40px_rgba(43,38,33,0.06)] md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl capitalize text-texto md:text-2xl">
          {formatMonthYear(viewMonth)}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
              )
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borde bg-white text-texto transition-colors hover:bg-fondo-suave"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() =>
              setViewMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
              )
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borde bg-white text-texto transition-colors hover:bg-fondo-suave"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-texto/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const available = canBook(date);
          const selected = selectedDay ? isSameDay(date, selectedDay) : false;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!available}
              onClick={() => {
                setSelectedDay(date);
                setSelectedHour(null);
              }}
              aria-pressed={selected}
              className={[
                "aspect-square rounded-xl text-sm transition-colors",
                available
                  ? "hover:bg-salvia/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia"
                  : "cursor-not-allowed text-texto/30",
                selected
                  ? "bg-salvia font-medium text-white hover:bg-salvia"
                  : available
                    ? "text-texto"
                    : "",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-borde pt-6">
        <p className="text-sm font-medium text-texto">
          {selectedDay
            ? `Horarios disponibles · ${formatSelected(selectedDay)}`
            : "Elegí un día hábil para ver horarios"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AVAILABLE_HOURS.map((hour) => {
            const active = selectedHour === hour;
            return (
              <button
                key={hour}
                type="button"
                disabled={!selectedDay}
                onClick={() => setSelectedHour(hour)}
                className={[
                  "rounded-full border px-3 py-2.5 text-sm transition-colors",
                  !selectedDay
                    ? "cursor-not-allowed border-borde text-texto/30"
                    : active
                      ? "border-terracota bg-terracota text-white"
                      : "border-borde bg-white text-texto hover:border-terracota/50 hover:bg-terracota/10",
                ].join(" ")}
              >
                {hour}
              </button>
            );
          })}
        </div>
      </div>

      <a
        href={whatsappUrl(bookingMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Confirmar por WhatsApp
      </a>

      <p className="mt-3 text-center text-xs leading-relaxed text-texto/55">
        Esta es una demo visual de agenda. Al tocar el botón se abre WhatsApp
        con un mensaje listo para enviar.
      </p>
    </div>
  );
}
