import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#102a43",
          government: "#006b3f",
          moss: "#006b3f",
          gold: "#fcd116",
          sky: "#1eb4e9",
          sand: "#f8fafc",
          clay: "#9a6700",
          mist: "#e8f5ee"
        }
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.10)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(191,123,48,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(47,107,87,0.14), transparent 34%)"
      }
    }
  },
  plugins: []
};

export default config;
