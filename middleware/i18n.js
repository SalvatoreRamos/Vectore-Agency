/**
 * Subdomain Detection Middleware (DEPRECATED)
 * 
 * The SPA architecture no longer uses subdomain-based routing.
 * This file is kept as a no-op for backward compatibility.
 * All traffic is now served from the unified www domain.
 */

export function subdomainMiddleware(req, res, next) {
    next();
}

export default { subdomainMiddleware };
