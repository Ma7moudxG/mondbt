import type { Config } from "tailwindcss";
import flowbiteReact from "flowbite-react/plugin/tailwindcss";
const { fontFamily } = require('tailwindcss/defaultTheme');

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ".flowbite-react\\class-list.json",
    './src/**/*.{js,ts,jsx,tsx}', // <== important to include all these
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        // Define your Inter font
        inter: ['var(--font-inter)', ...fontFamily.sans],
        // Define your Noto Sans Arabic font
        'noto-arabic': ['var(--font-noto-sans-arabic)', ...fontFamily.sans],
      },
    },
  },
  plugins: [flowbiteReact],
};
export default config;