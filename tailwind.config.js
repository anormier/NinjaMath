/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          deep: '#0B0B2B',
          purple: '#1A0B3B',
        },
        neon: {
          cyan: '#00F5FF',
          magenta: '#FF00E5',
          lime: '#39FF14',
          orange: '#FF6B00',
        },
      },
      fontFamily: {
        bungee: ['Bungee', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        fredoka: ['Fredoka One', 'cursive'],
        caveat: ['Caveat', 'cursive'],
        patrick: ['Patrick Hand', 'cursive'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        bounce_score: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        float_up: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(1.5)' },
        },
        slide_in_right: {
          '0%': { opacity: '0', transform: 'translateX(60px) rotate(3deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) rotate(0deg)' },
        },
        pop_in: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        confetti_fall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        rocket: {
          '0%': { transform: 'translate(-20%, 120%) rotate(-45deg)', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { transform: 'translate(120%, -20%) rotate(-45deg)', opacity: '0' },
        },
        pulse_red: {
          '0%, 100%': { color: '#FF4444' },
          '50%': { color: '#FF0000', transform: 'scale(1.05)' },
        },
        count_up: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
        'bounce-score': 'bounce_score 0.4s ease-in-out',
        'pulse-glow': 'pulse_glow 2s ease-in-out infinite',
        'float-up': 'float_up 1s ease-out forwards',
        'slide-in-right': 'slide_in_right 0.3s ease-out',
        'pop-in': 'pop_in 0.3s ease-out',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'confetti-fall': 'confetti_fall 2s ease-in forwards',
        rocket: 'rocket 1.5s ease-in forwards',
        'pulse-red': 'pulse_red 1s ease-in-out infinite',
        'count-up': 'count_up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
