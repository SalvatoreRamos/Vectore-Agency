import mongoose from 'mongoose';

const DEFAULT_SECTORS = [
    { id: 'malls', name: 'Centros Comerciales & Retail', subtitle: '', icon: 'building', isActive: true, order: 1 },
    { id: 'government', name: 'Entidades del Estado', subtitle: '', icon: 'landmark', isActive: true, order: 2 },
    { id: 'cinema', name: 'Cines & Entretenimiento', subtitle: '', icon: 'film', isActive: true, order: 3 },
    { id: 'wholesale', name: 'Distribuidoras Mayoristas', subtitle: '', icon: 'truck', isActive: true, order: 4 },
    { id: 'agro', name: 'Agroindustria & Exportación', subtitle: '', icon: 'leaf', isActive: true, order: 5 },
    { id: 'banking', name: 'Banca & Finanzas', subtitle: '', icon: 'shield', isActive: true, order: 6 },
    { id: 'health', name: 'Clínicas & Salud', subtitle: '', icon: 'activity', isActive: true, order: 7 },
    { id: 'automotive', name: 'Automotriz & Flotas', subtitle: '', icon: 'compass', isActive: true, order: 8 },
    { id: 'realestate', name: 'Inmobiliarias & Hotelería', subtitle: '', icon: 'layers', isActive: true, order: 9 }
];

const DEFAULT_BUSINESS_LINES = [
    {
        code: 'GIRO 01 · PUBLICIDAD',
        title: 'Publicidad & Ejecución BTL',
        description: 'Producción en planta propia, rotulación e instalación en Pucallpa para marcas nacionales.'
    },
    {
        code: 'GIRO 02 · ARQUITECTURA',
        title: 'Arquitectura Comercial & 3D',
        description: 'Stands, islas retail, interiorismo corporativo y packaging 3D fotorrealista.'
    },
    {
        code: 'GIRO 03 · SOFTWARE',
        title: 'Software a Medida & IA',
        description: 'Plataformas web/desktop, automatización con IA y nuestro ERP propio Vectore Flow.'
    }
];

const sectorItemSchema = new mongoose.Schema({
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: 'layers' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { _id: false });

const businessLineSchema = new mongoose.Schema({
    code: { type: String, trim: true, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' }
}, { _id: false });

const siteConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'main',
        unique: true,
        index: true
    },
    hero: {
        backgroundType: {
            type: String,
            enum: ['default', 'image', 'video'],
            default: 'default'
        },
        backgroundUrl: {
            type: String,
            trim: true,
            default: ''
        },
        mobileBackgroundUrl: {
            type: String,
            trim: true,
            default: ''
        },
        overlayOpacity: {
            type: Number,
            default: 0.58,
            min: 0.15,
            max: 0.92
        },
        badgeText: {
            type: String,
            trim: true,
            default: 'PUBLICIDAD & BTL EN PERÚ · PACKAGING 3D & SOFTWARE GLOBAL'
        },
        headlineLine1: {
            type: String,
            trim: true,
            default: 'Ejecutamos tus despliegues BTL en Pucallpa'
        },
        headlineHighlight: {
            type: String,
            trim: true,
            default: 'y creamos publicidad, diseño especializado, packaging 3D y software a medida.'
        },
        subtitle: {
            type: String,
            trim: true,
            default: 'Taller propio para marcas de Lima y todo el Perú, junto con diseño publicitario, visualización 3D y software para empresas a nivel internacional.'
        },
        primaryCtaText: {
            type: String,
            trim: true,
            default: 'Cotizar proyecto'
        },
        secondaryCtaText: {
            type: String,
            trim: true,
            default: 'Ver portafolio'
        },
        floatingCard: {
            enabled: { type: Boolean, default: true },
            label: { type: String, trim: true, default: 'OPEN PROJECT' },
            mode: { type: String, enum: ['latest', 'manual'], default: 'latest' },
            projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null }
        }
    },
    sectors: {
        type: [sectorItemSchema],
        default: () => DEFAULT_SECTORS
    },
    corporate: {
        whatsappNumber: {
            type: String,
            trim: true,
            default: '51950699910'
        },
        phoneDisplay: {
            type: String,
            trim: true,
            default: '+51 950 699 910'
        },
        email: {
            type: String,
            trim: true,
            default: 'agenciavectore@gmail.com'
        },
        address: {
            type: String,
            trim: true,
            default: 'Jr. Tarapacá 390, Callería — Pucallpa, Ucayali, Perú'
        },
        rucInfo: {
            type: String,
            trim: true,
            default: 'Facturación Electrónica & OS · Confidencialidad (NDA)'
        },
        businessLines: {
            type: [businessLineSchema],
            default: () => DEFAULT_BUSINESS_LINES
        }
    }
}, {
    timestamps: true
});

export { DEFAULT_SECTORS, DEFAULT_BUSINESS_LINES };
export default mongoose.model('SiteConfig', siteConfigSchema);

