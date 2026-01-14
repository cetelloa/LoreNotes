/**
 * PayPal Service - Manejo de pagos con PayPal Business
 */
const paypal = require('@paypal/checkout-server-sdk');

// Configurar entorno PayPal (Sandbox o Live)
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }

    // Usar Sandbox por defecto, Live solo si está explícitamente configurado
    if (process.env.PAYPAL_MODE === 'live') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    }
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// Cliente PayPal
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

/**
 * Crear orden de PayPal con los items del carrito
 * @param {Array} cart - Items del carrito [{templateId, title, price}]
 * @param {String} userId - ID del usuario
 * @param {Number} discountPercent - Porcentaje de descuento (0-100)
 * @returns {Object} - Orden creada con ID
 */
async function createOrder(cart, userId, discountPercent = 0) {
    if (!cart || cart.length === 0) {
        throw new Error('El carrito está vacío');
    }

    // Calcular subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    // Aplicar descuento (máximo 99% para evitar $0)
    const effectiveDiscount = Math.min(discountPercent, 99);
    const discount = subtotal * (effectiveDiscount / 100);
    const total = Math.max(subtotal - discount, 0.01); // Mínimo $0.01

    // Construir items para PayPal
    const items = cart.map(item => ({
        name: item.title.substring(0, 127), // PayPal limit
        unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2)
        },
        quantity: '1',
        description: `Plantilla: ${item.templateId}`.substring(0, 127)
    }));

    // Crear request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            reference_id: userId,
            description: 'Compra de plantillas LoreNotes',
            amount: {
                currency_code: 'USD',
                value: total.toFixed(2),
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: total.toFixed(2)
                    }
                }
            },
            items: items
        }],
        application_context: {
            brand_name: 'LoreNotes',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: process.env.FRONTEND_URL || 'http://localhost:5173',
            cancel_url: process.env.FRONTEND_URL || 'http://localhost:5173'
        }
    });

    try {
        const order = await client().execute(request);
        return {
            id: order.result.id,
            status: order.result.status,
            total: total
        };
    } catch (error) {
        console.error('PayPal createOrder error:', error);
        throw new Error('Error al crear orden de PayPal');
    }
}

/**
 * Capturar pago de una orden aprobada
 * @param {String} orderId - ID de la orden de PayPal
 * @returns {Object} - Resultado de la captura
 */
async function capturePayment(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client().execute(request);

        return {
            id: capture.result.id,
            status: capture.result.status,
            payer: {
                email: capture.result.payer?.email_address,
                name: capture.result.payer?.name?.given_name
            },
            amount: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
        };
    } catch (error) {
        console.error('PayPal capturePayment error:', error);
        throw new Error('Error al capturar pago de PayPal');
    }
}

module.exports = {
    createOrder,
    capturePayment
};
