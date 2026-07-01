/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef6ff',
                    100: '#d9eaff',
                    200: '#bcd9ff',
                    300: '#8ec1ff',
                    400: '#599dff',
                    500: '#3577fb',
                    600: '#1f57f0',
                    700: '#1743dc',
                    800: '#1937b2',
                    900: '#1a338c',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
