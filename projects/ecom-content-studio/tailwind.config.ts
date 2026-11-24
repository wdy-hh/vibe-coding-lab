import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { studio: { orange: '#f36c37', ink: '#192330', canvas: '#f8fafc' } },
      fontFamily: { sans: ['Inter', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
