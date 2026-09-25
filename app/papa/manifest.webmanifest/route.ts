export async function GET() {
  return Response.json({
    name: 'Papa tools',
    short_name: 'Papa tools',
    description: 'Persoonlijke Luna- en fitnesstools.',
    start_url: '/papa',
    scope: '/papa',
    display: 'standalone',
    background_color: '#f5f0e7',
    theme_color: '#1f4d45',
    lang: 'nl-NL',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
  }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
}
