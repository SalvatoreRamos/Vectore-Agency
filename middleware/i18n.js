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

    const subdomain = host.split('.')[0].toLowerCase();

    if (PERU_SUBDOMAINS.includes(subdomain)) {
        req.site = 'pe';
    } else if (subdomain === 'en') {
        req.site = 'global';
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
        req.site = req.query._site || 'pe';
    } else if (host.includes('onrender.com')) {
        req.site = req.query._site || 'pe';
    } else {
        req.site = req.query._site || 'pe';
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

    // Only emit alternate headers for routes that truly have equivalents on both sites.
    const globalUrl = process.env.SITE_URL || 'https://www.agenciavectore.com';
    const peruUrl = process.env.PERU_SITE_URL || 'https://pe.agenciavectore.com';
    const normalizedPath = req.path || '/';
    const hasReciprocalAlternate = normalizedPath === '/';

    if (hasReciprocalAlternate) {
        res.set('Link', [
            `<${globalUrl}/>; rel="alternate"; hreflang="en"`,
            `<${peruUrl}/>; rel="alternate"; hreflang="es-PE"`,
            `<${globalUrl}/>; rel="alternate"; hreflang="x-default"`
        ].join(', '));
        res.vary('Host');
    }

    next();
}

export default { subdomainMiddleware };
