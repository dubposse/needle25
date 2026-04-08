/** @type {import('next').NextConfig} */

// 1. Definiere deine CSP-Regeln
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim(); // Entfernt Zeilenumbrüche für den Header-String

const nextConfig = {
  async headers() {
    return [
      {
        // 2. Wende den Header auf alle Pfade deiner App an
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
