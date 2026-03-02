import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    complaintNumber: {
        type: String,
        unique: true,
        required: true
    },
    consumer: {
        name: {
            type: String,
            required: [true, 'Nombre del consumidor es obligatorio']
        },
        docType: {
            type: String,
            required: [true, 'Tipo de documento es obligatorio'],
            enum: ['DNI', 'CE', 'Pasaporte', 'RUC']
        },
        docNumber: {
            type: String,
            required: [true, 'Número de documento es obligatorio']
        },
        email: {
            type: String,
            required: [true, 'Email es obligatorio']
        },
        phone: {
            type: String,
            required: [true, 'Teléfono es obligatorio']
        },
        address: {
            type: String,
            default: ''
        },
        isMinor: {
            type: Boolean,
            default: false
        },
        parentName: {
            type: String,
            default: ''
        }
    },
    product: {
        type: {
            type: String,
            required: true,
            enum: ['Producto', 'Servicio']
        },
        description: {
            type: String,
            required: [true, 'Descripción del producto/servicio es obligatoria']
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    complaint: {
        type: {
            type: String,
            required: true,
            enum: ['Reclamo', 'Queja']
        },
        detail: {
            type: String,
            required: [true, 'Detalle del reclamo es obligatorio']
        },
        consumerRequest: {
            type: String,
            required: [true, 'Pedido del consumidor es obligatorio']
        }
    },
    status: {
        type: String,
        enum: ['Pendiente', 'En proceso', 'Resuelto', 'Cerrado'],
        default: 'Pendiente'
    },
    response: {
        text: { type: String, default: '' },
        respondedAt: { type: Date }
    }
}, {
    timestamps: true
});

// Auto-generate complaint number before validation
complaintSchema.pre('validate', async function (next) {
    if (!this.complaintNumber) {
        const count = await mongoose.model('Complaint').countDocuments();
        const num = String(count + 1).padStart(4, '0');
        const year = new Date().getFullYear();
        this.complaintNumber = `REC-${year}-${num}`;
    }
    next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
