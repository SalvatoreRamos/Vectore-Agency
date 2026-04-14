import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    service: {
        type: String,
        enum: ['ai_agents', '3d_renders', 'branding', 'saas', 'other', ''],
        default: ''
    },
    timeline: {
        type: String,
        enum: ['asap', '1-2_months', '3+_months', 'exploring', ''],
        default: ''
    },
    budget: {
        type: String,
        enum: ['under_5k', '5k-15k', '15k-50k', '50k+', 'not_sure', ''],
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
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'closed'],
        default: 'new'
    },
    source: {
        type: String,
        enum: ['en', 'es'],
        default: 'en'
    }
}, {
    timestamps: true
});

/**
 * Calculate qualification score based on budget + timeline
 */
leadSchema.pre('save', function (next) {
    let score = 0;

    // Budget scoring (0-50)
    const budgetScores = {
        '50k+': 50,
        '15k-50k': 40,
        '5k-15k': 25,
        'under_5k': 10,
        'not_sure': 15,
        '': 0
    };
    score += budgetScores[this.budget] || 0;

    // Timeline scoring (0-30)
    const timelineScores = {
        'asap': 30,
        '1-2_months': 25,
        '3+_months': 15,
        'exploring': 5,
        '': 0
    };
    score += timelineScores[this.timeline] || 0;

    // Service scoring (0-20) — AI and SaaS are higher value
    const serviceScores = {
        'ai_agents': 20,
        'saas': 18,
        '3d_renders': 15,
        'branding': 12,
        'other': 8,
        '': 0
    };
    score += serviceScores[this.service] || 0;

    this.qualificationScore = Math.min(score, 100);
    next();
});

export default mongoose.model('Lead', leadSchema);
