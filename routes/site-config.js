import express from 'express';
import SiteConfig, { DEFAULT_SECTORS, DEFAULT_BUSINESS_LINES } from '../models/SiteConfig.js';
import Project from '../models/Project.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const LEGACY_HIGHLIGHTS = new Set([
    'y creamos diseño especializado, packaging 3D y software a medida.',
    'y creamos arquitectura, packaging 3D y software.'
]);

const LEGACY_SUBTITLES = new Set([
    'Somos el brazo ejecutor con taller propio en la Amazonía para marcas y agencias de Lima, integrando producción en sitio, arquitectura comercial, visualización 3D e ingeniería de software.',
    'Taller propio en Ucayali para marcas y agencias de Lima, integrado con diseño 3D y desarrollo tecnológico a medida.'
]);

async function getOrCreateMainConfig() {
    let config = await SiteConfig.findOne({ key: 'main' });
    if (!config) {
        config = await SiteConfig.create({
            key: 'main',
            sectors: DEFAULT_SECTORS,
            corporate: { businessLines: DEFAULT_BUSINESS_LINES }
        });
        return config;
    }

    // Non-destructive auto-upgrade of initial default texts (preserves custom Hero media & Admin edits)
    let dirty = false;
    if (config.hero && LEGACY_HIGHLIGHTS.has(config.hero.headlineHighlight)) {
        config.hero.headlineHighlight = 'y creamos publicidad, diseño especializado, packaging 3D y software a medida.';
        dirty = true;
    }
    if (config.hero?.subtitle && (LEGACY_SUBTITLES.has(config.hero.subtitle) || config.hero.subtitle.startsWith('Somos el brazo ejecutor con taller propio'))) {
        config.hero.subtitle = 'Taller propio para marcas de Lima y todo el Perú, junto con diseño publicitario, visualización 3D y software para empresas a nivel internacional.';
        dirty = true;
    }
    if (config.hero?.primaryCtaText === 'Solicitar Cotización Corporativa') {
        config.hero.primaryCtaText = 'Cotizar proyecto';
        dirty = true;
    }
    if (config.hero?.secondaryCtaText === 'Explorar Casos de Éxito') {
        config.hero.secondaryCtaText = 'Ver portafolio';
        dirty = true;
    }
    if (config.sectors?.[0]?.subtitle === 'Islas, escaparates, tótems y campañas de temporada') {
        config.sectors = DEFAULT_SECTORS;
        dirty = true;
    }
    if (config.corporate?.businessLines?.[0]?.description?.startsWith('Producción gráfica industrial en gran formato')) {
        config.corporate.businessLines = DEFAULT_BUSINESS_LINES;
        dirty = true;
    }
    if (dirty) {
        await config.save();
    }

    return config;
}

/**
 * GET /api/site-config
 * Public endpoint returning Hero config, active floating project, B2B sectors, and corporate info
 */
router.get('/', async (req, res) => {
    try {
        const config = await getOrCreateMainConfig();
        const configObj = config.toObject();

        let floatingProject = null;
        if (configObj.hero?.floatingCard?.enabled !== false) {
            if (configObj.hero?.floatingCard?.mode === 'manual' && configObj.hero?.floatingCard?.projectId) {
                const manualProj = await Project.findById(configObj.hero.floatingCard.projectId);
                if (manualProj) {
                    floatingProject = manualProj.toPublicJSON();
                }
            }

            // Fallback to most recent / featured project if manual is not set or not found
            if (!floatingProject) {
                const latestProj = await Project.findOne().sort({ isFeatured: -1, date: -1, createdAt: -1 });
                if (latestProj) {
                    floatingProject = latestProj.toPublicJSON();
                }
            }
        }

        res.json({
            success: true,
            data: {
                ...configObj,
                floatingProject,
                integrations: {
                    googleClientId: process.env.GOOGLE_CLIENT_ID || '433259886019-haiklq9fuqr673839bq03p97jmnlnvtt.apps.googleusercontent.com',
                    culqiPublicKey: process.env.CULQI_PUBLIC_KEY || ''
                }
            }
        });
    } catch (error) {
        console.error('Error loading site config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar la configuración del sitio',
            error: error.message
        });
    }
});

/**
 * PUT /api/site-config
 * Admin endpoint to update Hero, Floating Card, Sectors, and Corporate Footer
 */
