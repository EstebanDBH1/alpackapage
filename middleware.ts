const CRAWLERS =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|WhatsApp|Slackbot|Discord|Pinterest|instagram|vkShare|W3C_Validator|redditbot/i;

const BASE_URL = 'https://www.alpackaai.xyz';
const IMAGE    = `${BASE_URL}/icon/alpacka-icon.jpg`;

function getMeta(pathname: string): { title: string; description: string } {
  if (pathname.startsWith('/prompts')) {
    return {
      title: 'Biblioteca de Prompts | alpacka.ai',
      description: '300+ prompts para todo lo que necesitas. Listos para copiar y usar.',
    };
  }
  if (pathname.startsWith('/pricing')) {
    return {
      title: 'Precios | alpacka.ai',
      description: 'Acceso completo a 300+ prompts por $4 al mes. Sin contrato.',
    };
  }
  if (pathname.startsWith('/dashboard')) {
    return {
      title: 'Mi cuenta | alpacka.ai',
      description: 'Gestiona tu suscripción y tus prompts guardados.',
    };
  }
  return {
    title: 'alpacka.ai — La librería de prompts que necesitas',
    description: '300+ prompts probados para todo lo que necesitas. Cópialos y úsalos hoy.',
  };
}

export default function middleware(request: Request): Response | undefined {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!CRAWLERS.test(userAgent)) return; // visitante normal → flujo habitual

  const url      = new URL(request.url);
  const { title, description } = getMeta(url.pathname);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${url.href}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${IMAGE}" />
  <meta property="og:image:type"  content="image/jpeg" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${IMAGE}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: ['/((?!_vercel|.*\\..*).*)'],
};
