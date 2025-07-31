/** @type {import('tailwindcss').Config} */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 保留基础的颜色扩展
        slate: {
          850: '#1e293b',
        },
      },
    },
  },
  plugins: [],
};
