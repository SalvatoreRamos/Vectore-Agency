import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['diseno', 'impresion', 'packaging', 'senalizacion', 'vinilo', 'digital', 'espacios'],
        default: 'impresion'
    },
    subcategory: {
        type: String,
        default: 'Manufactura In-House'
    },
    price: {
        type: Number,
        required: false,
        default: null,
        min: [0, 'Price cannot be negative']
    },
    deliveryTime: {
        type: String,
        default: '24 - 48 horas en Pucallpa'
    },
    material: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: 'proyecto'
    },
    minQuantity: {
        type: Number,
        default: 1
    },
    dimensions: {
        type: String,
        default: ''
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    features: [{
        type: String
    }],
    icon: {
        type: String,
        default: '⚙️'
    },
    specifications: {
        type: Map,
        of: String
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    scope: {
        type: String,
        enum: ['local', 'global'],
        default: 'local'
    },
    currency: {
        type: String,
        enum: ['PEN', 'USD'],
        default: 'PEN'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
