/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        shimmer: "shimmer 2s linear infinite",
        progress: "progress 1.5s ease-in-out infinite",
        typing: "typing 3s steps(30) infinite",
        tilt: "tilt 10s infinite linear",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        progress: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "50%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        typing: {
          "0%": {
            width: "0%",
            opacity: "0",
          },
          "5%": {
            opacity: "1",
          },
          "50%": {
            width: "100%",
          },
          "55%": {
            opacity: "1",
          },
          "60%": {
            opacity: "0",
          },
          "100%": {
            opacity: "0",
          }
        },
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(0.5deg)",
          },
          "75%": {
            transform: "rotate(-0.5deg)",
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

