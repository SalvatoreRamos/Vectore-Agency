import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    client: {
        type: String,
        required: [true, 'Client name is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
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
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
