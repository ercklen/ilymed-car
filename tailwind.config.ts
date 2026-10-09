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
        sans: ['var(--font-inter)', 'var(--font-tajawal)', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#111827',
          gold: '#D4A72C',
          white: '#FFFFFF',
          light: '#F8FAFC',
          gray: '#374151',
          success: '#16A34A',
          error: '#DC2626'
        }
      },
    },
  },
  plugins: [],
};
export default config;
