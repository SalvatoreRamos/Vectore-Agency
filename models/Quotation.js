import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
    quotationNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        name: {
            type: String,
            required: [true, 'Customer name is required']
        },
        email: {
            type: String,
            required: [true, 'Customer email is required'],
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },
        phone: {
            type: String
        },
        company: {
            type: String
        }
    },
    projectType: {
        type: String,
        required: [true, 'Project type is required'],
        enum: ['branding', 'web-design', 'social-media', 'printing', 'advertising', 'other']
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    requirements: [{
        type: String
    }],
    budget: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    timeline: {
        startDate: Date,
        endDate: Date,
        duration: String
    },
    estimatedCost: {
        type: Number
    },
    breakdown: [{
        item: String,
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    aiSuggestions: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'reviewed', 'accepted', 'rejected', 'expired'],
        default: 'draft'
    },
    validUntil: {
        type: Date
    },
    notes: {
        type: String
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    convertedToOrder: {
        type: Boolean,
        default: false
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, {
    timestamps: true
});

// Generate quotation number before saving
quotationSchema.pre('save', async function (next) {
    if (!this.quotationNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.quotationNumber = `QUO-${year}${month}-${random}`;
    }

    // Set valid until date (30 days from creation)
    if (!this.validUntil) {
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 30);
        this.validUntil = validDate;
    }

    next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;
