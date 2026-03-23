/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
                display: ['var(--font-playfair)', 'Georgia', 'serif'],
            },
            colors: {
                brand: {
                    50: '#fef9ee',
                    100: '#fdf0d3',
                    200: '#faded8',
                    300: '#f6c377',
                    400: '#f2a545',
                    500: '#ee8520',
                    600: '#df6a16',
                    700: '#b94e14',
                    800: '#943e17',
                    900: '#783517',
                    950: '#411a09',
                },
                sage: {
                    50: '#f4f7f0',
                    100: '#e6ecdd',
                    200: '#cddbbe',
                    300: '#abc399',
                    400: '#87a872',
                    500: '#698e54',
                    600: '#527040',
                    700: '#415836',
                    800: '#36472e',
                    900: '#2e3c28',
                    950: '#162012',
                },
            },
            backgroundImage: {
                'recipe-pattern': "url('/pattern.svg')",
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
