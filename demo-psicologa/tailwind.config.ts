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
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        soft: "1rem",
        softer: "1.5rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