router.put('/', [authenticate, isAdmin], async (req, res) => {
    try {
        const config = await getOrCreateMainConfig();
        const { hero, sectors, corporate } = req.body;

        if (hero && typeof hero === 'object') {
            if (typeof hero.backgroundType === 'string') config.hero.backgroundType = hero.backgroundType;
            if (typeof hero.backgroundUrl === 'string') {
                config.hero.backgroundUrl = hero.backgroundUrl.trim();
                // Auto-detect backgroundType if URL is provided or cleared
                if (!config.hero.backgroundUrl) {
                    config.hero.backgroundType = 'default';
                } else if (config.hero.backgroundType === 'default') {
                    const isVid = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(config.hero.backgroundUrl) || config.hero.backgroundUrl.includes('/video/upload/');
                    config.hero.backgroundType = isVid ? 'video' : 'image';
                }
            }
            if (typeof hero.mobileBackgroundUrl === 'string') config.hero.mobileBackgroundUrl = hero.mobileBackgroundUrl.trim();
            if (typeof hero.overlayOpacity === 'number') {
                config.hero.overlayOpacity = Math.min(0.92, Math.max(0.15, hero.overlayOpacity));
            }
            if (typeof hero.badgeText === 'string') config.hero.badgeText = hero.badgeText.trim();
            if (typeof hero.headlineLine1 === 'string') config.hero.headlineLine1 = hero.headlineLine1.trim();
            if (typeof hero.headlineHighlight === 'string') config.hero.headlineHighlight = hero.headlineHighlight.trim();
            if (typeof hero.subtitle === 'string') config.hero.subtitle = hero.subtitle.trim();
            if (typeof hero.primaryCtaText === 'string') config.hero.primaryCtaText = hero.primaryCtaText.trim();
            if (typeof hero.secondaryCtaText === 'string') config.hero.secondaryCtaText = hero.secondaryCtaText.trim();

            if (hero.floatingCard && typeof hero.floatingCard === 'object') {
                if (typeof hero.floatingCard.enabled === 'boolean') config.hero.floatingCard.enabled = hero.floatingCard.enabled;
                if (typeof hero.floatingCard.label === 'string') config.hero.floatingCard.label = hero.floatingCard.label.trim() || 'OPEN PROJECT';
                if (['latest', 'manual'].includes(hero.floatingCard.mode)) config.hero.floatingCard.mode = hero.floatingCard.mode;
                config.hero.floatingCard.projectId = hero.floatingCard.projectId || null;
            }
        }

        if (Array.isArray(sectors)) {
            config.sectors = sectors.map((s, idx) => ({
                id: (s.id || `sec-${idx + 1}`).toString().trim(),
                name: (s.name || '').toString().trim(),
                subtitle: (s.subtitle || '').toString().trim(),
                icon: (s.icon || 'layers').toString().trim(),
                isActive: s.isActive !== false,
                order: typeof s.order === 'number' ? s.order : idx + 1
            })).filter(s => s.name);
        }

        if (corporate && typeof corporate === 'object') {
            if (typeof corporate.whatsappNumber === 'string') config.corporate.whatsappNumber = corporate.whatsappNumber.replace(/[^\d]/g, '') || '51950699910';
            if (typeof corporate.phoneDisplay === 'string') config.corporate.phoneDisplay = corporate.phoneDisplay.trim();
            if (typeof corporate.email === 'string') config.corporate.email = corporate.email.trim();
            if (typeof corporate.address === 'string') config.corporate.address = corporate.address.trim();
            if (typeof corporate.rucInfo === 'string') config.corporate.rucInfo = corporate.rucInfo.trim();
            if (Array.isArray(corporate.businessLines) && corporate.businessLines.length > 0) {
                config.corporate.businessLines = corporate.businessLines.map((b, i) => ({
                    code: (b.code || `GIRO 0${i + 1}`).trim(),
                    title: (b.title || '').trim(),
                    description: (b.description || '').trim()
                })).filter(b => b.title);
            }
        }

        await config.save();

        res.json({
            success: true,
            message: 'Configuración corporativa actualizada correctamente',
            data: config
        });
    } catch (error) {
        console.error('Error updating site config:', error);
        res.status(500).json({
            success: false,
            message: 'No se pudo guardar la configuración',
            error: error.message
        });
    }
});

/**
 * POST /api/site-config/reset-hero-bg
 * Restores the default dark ambient background immediately
 */
router.post('/reset-hero-bg', [authenticate, isAdmin], async (req, res) => {
    try {
        const config = await getOrCreateMainConfig();
        config.hero.backgroundType = 'default';
        config.hero.backgroundUrl = '';
        config.hero.mobileBackgroundUrl = '';
        await config.save();

        res.json({
            success: true,
            message: 'Fondo original restaurado con éxito',
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al restaurar el fondo',
            error: error.message
        });
    }
});

export default router;
