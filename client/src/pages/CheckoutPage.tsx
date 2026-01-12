import { useState } from 'react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ShoppingBag, CheckCircle, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AUTH_URL } from '../config';

// PayPal Client ID desde variables de entorno
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

export const CheckoutPage = () => {
    const { cart, refreshCart } = useCart();
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    // Crear orden en nuestro backend
    const createOrder = async () => {
        try {
            const response = await fetch(`${AUTH_URL}/paypal/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear orden');
            }

            return data.orderId;
        } catch (error) {
            console.error('Create order error:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Error al crear orden');
            throw error;
        }
    };

    // Capturar pago después de aprobación
    const onApprove = async (data: { orderID: string }) => {
        setStatus('processing');

        try {
            const response = await fetch(`${AUTH_URL}/paypal/capture-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: data.orderID })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al procesar pago');
            }

            setStatus('success');
            setMessage(result.message);
            refreshCart();

            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/account');
            }, 3000);

        } catch (error) {
            console.error('Capture error:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Error al procesar el pago');
        }
    };

    // Si no está autenticado
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <ShoppingBag size={48} className="mx-auto text-elegant-light mb-4" />
                <h1 className="text-2xl font-serif text-elegant-black mb-4">Inicia sesión para continuar</h1>
                <Link to="/login" className="text-elegant-black underline">Ir a login</Link>
            </div>
        );
    }

    // Si el carrito está vacío
    if (cart.length === 0 && status !== 'success') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <ShoppingBag size={48} className="mx-auto text-elegant-light mb-4" />
                <h1 className="text-2xl font-serif text-elegant-black mb-4">Tu carrito está vacío</h1>
                <Link to="/templates" className="text-elegant-black underline">Ver plantillas</Link>
            </div>
        );
    }

    // Si PayPal no está configurado
    if (!PAYPAL_CLIENT_ID) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-serif text-elegant-black mb-4">PayPal no configurado</h1>
                <p className="text-elegant-gray">El sistema de pagos no está disponible en este momento.</p>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{
            clientId: PAYPAL_CLIENT_ID,
            currency: 'USD',
            intent: 'capture'
        }}>
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/cart" className="text-elegant-gray hover:text-elegant-black transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-serif text-elegant-black">Finalizar compra</h1>
                </div>

                {/* Success State */}
                {status === 'success' ? (
                    <motion.div
                        className="bg-white rounded-2xl p-8 shadow-lg text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-serif text-elegant-black mb-2">¡Pago exitoso!</h2>
                        <p className="text-elegant-gray mb-4">{message}</p>
                        <p className="text-sm text-elegant-light">Redirigiendo a tu cuenta...</p>
                    </motion.div>
                ) : (
                    <>
                        {/* Order Summary */}
                        <motion.div
                            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-lg font-serif text-elegant-black mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} /> Resumen del pedido
                            </h2>

                            <div className="space-y-3 mb-4">
                                {cart.map((item) => (
                                    <div key={item.templateId} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-elegant-gray">{item.title}</span>
                                        <span className="font-medium text-elegant-black">${item.price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4 border-t-2 border-elegant-black">
                                <span className="text-lg font-serif text-elegant-black">Total</span>
                                <span className="text-xl font-bold text-elegant-black">${total.toFixed(2)} USD</span>
                            </div>
                        </motion.div>

                        {/* Error Message */}
                        {status === 'error' && (
                            <motion.div
                                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle size={18} />
                                    <span>{message}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Payment Section */}
                        <motion.div
                            className="bg-white rounded-2xl p-6 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-lg font-serif text-elegant-black mb-4 flex items-center gap-2">
                                <CreditCard size={18} /> Método de pago
                            </h2>

                            {status === 'processing' ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-2 border-elegant-black border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-elegant-gray">Procesando pago...</p>
                                </div>
                            ) : (
                                <div className="paypal-buttons-container">
                                    <PayPalButtons
                                        style={{
                                            layout: 'vertical',
                                            color: 'black',
                                            shape: 'rect',
                                            label: 'pay'
                                        }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={(err) => {
                                            console.error('PayPal error:', err);
                                            setStatus('error');
                                            setMessage('Error en el proceso de pago. Por favor intenta de nuevo.');
                                        }}
                                        onCancel={() => {
                                            setStatus('idle');
                                            setMessage('');
                                        }}
                                    />
                                </div>
                            )}

                            <p className="text-xs text-elegant-light text-center mt-4">
                                Al completar tu compra, aceptas nuestros términos y condiciones.
                                Tus plantillas estarán disponibles inmediatamente en "Mis Compras".
                            </p>
                        </motion.div>
                    </>
                )}
            </div>
        </PayPalScriptProvider>
    );
};
