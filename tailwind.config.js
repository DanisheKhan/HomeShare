/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#f7575c",
        primaryDark: "#e04449",
        secondary: "#333333",
        accent: "#f8f9fa",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      boxShadow: {
        navbar: "0 2px 10px rgba(0, 0, 0, 0.08)",
      },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [],
};
