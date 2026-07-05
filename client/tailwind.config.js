export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#050816",
        cyan: "#00E5FF",
        violet: "#7C3AED",
        muted: "#A1A1AA"
      },
      boxShadow: {
        glow: "0 0 34px rgba(0,229,255,0.22), 0 0 54px rgba(124,58,237,0.2)"
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        shine: "shine 1.8s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(18px, -20px, 0) scale(1.06)" }
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      }
    }
  },
  plugins: []
};
