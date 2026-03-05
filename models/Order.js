import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String,
        default: ''
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['culqi_card', 'culqi_yape', 'whatsapp', 'pending'],
        default: 'pending'
    },
    // Culqi payment details
    culqiChargeId: {
        type: String,
        default: ''
    },
    culqiTokenId: {
        type: String,
        default: ''
    },
    culqiOrderId: {
        type: String,
        default: ''
    },
    culqiResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Customer details
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        default: ''
    },
    // Shipping details
    shippingAddress: {
        street: { type: String, default: '' },
        district: { type: String, default: '' },
        city: { type: String, default: 'Lima' },
        reference: { type: String, default: '' }
    },
    // Additional info
    notes: {
        type: String,
        default: ''
    },
    paidAt: {
        type: Date
    },
    shippedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('validate', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const prefix = 'VEC';
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Order').countDocuments() + 1;
        this.orderNumber = `${prefix}-${year}${month}-${String(count).padStart(4, '0')}`;
    }
    next();
});

// Index for quick lookups
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
