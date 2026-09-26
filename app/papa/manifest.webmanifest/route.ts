export async function GET() {
  return Response.json({
    name: 'Papa tools',
    short_name: 'Papa tools',
    description: 'Persoonlijke Luna- en fitnesstools.',
    id: '/papa/luna',
    start_url: '/papa/luna',
    scope: '/papa/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    background_color: '#f5f0e7',
    theme_color: '#1f4d45',
    lang: 'nl-NL',
    icons: [{ src: '/luna/luna_logo.png', sizes: '1254x1254', type: 'image/png', purpose: 'any maskable' }]
  }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
