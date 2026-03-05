import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// ===================================
// Email Config
// ===================================
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOrderConfirmationEmail(order) {
    try {
        if (!process.env.EMAIL_USER) {
            console.log('Skipping email confirmation: No EMAIL_USER configured');
            return;
        }

        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.quantity}x</strong> ${item.name}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    S/ ${item.price.toFixed(2)}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Vectore" <${process.env.EMAIL_USER}>`,
            to: order.customerEmail,
            subject: `Confirmación de Pedido - ${order.orderNumber || 'Recibido'}`,
            html: `
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #8655FF; margin: 0; font-size: 24px;">¡Gracias por tu compra!</h1>
                        <p style="color: #666; margin-top: 5px;">Tu pago ha sido procesado exitosamente.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">
                            Detalles del Pedido <span style="color: #8655FF; float: right;">#${order.orderNumber || order._id.toString().substring(0, 8)}</span>
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; margin-top: 15px;">
                            <div><strong>Cliente:</strong><br/>${order.customerName}</div>
                            <div><strong>Fecha:</strong><br/>${new Date(order.paidAt || order.createdAt).toLocaleDateString('es-PE')}</div>
                            <div><strong>Método de pago:</strong><br/>${order.paymentMethod === 'culqi_card' ? 'Tarjeta (Culqi)' : 'PagoEfectivo/Yape'}</div>
                            <div><strong>Total Pagado:</strong><br/>S/ ${order.total.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <h3 style="color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">Resumen de Artículos</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold;">Subtotal</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold;">S/ ${order.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; text-align: right; font-size: 18px; color: #8655FF;"><strong>Total Pagado</strong></td>
                                <td style="padding: 10px; text-align: right; font-size: 18px; color: #8655FF;"><strong>S/ ${order.total.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888;">
                        <p>Este es un recibo automático. Si tienes alguna duda sobre tu pedido, por favor contáctanos.</p>
                        <p style="margin-top: 15px; color: #8655FF; font-weight: bold; font-size: 14px;">El equipo de Vectore</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${order.customerEmail}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
}

// ===================================
// Auth middleware
// ===================================
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

// ===================================
// Admin middleware
// ===================================
function adminMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        req.userId = decoded.userId || decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

// ===================================
// POST /api/payments/create-charge
// Create a Culqi charge from a token
// ===================================
router.post('/create-charge', authMiddleware, async (req, res) => {
    try {
        const {
            tokenId,
            amount, // in cents (e.g., 5000 = S/ 50.00)
            email,
            items,
            customerName,
            customerPhone,
            shippingAddress,
            notes
        } = req.body;

        if (!tokenId || !amount || !email || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requiere tokenId, amount, email e items.'
            });
        }

        // Create the charge via Culqi API
        const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`
            },
            body: JSON.stringify({
                amount: Math.round(amount),
                currency_code: 'PEN',
                email: email,
                source_id: tokenId,
                description: `Pedido Vectore - ${customerName}`,
                metadata: {
                    customer_name: customerName,
                    customer_phone: customerPhone || '',
                    order_source: 'vectore_web'
                }
            })
        });

        const chargeData = await culqiResponse.json();

        if (!culqiResponse.ok || chargeData.object === 'error') {
            console.error('Culqi charge error:', JSON.stringify(chargeData));

            // Save failed order
            const failedOrder = new Order({
                user: req.userId,
                items: items.map(item => ({
                    product: item.id || undefined,
                    name: item.name,
                    price: item.price,
                    quantity: item.qty || item.quantity,
                    image: item.image || ''
                })),
                subtotal: amount / 100,
                total: amount / 100,
                status: 'failed',
                paymentMethod: 'culqi_card',
                culqiTokenId: tokenId,
                culqiResponse: chargeData,
                customerName: customerName,
                customerEmail: email,
                customerPhone: customerPhone || '',
                shippingAddress: shippingAddress || {},
                notes: notes || ''
            });
            await failedOrder.save();

            return res.status(400).json({
                success: false,
                message: chargeData.user_message || chargeData.merchant_message || 'Error al procesar el pago',
                error: chargeData
            });
        }

        // Payment successful — save order
        const order = new Order({
            user: req.userId,
            items: items.map(item => ({
                product: item.id || undefined,
                name: item.name,
                price: item.price,
                quantity: item.qty || item.quantity,
                image: item.image || ''
            })),
            subtotal: amount / 100,
            total: amount / 100,
            status: 'paid',
            paymentMethod: 'culqi_card',
            culqiChargeId: chargeData.id,
            culqiTokenId: tokenId,
            culqiResponse: chargeData,
            customerName: customerName,
            customerEmail: email,
            customerPhone: customerPhone || '',
            shippingAddress: shippingAddress || {},
            notes: notes || '',
            paidAt: new Date()
        });

        await order.save();

        // Send email confirmation
        if (order.customerEmail) {
            sendOrderConfirmationEmail(order);
        }

        return res.json({
            success: true,
            message: '¡Pago realizado con éxito!',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
                paidAt: order.paidAt
            }
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al procesar el pago',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ===================================
// POST /api/payments/create-order (Culqi Order for multipago)
// Creates a Culqi Order for PagoEfectivo, Yape, etc.
// ===================================
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { amount, email, customerName, customerPhone, items } = req.body;

        if (!amount || !email) {
            return res.status(400).json({
                success: false,
                message: 'Amount y email son requeridos'
            });
        }

        // Generate a unique order number for Culqi
        const orderNum = `VEC-${Date.now()}`;

        const culqiResponse = await fetch('https://api.culqi.com/v2/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`
            },
            body: JSON.stringify({
                amount: Math.round(amount),
                currency_code: 'PEN',
                description: `Pedido ${orderNum}`,
                order_number: orderNum,
                client_details: {
                    first_name: customerName?.split(' ')[0] || 'Cliente',
                    last_name: customerName?.split(' ').slice(1).join(' ') || '',
                    email: email,
                    phone_number: customerPhone || '999999999'
                },
                expiration_date: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h expiration
                metadata: {
                    order_source: 'vectore_web'
                }
            })
        });

        const orderData = await culqiResponse.json();

        if (!culqiResponse.ok || orderData.object === 'error') {
            console.error('Culqi order creation error:', JSON.stringify(orderData));
            return res.status(400).json({
                success: false,
                message: 'Error al crear la orden de pago',
                error: orderData
            });
        }

        return res.json({
            success: true,
            culqiOrderId: orderData.id,
            orderNumber: orderNum
        });

    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno'
        });
    }
});

