/**
 * Subdomain Detection Middleware
 * 
 * Detects whether the request is coming to:
 * - pe.agenciavectore.com → Peru site (light mode, tienda, Culqi)
 * - agenciavectore.com → International site (EN only, dark/light toggle)
 * 
 * Sets `req.site` to 'pe' or 'global' for downstream routing.
 * 
 * Also detects Cloudflare's cf-ipcountry header to suggest
 * the Peru site to Peruvian visitors on the global domain.
 */

const PERU_SUBDOMAINS = ['pe'];

export function subdomainMiddleware(req, res, next) {
    const host = req.hostname || req.headers.host || '';

    // Check if it's a Peru subdomain
    const subdomain = host.split('.')[0];

    if (PERU_SUBDOMAINS.includes(subdomain)) {
        req.site = 'pe';
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
        // In development, ?_site=pe simulates the Peru subdomain
        req.site = req.query._site || 'global';
    } else {
        req.site = 'global';
    }

    // Geo-detection: Cloudflare sends cf-ipcountry header
    // If user is from Peru and visiting the global site, flag it
    // so the frontend can show a "Visit our Peru site" banner
    const country = req.headers['cf-ipcountry'] || '';
    if (req.site === 'global' && country === 'PE') {
        req.suggestPeru = true;
        // Pass it as a response header so frontend JS can read it
        res.set('X-Suggest-Locale', 'pe');
    }

    // Set hreflang headers for SEO
    const globalUrl = process.env.SITE_URL || 'https://agenciavectore.com';
    const peruUrl = process.env.PERU_SITE_URL || 'https://pe.agenciavectore.com';

    res.set('Link', [
        `<${globalUrl}/>; rel="alternate"; hreflang="en"`,
        `<${peruUrl}/>; rel="alternate"; hreflang="es-PE"`,
        `<${globalUrl}/>; rel="alternate"; hreflang="x-default"`
    ].join(', '));

    next();
}

export default { subdomainMiddleware };
