import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    ticketId: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        select: false // No devolver por defecto por privacidad
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar que el mismo teléfono participe dos veces en el mismo evento
participantSchema.index({ event: 1, phone: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);
export default Participant;
