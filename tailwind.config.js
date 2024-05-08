const {
  red,
  volcano,
  orange,
  gold,
  yellow,
  lime,
  green,
  cyan,
  blue,
  geekblue,
  purple,
  magenta,
  grey,
  gray,
} = require('@ant-design/colors');

function generateColors() {
  const colors = {
    red,
    volcano,
    orange,
    gold,
    yellow,
    lime,
    green,
    cyan,
    blue,
    geekblue,
    purple,
    magenta,
    grey,
    gray,
  };

  const tailwindColors = {
    transparent: 'transparent',
    black: '#000',
    white: '#fff',
  };

  Object.keys(colors).forEach((color) => {
    tailwindColors[color] = {};
    colors[color].forEach((shade, index) => {
      tailwindColors[color][index + 1] = shade;
    });
    tailwindColors[color].primary = colors[color].primary;
  });

  return tailwindColors;
}

module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,ejs}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    colors: generateColors(),
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
