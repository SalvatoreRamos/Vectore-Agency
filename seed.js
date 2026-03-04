import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        let admin;
        if (!adminExists) {
            admin = await User.create({
                email: process.env.ADMIN_EMAIL || 'asramos2004@gmail.com',
                password: process.env.ADMIN_PASSWORD || 'Admin123!',
                name: 'Administrator',
                role: 'admin'
            });
            console.log('👤 Admin user created');
        } else {
            admin = adminExists;
            console.log('👤 Admin user already exists');
        }

        // Delete old products and seed new catalog
        const oldCount = await Product.countDocuments();
        if (oldCount > 0) {
            await Product.deleteMany({});
            console.log(`🗑️  Deleted ${oldCount} old products`);
        }

        const products = await Product.insertMany([
            // ===================================
            // 🎨 DISEÑO GRÁFICO (diseno)
            // ===================================
            {
                name: 'Diseño de Logo Básico',
                description: 'Creación de logotipo profesional con 3 propuestas y entrega en formatos PNG, JPG y PDF.',
                category: 'diseno',
                subcategory: 'Branding',
                price: 150,
                deliveryTime: '3-5 días',
                material: 'Digital (PNG, JPG, PDF)',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['logo', 'branding', 'diseño', 'básico'],
                createdBy: admin._id
            },
            {
                name: 'Logo Premium + Manual de Marca',
                description: 'Logotipo premium con manual de identidad corporativa completo y archivos editables AI, PSD, PDF.',
                category: 'diseno',
                subcategory: 'Branding',
                price: 300,
                deliveryTime: '5-7 días',
                material: 'Digital (AI, PSD, PDF)',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['logo', 'branding', 'premium', 'manual de marca'],
                createdBy: admin._id
            },
            {
                name: 'Diseño de Flyer / Volante',
                description: 'Diseño profesional de flyer publicitario listo para impresión o redes sociales.',
                category: 'diseno',
                subcategory: 'Publicidad',
                price: 30,
                deliveryTime: '1-2 días',
                material: 'Digital (AI, PSD)',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['flyer', 'volante', 'diseño', 'publicidad'],
                createdBy: admin._id
            },
            {
                name: 'Motion Graphics para Redes',
                description: 'Animación promocional de 15-30 segundos para Instagram, TikTok o Facebook.',
                category: 'diseno',
                subcategory: 'Multimedia',
                price: 150,
                deliveryTime: '3-5 días',
                material: 'Digital (MP4)',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['motion graphics', 'video', 'animación', 'redes sociales'],
                createdBy: admin._id
            },
            {
                name: 'Pack Redes Sociales (10 posts)',
                description: 'Diseño de 10 publicaciones personalizadas para tus redes sociales con tu línea gráfica.',
                category: 'diseno',
                subcategory: 'Marketing',
                price: 80,
                deliveryTime: '2-3 días',
                material: 'Digital (PSD, PNG)',
                unit: 'paquete',
                stock: 999,
                isAvailable: true,
                tags: ['redes sociales', 'posts', 'marketing', 'social media'],
                createdBy: admin._id
            },

            // ===================================
            // 🖨️ IMPRESIÓN (impresion)
            // ===================================
            {
                name: 'Gigantografía / Banner',
                description: 'Impresión en gran formato sobre banner de alta resolución para exteriores e interiores.',
                category: 'impresion',
                subcategory: 'Gran Formato',
                price: 18,
                deliveryTime: '24 horas',
                material: 'Banner 13oz',
                unit: 'm²',
                dimensions: 'Personalizable',
                stock: 999,
                isAvailable: true,
                tags: ['banner', 'gigantografía', 'impresión', 'gran formato'],
                createdBy: admin._id
            },
            {
                name: 'Volantes A5 (millar)',
                description: 'Impresión de 1000 volantes a full color en papel couché, ideal para promociones.',
                category: 'impresion',
                subcategory: 'Offset',
                price: 120,
                deliveryTime: '2-3 días',
                material: 'Papel Couché 150g',
                unit: 'millar',
                dimensions: 'A5 (14.8 x 21 cm)',
                minQuantity: 1000,
                stock: 50,
                isAvailable: true,
                tags: ['volantes', 'flyers', 'impresión', 'couché'],
                createdBy: admin._id
            },
            {
                name: 'Trípticos A4 (millar)',
                description: 'Trípticos informativos a full color, ideales para negocios, instituciones y eventos.',
                category: 'impresion',
                subcategory: 'Offset',
                price: 250,
                deliveryTime: '3-4 días',
                material: 'Papel Couché 200g',
                unit: 'millar',
                dimensions: 'A4 (21 x 29.7 cm)',
                minQuantity: 1000,
                stock: 50,
                isAvailable: true,
                tags: ['trípticos', 'impresión', 'folletos', 'informativo'],
                createdBy: admin._id
            },
            {
                name: 'Tarjetas de Presentación (millar)',
                description: 'Tarjetas premium a doble cara con laminado brillante o mate, acabado profesional.',
                category: 'impresion',
                subcategory: 'Impresión Premium',
                price: 110,
                deliveryTime: '2-3 días',
                material: 'Couché 300g laminado',
                unit: 'millar',
                dimensions: '8.5 x 5.5 cm',
                minQuantity: 1000,
                stock: 100,
                isAvailable: true,
                tags: ['tarjetas', 'presentación', 'impresión', 'laminado'],
                createdBy: admin._id
            },
            {
                name: 'Stickers Troquelados (plancha A3)',
                description: 'Stickers personalizados con corte de forma en vinil adhesivo de alta durabilidad.',
                category: 'impresion',
                subcategory: 'Stickers',
                price: 35,
                deliveryTime: '24 horas',
                material: 'Vinil adhesivo',
                unit: 'plancha',
                dimensions: 'A3 (29.7 x 42 cm)',
                stock: 200,
                isAvailable: true,
                tags: ['stickers', 'troquelados', 'vinil', 'adhesivo'],
                createdBy: admin._id
            },
            {
                name: 'Fotografía Profesional (sesión)',
                description: 'Sesión fotográfica profesional de productos, retratos o espacios con edición incluida.',
                category: 'impresion',
                subcategory: 'Fotografía',
                price: 80,
                deliveryTime: '1-2 días',
                material: 'Digital (JPG, RAW)',
                unit: 'sesión',
                stock: 999,
                isAvailable: true,
                tags: ['fotografía', 'sesión', 'productos', 'profesional'],
                createdBy: admin._id
            },

            // ===================================
            // 📦 PACKAGING (packaging)
            // ===================================
            {
                name: 'Etiquetas Personalizadas (millar)',
                description: 'Diseño e impresión de etiquetas adhesivas para productos, envases o botellas.',
                category: 'packaging',
                subcategory: 'Etiquetas',
                price: 90,
                deliveryTime: '3-4 días',
                material: 'Vinil / Couché adhesivo',
                unit: 'millar',
                minQuantity: 1000,
                stock: 100,
                isAvailable: true,
                tags: ['etiquetas', 'packaging', 'adhesivas', 'productos'],
                createdBy: admin._id
            },
            {
                name: 'Cajas Personalizadas (50 unid.)',
                description: 'Cajas impresas a medida con tu marca para empaque de productos.',
                category: 'packaging',
                subcategory: 'Cajas',
                price: 350,
                deliveryTime: '5-7 días',
                material: 'Cartón corrugado',
                unit: 'paquete',
                dimensions: 'A medida',
                minQuantity: 50,
                stock: 30,
                isAvailable: true,
                tags: ['cajas', 'packaging', 'empaque', 'personalizado'],
                createdBy: admin._id
            },
            {
                name: 'Bolsas Impresas (100 unid.)',
                description: 'Bolsas de papel kraft o plástico con tu logotipo, ideales para tiendas y delivery.',
                category: 'packaging',
                subcategory: 'Bolsas',
                price: 200,
                deliveryTime: '4-5 días',
                material: 'Kraft / Plástico',
                unit: 'paquete',
                minQuantity: 100,
                stock: 50,
                isAvailable: true,
                tags: ['bolsas', 'packaging', 'kraft', 'delivery'],
                createdBy: admin._id
            },

            // ===================================
            // 🔧 SEÑALIZACIÓN (senalizacion)
            // ===================================
            {
                name: 'Letrero Luminoso LED',
                description: 'Letrero con iluminación LED para fachadas, logotipo recortado con acabado premium.',
                category: 'senalizacion',
                subcategory: 'Luminosos',
                price: 350,
                deliveryTime: '5-7 días',
                material: 'Acrílico + LED',
                unit: 'm²',
                stock: 20,
                isAvailable: true,
                tags: ['letrero', 'luminoso', 'LED', 'fachada', 'acrílico'],
                createdBy: admin._id
            },
            {
                name: 'Aviso en MDF Calado',
                description: 'Letrero calado en MDF con diseño personalizado, ideal para interiores y fachadas.',
                category: 'senalizacion',
                subcategory: 'MDF',
                price: 180,
                deliveryTime: '3-5 días',
                material: 'MDF 9mm',
                unit: 'unidad',
                dimensions: 'Personalizable',
                stock: 30,
                isAvailable: true,
                tags: ['MDF', 'calado', 'letrero', 'interior'],
                createdBy: admin._id
            },
            {
                name: 'Panel Publicitario en Acrílico',
                description: 'Panel de acrílico con impresión directa o vinil aplicado, elegante y duradero.',
                category: 'senalizacion',
                subcategory: 'Acrílico',
                price: 250,
                deliveryTime: '4-6 días',
                material: 'Acrílico 3mm',
                unit: 'unidad',
                stock: 20,
                isAvailable: true,
                tags: ['acrílico', 'panel', 'publicidad', 'elegante'],
                createdBy: admin._id
            },
            {
                name: 'Toldo Publicitario',
                description: 'Toldo con estructura metálica e impresión a full color para negocios y locales.',
                category: 'senalizacion',
                subcategory: 'Toldos',
                price: 280,
                deliveryTime: '5-7 días',
                material: 'Lona + Estructura metálica',
                unit: 'm²',
                stock: 15,
                isAvailable: true,
                tags: ['toldo', 'estructura', 'publicidad', 'local'],
                createdBy: admin._id
            },

            // ===================================
            // 🚗 VINILOS Y ROTULACIÓN (vinilo)
            // ===================================
            {
                name: 'Vinil Vehicular Parcial',
                description: 'Rotulación parcial de vehículos con vinil de alta adherencia y resistencia UV.',
                category: 'vinilo',
                subcategory: 'Vehicular',
                price: 300,
                deliveryTime: '3-5 días',
                material: 'Vinil autoadhesivo',
                unit: 'unidad',
                stock: 30,
                isAvailable: true,
                tags: ['vinil', 'vehicular', 'rotulación', 'parcial'],
                createdBy: admin._id
            },
            {
                name: 'Wrapping Vehicular Completo',
                description: 'Forro integral del vehículo con vinil premium, cambio de color o diseño completo.',
                category: 'vinilo',
                subcategory: 'Vehicular',
                price: 1500,
                deliveryTime: '7-10 días',
                material: 'Vinil premium cast',
                unit: 'unidad',
                stock: 10,
                isAvailable: true,
                tags: ['wrapping', 'vinil', 'vehicular', 'completo', 'premium'],
                createdBy: admin._id
            },
            {
                name: 'Vinil Decorativo para Local',
                description: 'Vinil adhesivo para paredes, vidrios y mobiliario de tu negocio.',
                category: 'vinilo',
                subcategory: 'Decorativo',
                price: 45,
                deliveryTime: '1-2 días',
                material: 'Vinil brillante/mate',
                unit: 'm²',
                stock: 100,
                isAvailable: true,
                tags: ['vinil', 'decorativo', 'local', 'paredes'],
                createdBy: admin._id
            },
            {
                name: 'Microperforado para Vidrios',
                description: 'Vinil microperforado para vidrieras, permite ver desde adentro y publicitar por fuera.',
                category: 'vinilo',
                subcategory: 'Especial',
                price: 40,
                deliveryTime: '24 horas',
                material: 'Microperforado',
                unit: 'm²',
                stock: 100,
                isAvailable: true,
                tags: ['microperforado', 'vinil', 'vidrios', 'vidriera'],
                createdBy: admin._id
            },

            // ===================================
            // 💻 DIGITAL (digital)
            // ===================================
            {
                name: 'Diseño Web Landing Page',
                description: 'Página web de una sola sección, moderna y responsiva, optimizada para conversiones.',
                category: 'digital',
                subcategory: 'Web',
                price: 800,
                deliveryTime: '7-10 días',
                material: 'HTML/CSS/JS',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['web', 'landing', 'diseño', 'responsivo'],
                createdBy: admin._id
            },
            {
                name: 'Diseño Web Completa (5+ páginas)',
                description: 'Sitio web profesional con múltiples páginas, panel admin, SEO y hosting incluido.',
                category: 'digital',
                subcategory: 'Web',
                price: 2500,
                deliveryTime: '15-20 días',
                material: 'HTML/CSS/JS + Backend',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['web', 'sitio', 'completo', 'SEO', 'hosting'],
                createdBy: admin._id
            },
            {
                name: 'Identidad Corporativa Completa',
                description: 'Paquete completo: logo, manual de marca, papelería, tarjetas y archivos editables.',
                category: 'digital',
                subcategory: 'Branding',
                price: 500,
                deliveryTime: '7-10 días',
                material: 'AI, PSD, CDR, PDF',
                unit: 'paquete',
                stock: 999,
                isAvailable: true,
                tags: ['identidad', 'corporativa', 'branding', 'completo', 'editables'],
                createdBy: admin._id
            },
            {
                name: 'Render 3D de Interiores',
                description: 'Visualización 3D fotorrealista de espacios interiores o exteriores para proyectos.',
                category: 'digital',
                subcategory: '3D',
                price: 250,
                deliveryTime: '3-5 días',
                material: 'SKP, BLEND, JPG',
                unit: 'unidad',
                stock: 999,
                isAvailable: true,
                tags: ['render', '3D', 'interiores', 'SketchUp', 'Blender'],
                createdBy: admin._id
            },

            // ===================================
            // 🏠 ESPACIOS (espacios)
            // ===================================
            {
                name: 'Ambientación de Local Comercial',
                description: 'Diseño integral e implementación de ambiente para locales, tiendas y oficinas.',
                category: 'espacios',
                subcategory: 'Interiorismo',
                price: 1500,
                deliveryTime: '10-15 días',
                material: 'Personalizable',
                unit: 'proyecto',
                stock: 10,
                isAvailable: true,
                tags: ['ambientación', 'local', 'interiorismo', 'diseño'],
                createdBy: admin._id
            },
            {
                name: 'Stand para Ferias / Eventos',
                description: 'Diseño y montaje de stand promocional con estructura, iluminación y gráfica.',
                category: 'espacios',
                subcategory: 'Eventos',
                price: 800,
                deliveryTime: '7-10 días',
                material: 'MDF, vinil, iluminación',
                unit: 'unidad',
                stock: 15,
                isAvailable: true,
                tags: ['stand', 'feria', 'evento', 'montaje'],
                createdBy: admin._id
            },
            {
                name: 'Merchandising Pack',
                description: 'Pack de artículos promocionales: gorras, polos, tazas, lapiceros con tu logo.',
                category: 'espacios',
                subcategory: 'Merchandising',
                price: 50,
                deliveryTime: '5-7 días',
                material: 'Textil / Sublimación',
                unit: 'unidad',
                stock: 200,
                isAvailable: true,
                tags: ['merchandising', 'gorras', 'polos', 'tazas', 'promocional'],
                createdBy: admin._id
            }
        ]);
        console.log(`📦 Created ${products.length} products`);

        console.log('\n✅ Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
