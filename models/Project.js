import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    client: {
        type: String,
        trim: true,
        default: 'Cliente Corporativo'
    },
    isWhiteLabel: {
        type: Boolean,
        default: false
    },
    publicClientLabel: {
        type: String,
        trim: true,
        default: ''
    },
    sector: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: 'Pucallpa, Ucayali'
    },
    deliverables: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail image URL is required']
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: String
    }],
    tags: [String],
    date: {
        type: Date,
        default: Date.now
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    scope: {
        type: String,
        enum: ['local', 'global'],
        default: 'local'
    }
}, {
    timestamps: true
});

/**
 * Helper method to sanitize confidential client data for public B2B responses
 */
projectSchema.methods.toPublicJSON = function () {
    const obj = this.toObject();
    if (obj.isWhiteLabel) {
        obj.client = obj.publicClientLabel
            || (obj.sector ? `Proyecto Confidencial · ${obj.sector}` : 'Ejecución Marca Blanca (NDA)');
    }
    return obj;
};

const Project = mongoose.model('Project', projectSchema);
export default Project;
