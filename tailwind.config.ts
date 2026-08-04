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
          ink: "#12343b",
          moss: "#2f6b57",
          sand: "#f4ead7",
          clay: "#bf7b30",
          mist: "#e6f0ed"
        }
      },
      boxShadow: {
        card: "0 20px 60px rgba(18, 52, 59, 0.12)"
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
