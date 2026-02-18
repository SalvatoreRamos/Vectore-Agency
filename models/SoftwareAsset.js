import mongoose from 'mongoose';

const softwareAssetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    section: {
        type: String, // e.g., 'hero', 'features', 'gallery', 'mockup'
        default: 'general'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('SoftwareAsset', softwareAssetSchema);
