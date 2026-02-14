/** @type {import('tailwindcss').Config} */
export default {
   darkMode: ['class', '[data-theme="dark"]'],
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {
         fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            display: ['Poppins', 'Inter', 'sans-serif'],
         },
         colors: {
            primary: {
               50: '#eff6ff',
               100: '#dbeafe',
               200: '#bfdbfe',
               300: '#93c5fd',
               400: '#60a5fa',
               500: '#3b82f6',
               600: '#2563eb',
               700: '#1d4ed8',
               800: '#1e40af',
               900: '#1e3a8a',
            },
         },
         borderRadius: {
            'xl': '1rem',
            '2xl': '1.5rem',
            '3xl': '2rem',
         },
         spacing: {
            '18': '4.5rem',
            '88': '22rem',
            '100': '25rem',
         },
         animation: {
            'fade-in': 'fadeIn 0.3s ease-out',
            'slide-up': 'slideUp 0.4s ease-out',
            'scale-in': 'scaleIn 0.2s ease-out',
         },
         boxShadow: {
            'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
         },
      },
   },
   plugins: [],
};