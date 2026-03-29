import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        card: '#1E293B',
        border: '#334155',
        amber: '#F59E0B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: '#94A3B8'
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(245,158,11,0.2), 0 20px 60px rgba(15,23,42,0.45)'
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 30%), linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,1))'
      }
    }
  },
  plugins: []
} satisfies Config;
