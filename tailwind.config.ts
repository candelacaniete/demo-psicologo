import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Katem */
        papel: "var(--papel)",
        tinta: "var(--tinta)",
        rosa: {
          DEFAULT: "var(--rosa)",
          suave: "var(--rosa-suave)",
        },
        neon: "var(--neon)",
        grid: "var(--grid)",
        /* Demo psicólogos (variables scoped) */
        fondo: "var(--fondo)",
        texto: "var(--texto)",
        salvia: {
          DEFAULT: "var(--verde-salvia)",
          dark: "var(--verde-salvia-oscuro)",
        },
        terracota: {
          DEFAULT: "var(--terracota-suave)",
          dark: "var(--terracota-oscuro)",
        },
        borde: "var(--borde)",
        "fondo-suave": "var(--fondo-suave)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "ui-monospace", "monospace"],
        /* Alias explícitos Katem / demo */
        fredoka: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        vt323: ["var(--font-vt323)", "ui-monospace", "monospace"],
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
        "work-sans": ["var(--font-work-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        soft: "1rem",
        softer: "1.5rem",
        katem: "1.25rem",
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        neon: "0 0 18px color-mix(in srgb, var(--neon) 35%, transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
