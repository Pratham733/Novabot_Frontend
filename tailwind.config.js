/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('nativewind/preset')],
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './context/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5B6CFF',
                secondary: '#7F56D9',
                bg: '#F8F9FA',
            },
        },
    },
    plugins: [],
};
