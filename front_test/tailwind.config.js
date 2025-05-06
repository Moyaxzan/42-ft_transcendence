/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js,ts,jsx,tsx}"], // Tailwind scan
    theme: {
      extend: {
        keyframes: {
          'slide-in': {
            '0%': { transform: 'translateY(-50px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
        animation: {
          'slide-in': 'slide-in 0.5s ease-out forwards',
        },
        fontFamily: {
          custom: ['Persona', 'sans-serif'], // Add the custom font here
        },
      },
    },
    plugins: [],
  };