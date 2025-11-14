tailwind.config = {
    theme: {
        extend: {
            colors: {
                neutral: {
                    50: '#f7f7f8',
                    100: '#eeeef0',
                    200: '#d9d9de',
                    300: '#b8b9c1',
                    400: '#91939f',
                    500: '#737584',
                    600: '#5d5e6c',
                    700: '#4c4d58',
                    800: '#41414b',
                    900: '#393941',
                    950: '#18181b',
                },

                'accent-blue': '#2a9ecd',
                'accent-purple': '#8373da',
                'accent-yellow': '#e49b2b',
                'accent-green': '#8fd33e',
                'accent-orange': '#f05a25',

                'blue-300': '#8dcfec',
                'blue-500': '#2a9ecd',
                'blue-700': '#17658d',
                'blue-950': '#0e2838',
                'orange-300': '#f7a77a',
                'orange-500': '#f05a25',
                'orange-700': '#ba2b14',
                'orange-950': '#410d09',

                primary: '#2a9ecd',
                primaryHover: '#2a9ecdBF',
                primaryGray: '#d9d9de',
                primaryBorder: '#c6c7ce',
                primaryText: '#18181b',
                secondary: '#8373da',
                muted: '#4a4b53',
                placeholder: '#91939f',
                inverted: '#18181b',
            },

            boxShadow: {
                sm: '0 2px 5px rgba(0, 0, 0, 0.3)',
                md: '0 4px 10px rgba(0, 0, 0, 0.4)',
                lg: '0 6px 15px rgba(0, 0, 0, 0.5)',
                xl: '0 6px 20px rgba(0, 0, 0, 0.5)',
                card: '0 4px 10px rgba(0, 0, 0, 0.4)',
            },

            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
            },
        },
    },
};
