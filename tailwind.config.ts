import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0a0d13",
          900: "#0d1117",
          800: "#161b22",
          700: "#21262d",
          600: "#30363d",
          500: "#484f58",
          400: "#6e7681",
          300: "#8b949e",
          200: "#b1bac4",
          100: "#e6edf3",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "plane-fly": "planeFly 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(14,165,233,0.0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(14,165,233,0.15)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-45deg)" },
          "50%": { transform: "translateY(-6px) rotate(-45deg)" },
        },
        planeFly: {
          "0%": { transform: "translateX(-10px) translateY(0) rotate(-45deg)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateX(10px) translateY(-4px) rotate(-45deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
