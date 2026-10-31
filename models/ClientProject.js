import mongoose from 'mongoose';
import crypto from 'crypto';

const deliverableSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['arte_hd', 'reporte_instalacion', 'factura_pdf', 'entregable_final'],
        default: 'entregable_final'
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'changes_requested'],
        default: 'pending'
    },
    clientFeedback: {
        type: String,
        trim: true,
        default: ''
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const clientProjectSchema = new mongoose.Schema({
    otCode: {
        type: String,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    clientName: {
        type: String,
        trim: true,
        default: ''
    },
    clientCompany: {
        type: String,
        trim: true,
        default: ''
    },
    serviceCategory: {
        type: String,
        trim: true,
        default: 'Ejecución BTL & Producción'
    },
    location: {
        type: String,
        trim: true,
        default: 'Pucallpa, Ucayali'
    },
    status: {
        type: String,
        enum: ['briefing', 'in_design', 'pending_approval', 'in_production', 'installing', 'completed'],
        default: 'in_design'
    },
    progress: {
        type: Number,
        default: 25,
        min: 0,
        max: 100
    },
    timelineNotes: {
        type: String,
        trim: true,
        default: ''
    },
    deliverables: {
        type: [deliverableSchema],
        default: []
    },
    paymentTicket: {
        enabled: { type: Boolean, default: false },
        concept: { type: String, trim: true, default: '' },
        amountPen: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ['none', 'pending', 'paid'], default: 'none' },
        ticketToken: { type: String, index: true, sparse: true },
        paidAt: { type: Date, default: null },
        culqiChargeId: { type: String, default: '' }
    }
}, {
    timestamps: true
});

clientProjectSchema.pre('validate', async function (next) {
    if (!this.otCode) {
        const now = new Date();
        const ym = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const rand = Math.floor(1000 + Math.random() * 9000);
        this.otCode = `OT-${ym}-${rand}`;
    }
    if (this.paymentTicket?.enabled && !this.paymentTicket.ticketToken) {
        this.paymentTicket.ticketToken = crypto.randomBytes(12).toString('hex');
        if (this.paymentTicket.status === 'none') {
            this.paymentTicket.status = 'pending';
        }
    }
    next();
});

export default mongoose.model('ClientProject', clientProjectSchema);