// ===================================
// POST /api/payments/confirm-order
// Confirm an order paid via Yape/PagoEfectivo
// ===================================
router.post('/confirm-order', authMiddleware, async (req, res) => {
    try {
        const { culqiOrderId, items, customerName, customerEmail, customerPhone, shippingAddress, notes, amount } = req.body;

        const order = new Order({
            user: req.userId,
            items: items.map(item => ({
                product: item.id || undefined,
                name: item.name,
                price: item.price,
                quantity: item.qty || item.quantity,
                image: item.image || ''
            })),
            subtotal: amount / 100,
            total: amount / 100,
            status: 'paid',
            paymentMethod: 'culqi_yape',
            culqiOrderId: culqiOrderId,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone || '',
            shippingAddress: shippingAddress || {},
            notes: notes || '',
            paidAt: new Date()
        });

        await order.save();

        // Send email confirmation
        if (order.customerEmail) {
            sendOrderConfirmationEmail(order);
        }

        return res.json({
            success: true,
            message: '¡Orden confirmada con éxito!',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Confirm order error:', error);
        return res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// ===================================
// GET /api/payments/my-orders
// Get current user's orders
// ===================================
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .select('-culqiResponse -culqiTokenId');

        return res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
    }
});

// ===================================
// GET /api/payments/orders/:id
// Get a specific order detail
// ===================================
router.get('/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.userId
        }).select('-culqiResponse -culqiTokenId');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener el pedido' });
    }
});

// ===================================
// ADMIN: GET /api/payments/admin/orders
// Get all orders (admin only)
// ===================================
router.get('/admin/orders', adminMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        const total = await Order.countDocuments(filter);

        return res.json({
            success: true,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
    }
});

// ===================================
// ADMIN: PUT /api/payments/admin/orders/:id/status
// Update order status (admin only)
// ===================================
router.put('/admin/orders/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const update = { status };
        if (status === 'shipped') update.shippedAt = new Date();
        if (status === 'delivered') update.deliveredAt = new Date();

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar pedido' });
    }
});

// ===================================
// ADMIN: GET /api/payments/admin/stats
// Payment statistics (admin only)
// ===================================
router.get('/admin/stats', adminMiddleware, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ status: 'paid' });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const failedOrders = await Order.countDocuments({ status: 'failed' });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return res.json({
            success: true,
            stats: {
                totalOrders,
                paidOrders,
                pendingOrders,
                failedOrders,
                totalRevenue,
                monthlyRevenue
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
});

// ===================================
// POST /api/payments/webhook
// Handle Culqi webhooks
// ===================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        console.log('Culqi webhook received:', event.type || 'unknown');

        if (event.type === 'charge.creation.succeeded') {
            const charge = event.data;
            // Update order status if we stored the charge ID
            const order = await Order.findOne({ culqiChargeId: charge.id });
            if (order && order.status !== 'paid') {
                order.status = 'paid';
                order.paidAt = new Date();
                await order.save();
                console.log(`Order ${order.orderNumber} confirmed via webhook`);
            }
        }

        if (event.type === 'order.status.changed') {
            const culqiOrder = event.data;
            if (culqiOrder.state === 'paid') {
                const order = await Order.findOne({ culqiOrderId: culqiOrder.id });
                if (order && order.status !== 'paid') {
                    order.status = 'paid';
                    order.paidAt = new Date();
                    await order.save();
                    console.log(`Order ${order.orderNumber} paid via webhook (order)`);
                }
            }
        }

        return res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(400).json({ error: 'Webhook processing failed' });
    }
});

// ===================================
// GET /api/payments/config
// Return public Culqi config for frontend
// ===================================
router.get('/config', (req, res) => {
    res.json({
        success: true,
        publicKey: process.env.CULQI_PUBLIC_KEY,
        rsaId: process.env.CULQI_RSA_ID,
        rsaPublicKey: process.env.CULQI_RSA_PUBLIC_KEY?.replace(/\\n/g, '\n')
    });
});

export default router;
