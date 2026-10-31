import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    quotationCode: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    companyOrRuc: {
        type: String,
        trim: true,
        default: ''
    },
    rucType: {
        type: String,
        enum: ['ruc20', 'ruc10', 'company_name', ''],
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    service: {
        type: String,
        trim: true,
        default: ''
    },
    referenceItem: {
        type: String,
        trim: true,
        default: ''
    },
    rfpLink: {
        type: String,
        trim: true,
        default: ''
    },
    channel: {
        type: String,
        enum: ['whatsapp_direct', 'formal_proforma', 'web_brief'],
        default: 'whatsapp_direct'
    },
    timeline: {
        type: String,
        trim: true,
        default: ''
    },
    budget: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    qualificationScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'closed'],
        default: 'new'
    },
    internalNotes: {
        type: String,
        trim: true,
        default: ''
    },
    readAt: {
        type: Date,
        default: null
    },
    respondedAt: {
        type: Date,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    },
    lastStatusChangeAt: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        enum: ['en', 'es', 'b2b'],
        default: 'b2b'
    }
}, {
    timestamps: true
});

/**
 * Auto-generate quotationCode, detect RUC 20/10, and compute B2B Qualification Score
 */
leadSchema.pre('save', function (next) {
    if (this.isNew && !this.quotationCode) {
        const now = new Date();
        const ym = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const rand = Math.floor(1000 + Math.random() * 9000);
        this.quotationCode = `COT-${ym}-${rand}`;
    }

    // Sync company and companyOrRuc for backward compatibility with Admin Inbox
    if (this.companyOrRuc && !this.company) {
        this.company = this.companyOrRuc;
    } else if (this.company && !this.companyOrRuc) {
        this.companyOrRuc = this.company;
    }

    // Detect Peruvian RUC (11 digits starting with 20 or 10)
    const rucMatch = (this.companyOrRuc || '').match(/\b(20|10)\d{9}\b/);
    if (rucMatch) {
        this.rucType = rucMatch[1] === '20' ? 'ruc20' : 'ruc10';
    } else if (this.companyOrRuc) {
        this.rucType = 'company_name';
    }

    let score = 0;

    // 1. Corporate Entity / RUC scoring (0 - 35)
    if (this.rucType === 'ruc20') score += 35;
    else if (this.rucType === 'ruc10') score += 20;
    else if (this.companyOrRuc) score += 22;

    // 2. Channel & Formal Documentation (0 - 20)
    if (this.channel === 'formal_proforma') score += 20;
    else if (this.channel === 'whatsapp_direct') score += 15;
    if (this.rfpLink) score += 10;

    // 3. City / Strategic Lima -> Pucallpa BTL Axis (0 - 20)
    const cityLower = (this.city || '').toLowerCase();
    if (cityLower.includes('lima')) score += 20;
    else if (cityLower.length > 2) score += 12;

    // 4. High-Ticket Service Line & Legacy Budget/Timeline (0 - 25)
    const highTicketServices = ['btl_pucallpa', 'arquitectura_comercial', 'software_ia', 'packaging_3d', 'marca_blanca', 'ai_agents', 'saas', '3d_renders'];
    if (highTicketServices.includes(this.service)) score += 20;
    else if (this.service) score += 12;

    const budgetScores = { '50k+': 30, '15k-50k': 25, '5k-15k': 15 };
    score += budgetScores[this.budget] || 0;

    if ((this.description || '').length >= 45) score += 12;

    this.qualificationScore = Math.min(score, 100);

    if (this.isNew && !this.isModified('priority')) {
        if (this.qualificationScore >= 65 || this.rucType === 'ruc20') {
            this.priority = 'high';
        } else if (this.qualificationScore >= 38) {
            this.priority = 'medium';
        } else {
            this.priority = 'low';
        }
    }

    if (this.isModified('status')) {
        this.lastStatusChangeAt = new Date();
        if (this.status === 'contacted' && !this.respondedAt) {
            this.respondedAt = new Date();
        }
        if (this.status === 'closed') {
            this.closedAt = new Date();
        } else if (this.closedAt) {
            this.closedAt = null;
        }
    }

    next();
});

export default mongoose.model('Lead', leadSchema);
