import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: "#0a66c2",
          "blue-hover": "#004182",
          "light-blue": "#70b5f9",
          green: "#057642",
          "warm-gray": "#f3f2ef",
          "border-gray": "#e0dfdc",
          "text-gray": "#666666",
          "text-dark": "#191919",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "system-ui",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Fira Sans",
          "Ubuntu",
          "Oxygen",
          "Oxygen Sans",
          "Cantarell",
          "Droid Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Lucida Grande",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
