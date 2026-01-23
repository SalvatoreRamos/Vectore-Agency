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

        // Check if products exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const products = await Product.insertMany([
                {
                    name: 'Diseño de Logo',
                    description: 'Identidad visual única para tu marca con entrega de archivos editables.',
                    category: 'digital',
                    subcategory: 'Branding',
                    price: 150,
                    stock: 999,
                    isAvailable: true,
                    tags: ['logo', 'branding', 'diseño'],
                    createdBy: admin._id
                },
                {
                    name: 'Diseño Web',
                    description: 'Sitios web modernos, responsivos y optimizados para SEO.',
                    category: 'digital',
                    subcategory: 'Web Design',
                    price: 800,
                    stock: 999,
                    isAvailable: true,
                    tags: ['web', 'diseño', 'desarrollo'],
                    createdBy: admin._id
                },
                {
                    name: 'Contenido Redes Sociales',
                    description: 'Posts y stories profesionales para destacar tu negocio.',
                    category: 'digital',
                    subcategory: 'Marketing',
                    price: 150,
                    stock: 999,
                    isAvailable: true,
                    tags: ['social media', 'marketing', 'contenido'],
                    createdBy: admin._id
                },
                {
                    name: 'Presentaciones Corporativas',
                    description: 'Slides impactantes para tus reuniones de negocios.',
                    category: 'digital',
                    subcategory: 'Diseño',
                    price: 250,
                    stock: 999,
                    isAvailable: true,
                    tags: ['presentaciones', 'corporativo', 'powerpoint'],
                    createdBy: admin._id
                },
                {
                    name: 'Motion Graphics',
                    description: 'Animaciones y videos promocionales que captan la atención.',
                    category: 'digital',
                    subcategory: 'Multimedia',
                    price: 450,
                    stock: 999,
                    isAvailable: true,
                    tags: ['video', 'animacion', 'motion graphics'],
                    createdBy: admin._id
                },
                {
                    name: 'Tarjetas de Presentación',
                    description: 'Impresión premium de 500 tarjetas en diversos materiales y acabados.',
                    category: 'physical',
                    subcategory: 'Impresión',
                    price: 45,
                    stock: 100,
                    isAvailable: true,
                    tags: ['tarjetas', 'impresión', 'branding'],
                    createdBy: admin._id
                },
                {
                    name: 'Flyers y Folletos',
                    description: 'Material promocional de alto impacto para distribución.',
                    category: 'physical',
                    subcategory: 'Impresión',
                    price: 65,
                    stock: 100,
                    isAvailable: true,
                    tags: ['flyers', 'publicidad', 'impresión'],
                    createdBy: admin._id
                },
                {
                    name: 'Banners y Lonas',
                    description: 'Gran formato para máxima visibilidad en exteriores e interiores.',
                    category: 'physical',
                    subcategory: 'Impresión',
                    price: 85,
                    stock: 50,
                    isAvailable: true,
                    tags: ['banners', 'lonas', 'formato gigante'],
                    createdBy: admin._id
                },
                {
                    name: 'Papelería Corporativa',
                    description: 'Hojas membretadas, sobres y folders con tu identidad visual.',
                    category: 'physical',
                    subcategory: 'Papelería',
                    price: 120,
                    stock: 50,
                    isAvailable: true,
                    tags: ['papelería', 'corporativo', 'impresión'],
                    createdBy: admin._id
                },
                {
                    name: 'Merchandising',
                    description: 'Productos promocionales personalizados (tazas, gorras, polos).',
                    category: 'physical',
                    subcategory: 'Regalos',
                    price: 25,
                    stock: 200,
                    isAvailable: true,
                    tags: ['regalos', 'merchandising', 'branding'],
                    createdBy: admin._id
                }
            ]);
            console.log(`📦 Created ${products.length} sample products`);
        } else {
            console.log('📦 Products already exist, skipping sample data');
        }

        console.log('\n✅ Database seeding check complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
