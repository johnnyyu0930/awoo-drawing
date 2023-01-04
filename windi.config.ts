import { defineConfig } from 'windicss/helpers';
import formsPlugin from 'windicss/plugin/forms';

export default defineConfig({
  darkMode: 'class',
  safelist: 'p-3 p-4 p-5',
  theme: {
    extend: {
      screens: {
        '2xl': '1729px',
        '3xl': '1920px',
      },
      colors: {
        bg: '#FFEFEF',
        red: '#CD0000',
        secondary: {
          80: '#4E4C4C',
          100: '#222222',
        },
        font: {
          active: '#222222',
          default: '#9A9A9A',
        },
      },
      boxShadow: {
        name: 'inset -2px -4px 0px rgba(34, 34, 34, 0.75)',
        awards: 'inset -2px -4px 0px rgba(206, 3, 33, 0.4)',
      },
    },
  },
  plugins: [formsPlugin, require('@windicss/plugin-scrollbar')],
});
