import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        'brand-green': '#9fff00',
        'bg-base': '#EDEEF5',
      },
      animation: {
        'cd-rise': 'cdRise 0.4s ease both',
        'cd-float1': 'cdFloat1 28s ease-in-out infinite',
        'cd-float2': 'cdFloat2 26s ease-in-out infinite',
        'cd-float3': 'cdFloat3 30s ease-in-out infinite',
        'cd-float4': 'cdFloat4 24s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}

export default config