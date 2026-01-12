import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES_URL } from '../config';

export const CartPage = () => {
    const { cart, removeFromCart, isLoading } = useCart();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    const handleRemove = async (templateId: string) => {
        await removeFromCart(templateId);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-serif text-elegant-black mb-8 flex items-center gap-3">
                <ShoppingCart size={32} strokeWidth={1.5} />
                Mi Carrito
            </h1>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
            >
                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-elegant-light mb-4" />
                        <h2 className="text-xl font-serif text-elegant-gray mb-6">Tu carrito está vacío</h2>
                        <button
                            onClick={() => navigate('/templates')}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                        >
                            Ver Plantillas
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-4 mb-8">
                            {cart.map((item) => (
                                <div key={item.templateId} className="flex items-center justify-between p-4 bg-cream rounded-xl">
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
                                            <h3 className="font-medium text-elegant-black">{item.title}</h3>
                                            <p className="text-elegant-black font-medium">${item.price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.templateId)}
                                        className="p-2 text-elegant-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={isLoading}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Total & Checkout */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg text-elegant-gray">Total:</span>
                                <span className="text-2xl font-serif text-elegant-black">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                disabled={isLoading}
                                className="w-full bg-elegant-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Pagar con PayPal
                            </button>

                            <p className="text-center text-elegant-light text-sm mt-4">
                                Pago seguro con PayPal. Tus plantillas estarán disponibles inmediatamente.
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};
