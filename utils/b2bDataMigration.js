import Product from '../models/Product.js';
import Project from '../models/Project.js';
import SiteConfig from '../models/SiteConfig.js';

/**
 * Non-destructive, idempotent B2B data alignment:
 * 1. Replaces the 4 legacy B2C micro-items (Carta / Menú, Polos Personalizados,
 *    Rescate de Logo, Tarjetas de Presentación) ONLY if untouched, elevating
 *    Taller Propio to Señalética Normativa, Viniles para Malls y Cines,
 *    Letreros Corpóreos LED, and Displays BTL aligned with Gran Formato & Corpóreos/LED filters.
 * 2. Cleans stray trailing quotes (e.g. clientes.") and truncated/awkward descriptions.
 */
export async function runB2BDataAlignment() {
    try {
        // 1. Upgrade the 4 legacy B2C workshop items (matched only while still on legacy names)
        const workshopUpgrades = [
            {
                matchName: 'Carta / Menú',
                update: {
                    name: 'Señalética Normativa',
                    category: 'senalizacion',
                    subcategory: 'Corpóreos & Señalética',
                    description: 'Señalización fotoluminiscente, reflectiva y directorios en PVC, Celtex y acrílico para plantas, clínicas y malls.',
                    images: [{
                        url: 'https://res.cloudinary.com/ddyrdetvm/image/upload/v1774388332/vectore-agency/gshrthcay0ll2ulyrkd6.avif',
                        alt: 'Señalética Normativa',
                        isPrimary: true
                    }]
                }
            },
            {
                matchName: 'Polos Personalizados',
                update: {
                    name: 'Viniles para Malls y Cines',
                    category: 'vinilo',
                    subcategory: 'Gran Formato UV',
                    description: 'Impresión UV de alto tránsito, murales promocionales, vinil microperforado y gráficas de estreno para salas y retail.',
                    images: [{
                        url: 'https://res.cloudinary.com/ddyrdetvm/image/upload/v1774390071/vectore-agency/ytjbsndu4oldrlyznu58.avif',
                        alt: 'Viniles para Malls y Cines',
                        isPrimary: true
                    }]
                }
            },
            {
                matchId: '69c3ee81ab24b76e8d8275ff',
                matchName: 'Rescate de Logo (Vectorización)',
                update: {
                    name: 'Letreros Corpóreos LED',
                    category: 'espacios',
                    subcategory: 'Corpóreos & LED',
                    description: 'Fabricación de letras volumétricas en acrílico, Alucobond y acero con iluminación LED IP67 y montaje certificado.',
                    images: [{
                        url: 'https://res.cloudinary.com/ddyrdetvm/image/upload/v1769636974/vectore-agency/hv0yzecbqtpkmnepnm84.avif',
                        alt: 'Letreros Corpóreos LED',
                        isPrimary: true
                    }]
                }
            },
            {
                matchName: 'Tarjetas de Presentación',
                update: {
                    name: 'Displays BTL',
                    category: 'espacios',
                    subcategory: 'Corpóreos & BTL',
                    description: 'Counters promocionales, backings de prensa, tótems rígidos y exhibidores listos para activaciones corporativas.',
                    images: [{
                        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=82',
                        alt: 'Displays BTL',
                        isPrimary: true
                    }]
                }
            }
        ];

        for (const item of workshopUpgrades) {
            const filter = item.matchId
                ? { _id: item.matchId, name: item.matchName }
                : { name: item.matchName };
            await Product.updateOne(filter, { $set: item.update });
        }

        // Archive older duplicate B2C micro-items so they don't reappear lower in the grid
        await Product.updateMany(
            {
                name: {
                    $in: [
                        'Rescate de Logo (Vectorización)',
                        'Menú QR Interactivo'
                    ]
                }
            },
            { $set: { isAvailable: false } }
        );

        // 2. Sanitize stray trailing quotes (e.g. clientes.") & whitespace across all Products
        const allProducts = await Product.find({});
        for (const prod of allProducts) {
            if (typeof prod.description === 'string') {
                const cleaned = prod.description.replace(/["”]+$/g, '').trim();
                if (cleaned !== prod.description) {
                    prod.description = cleaned;
                    await prod.save();
                }
            }
        }

        // 3. Refine Mela / Van project description & clean stray quotes across Projects
        const allProjects = await Project.find({});
        for (const proj of allProjects) {
            let changed = false;
            if (
                proj.title === 'Van' &&
                typeof proj.description === 'string' &&
                proj.description.startsWith('Diseño funcional para dar a conocer la marca')
            ) {
                proj.description = 'Rotulación integral en vinil vehicular UV para visibilidad de marca en ruta mayorista y puntos de venta.';
                changed = true;
            } else if (typeof proj.description === 'string') {
                const cleaned = proj.description.replace(/["”]+$/g, '').trim();
                if (cleaned !== proj.description) {
                    proj.description = cleaned;
                    changed = true;
                }
            }
            if (changed) {
                await proj.save();
            }
        }

        // 4. Normalize legacy RUC 20 copy in SiteConfig singleton
        const siteCfg = await SiteConfig.findOne({ key: 'main' });
        if (siteCfg?.corporate?.rucInfo && /RUC\s*20/i.test(siteCfg.corporate.rucInfo)) {
            siteCfg.corporate.rucInfo = 'Facturación Electrónica & OS · Confidencialidad (NDA)';
            await siteCfg.save();
        }
    } catch (err) {
        console.warn('⚠️ B2B data alignment warning:', err.message);
    }
}
