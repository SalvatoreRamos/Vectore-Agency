import mongoose from 'mongoose';

const DEFAULT_SECTORS = [
    { id: 'malls', name: 'Centros Comerciales & Retail Moderno', subtitle: 'Islas, escaparates, tótems y campañas de temporada', icon: 'building', isActive: true, order: 1 },
    { id: 'government', name: 'Entidades del Estado & Sector Público', subtitle: 'Señalética normativa, módulos institucionales y eventos', icon: 'landmark', isActive: true, order: 2 },
    { id: 'cinema', name: 'Cadenas de Cines & Entretenimiento', subtitle: 'Corpóreos, carteleras retroiluminadas y estrenos BTL', icon: 'film', isActive: true, order: 3 },
    { id: 'wholesale', name: 'Distribuidoras Mayoristas & Consumo Masivo', subtitle: 'Trade marketing, vestimenta de PDV y flotas de reparto', icon: 'truck', isActive: true, order: 4 },
    { id: 'agro', name: 'Agroindustria, Forestal & Exportadoras', subtitle: 'Packaging 3D, etiquetado industrial y stands feriales', icon: 'leaf', isActive: true, order: 5 },
    { id: 'banking', name: 'Banca, Cajas & Finanzas', subtitle: 'Acondicionamiento de agencias, fachadas y letreros LED', icon: 'shield', isActive: true, order: 6 },
    { id: 'health', name: 'Clínicas, Laboratorios & Salud', subtitle: 'Arquitectura interior aséptica, señalización y software', icon: 'activity', isActive: true, order: 7 },
    { id: 'automotive', name: 'Concesionarios Automotrices & Logística', subtitle: 'Showrooms comerciales y wrapping vehicular de alta resistencia', icon: 'compass', isActive: true, order: 8 },
    { id: 'realestate', name: 'Inmobiliarias, Constructoras & Hotelería', subtitle: 'Casetas de venta, vallas perimetrales y visualización 3D', icon: 'layers', isActive: true, order: 9 }
];

const DEFAULT_BUSINESS_LINES = [
    {
        code: 'GIRO 01',
        title: 'Publicidad & Ejecución BTL',
        description: 'Producción gráfica industrial en gran formato, señalética normativa, rotulación de flotas y despliegue de campañas en Ucayali para marcas de Lima.'
    },
    {
        code: 'GIRO 02',
        title: 'Arquitectura Comercial & 3D',
        description: 'Diseño y fabricación de stands feriales, módulos retail, interiorismo corporativo, modelado de producto y packaging 3D fotorrealista.'
    },
    {
        code: 'GIRO 03',
        title: 'Ingeniería de Software & IA',
        description: 'Desarrollo de plataformas empresariales a medida, automatización con agentes de IA y nuestro ecosistema propio Vectore Flow SaaS.'
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
            default: 'EJECUCIÓN BTL PUCALLPA · DISEÑO 3D & SOFTWARE LIMA / NACIONAL'
        },
        headlineLine1: {
            type: String,
            trim: true,
            default: 'Ejecutamos tus despliegues BTL en Pucallpa'
        },
        headlineHighlight: {
            type: String,
            trim: true,
            default: 'y creamos diseño especializado, packaging 3D y software a medida.'
        },
        subtitle: {
            type: String,
            trim: true,
            default: 'Somos el brazo ejecutor con taller propio en la Amazonía para marcas y agencias de Lima, integrando producción en sitio, arquitectura comercial, visualización 3D e ingeniería de software.'
        },
        primaryCtaText: {
            type: String,
            trim: true,
            default: 'Solicitar Cotización Corporativa'
        },
        secondaryCtaText: {
            type: String,
            trim: true,
            default: 'Explorar Casos de Éxito'
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
            default: 'Facturación Electrónica RUC · Atención bajo Orden de Servicio & NDA'
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
