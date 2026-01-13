import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: [true, 'El nombre del cliente es requerido'],
        trim: true
    },
    businessName: {
        type: String,
        required: [true, 'El nombre del negocio es requerido'],
        trim: true
    },
    comment: {
        type: String,
        required: [true, 'El comentario es requerido'],
        maxlength: 300
    },
    photo: {
        type: String,
        required: [true, 'La foto del cliente es requerida']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
