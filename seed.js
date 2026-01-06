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

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            email: process.env.ADMIN_EMAIL || 'admin@vectore.com',
            password: process.env.ADMIN_PASSWORD || 'Admin123!',
            name: 'Administrator',
            role: 'admin'
        });
        console.log('👤 Admin user created');

        // Create sample products
        const products = await Product.insertMany([
            {
                name: 'Logo Design Premium',
                description: 'Professional logo design with unlimited revisions',
                category: 'digital',
                subcategory: 'Branding',
                price: 299,
                images: [
                    { url: '/images/logo-design.jpg', alt: 'Logo Design', isPrimary: true }
                ],
                features: [
                    '3 initial concepts',
                    'Unlimited revisions',
                    'Vector files included',
                    'Brand guidelines'
                ],
                stock: 999,
                isAvailable: true,
                tags: ['logo', 'branding', 'design'],
                createdBy: admin._id
            },
            {
                name: 'Social Media Management',
                description: 'Complete social media management for 1 month',
                category: 'digital',
                subcategory: 'Social Media',
                price: 499,
                images: [
                    { url: '/images/social-media.jpg', alt: 'Social Media', isPrimary: true }
                ],
                features: [
                    '20 posts per month',
                    'Content creation',
                    'Analytics reports',
                    'Community management'
                ],
                stock: 999,
                isAvailable: true,
                tags: ['social media', 'marketing', 'content'],
                createdBy: admin._id
            },
            {
                name: 'Business Cards (500 units)',
                description: 'Premium business cards with custom design',
                category: 'physical',
                subcategory: 'Printing',
                price: 89,
                images: [
                    { url: '/images/business-cards.jpg', alt: 'Business Cards', isPrimary: true }
                ],
                features: [
                    '500 units',
                    'Premium cardstock',
                    'Custom design included',
                    'Free shipping'
                ],
                stock: 50,
                isAvailable: true,
                tags: ['printing', 'business cards', 'physical'],
                createdBy: admin._id
            },
            {
                name: 'Website Design & Development',
                description: 'Complete website design and development',
                category: 'digital',
                subcategory: 'Web Design',
                price: 1999,
                images: [
                    { url: '/images/web-design.jpg', alt: 'Web Design', isPrimary: true }
                ],
                features: [
                    'Responsive design',
                    'Up to 5 pages',
                    'SEO optimization',
                    '3 months support'
                ],
                stock: 999,
                isAvailable: true,
                tags: ['web', 'design', 'development'],
                createdBy: admin._id
            },
            {
                name: 'Promotional Flyers (1000 units)',
                description: 'High-quality promotional flyers',
                category: 'physical',
                subcategory: 'Printing',
                price: 149,
                images: [
                    { url: '/images/flyers.jpg', alt: 'Flyers', isPrimary: true }
                ],
                features: [
                    '1000 units',
                    'Full color printing',
                    'Custom design',
                    'Multiple sizes available'
                ],
                stock: 30,
                isAvailable: true,
                tags: ['printing', 'flyers', 'marketing'],
                createdBy: admin._id
            },
            {
                name: 'Brand Identity Package',
                description: 'Complete brand identity development',
                category: 'digital',
                subcategory: 'Branding',
                price: 899,
                images: [
                    { url: '/images/brand-identity.jpg', alt: 'Brand Identity', isPrimary: true }
                ],
                features: [
                    'Logo design',
                    'Color palette',
                    'Typography selection',
                    'Brand guidelines document'
                ],
                stock: 999,
                isAvailable: true,
                tags: ['branding', 'identity', 'design'],
                createdBy: admin._id
            }
        ]);

        console.log(`📦 Created ${products.length} sample products`);
        console.log('\n✅ Database seeded successfully!');
        console.log(`\n👤 Admin credentials:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
