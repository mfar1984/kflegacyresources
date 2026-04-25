export const dynamic = 'force-static';

export async function GET() {
  const base = process.env.SITE_URL || 'https://www.kflegacyresources.com';
  const now = new Date().toISOString();
  const urls = [
    '/',
    '/barcode-rfid',
    '/network',
    '/security',
    '/system-storage',
    '/other-services',
    '/store',
    '/store/netgate-1100',
    '/store/netgate-2100-base',
    '/store/netgate-2100-max',
    '/store/netgate-4200-max',
    '/store/netgate-6100-base',
    '/store/netgate-6100-max',
    '/store/netgate-8200-max',
    '/store/netgate-8300-base',
    '/store/netgate-8300-max',
    '/store/netgate-8300-taa',
    '/store/basic-website',
    '/store/ecommerce-website',
    '/store/web-based-system',
    '/store/web-based-system-android',
    '/cart',
    '/checkout',
    '/products',
    '/projects',
    '/privacy',
    '/disclaimer',
    '/terms-of-use',
    '/sitemap',
    '/admin/login',
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((p) => `\n  <url><loc>${base}${p}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`).join('') +
    `\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}


