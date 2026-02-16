import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRMia System',
    short_name: 'CRMia',
    description: 'Sistema CRM inteligente com 9 ferramentas de IA para acelerar suas vendas',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
