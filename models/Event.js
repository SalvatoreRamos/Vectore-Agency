import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prize: {
        type: String,
        required: true
    },
    prizeImage: {
        type: String, // URL de la imagen
        required: false
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    terms: {
        type: String,
        default: 'Participan mayores de 18 años residentes en Pucallpa.'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
        default: null
    }
}, {
    timestamps: true
});

// Asegurar que solo haya un evento activo a la vez (opcional, pero recomendado)
// eventSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const Event = mongoose.model('Event', eventSchema);
export default Event;
