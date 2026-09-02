/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    { pattern: /(bg|text|border|stroke|from|to)-(sky|purple|emerald|rose|amber|slate|blue|red|orange|yellow|green)-(300|400|500|600)/ },
    { pattern: /(bg|text|border|stroke)-(sky|purple|emerald|rose|amber|slate|blue|red|green)-(400|500)\/(5|10|20|25|30|40)/ },
    { pattern: /shadow-(sky|purple|emerald|rose|blue)-(400|500|600)\/(20|25|30|40)/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
