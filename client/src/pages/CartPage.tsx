import { useCart } from '../context/CartContext';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Check, Package } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES_URL } from '../config';

export const CartPage = () => {
    const { cart, removeFromCart, checkout, isLoading } = useCart();
    const [checkoutMessage, setCheckoutMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    const handleCheckout = async () => {
        const result = await checkout();
        if (result.success) {
            setCheckoutMessage({ type: 'success', text: result.message });
            setTimeout(() => navigate('/account'), 2000);
        } else {
            setCheckoutMessage({ type: 'error', text: result.message });
        }
    };

    const handleRemove = async (templateId: string) => {
        await removeFromCart(templateId);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading text-ink-black mb-8 flex items-center gap-3">
                <ShoppingCart size={36} />
                Mi Carrito
            </h1>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                {checkoutMessage.text && (
                    <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${checkoutMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        <Check size={20} />
                        {checkoutMessage.text}
                    </div>
                )}

                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-heading text-gray-500 mb-4">Tu carrito está vacío</h2>
                        <CraftButton variant="primary" onClick={() => navigate('/templates')}>
                            Ver Plantillas
                        </CraftButton>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-4 mb-8">
                            {cart.map((item) => (
                                <div key={item.templateId} className="flex items-center justify-between p-4 bg-paper-white rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`${TEMPLATES_URL}/${item.templateId}/image`}
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=📄';
                                            }}
                                        />
                                        <div>
                                            <h3 className="font-heading text-lg">{item.title}</h3>
                                            <p className="text-primary-craft font-bold">${item.price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.templateId)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                        disabled={isLoading}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Total & Checkout */}
                        <div className="border-t-2 border-dashed border-gray-300 pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-heading">Total:</span>
                                <span className="text-3xl font-heading text-primary-craft">${total.toFixed(2)}</span>
                            </div>

                            <CraftButton
                                variant="accent"
                                className="w-full justify-center text-lg"
                                onClick={handleCheckout}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Procesando...' : '🛒 Completar Compra'}
                            </CraftButton>

                            <p className="text-center text-gray-500 text-sm mt-4">
                                * Las plantillas estarán disponibles inmediatamente en "Mi Cuenta"
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};
