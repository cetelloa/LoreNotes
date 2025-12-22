import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AUTH_URL } from '../config';
import { useAuth } from './AuthContext';

interface CartItem {
    templateId: string;
    title: string;
    price: number;
    addedAt?: string;
}

interface CartContextType {
    cart: CartItem[];
    cartCount: number;
    addToCart: (item: CartItem) => Promise<boolean>;
    removeFromCart: (templateId: string) => Promise<boolean>;
    checkout: () => Promise<{ success: boolean; message: string }>;
    refreshCart: () => Promise<void>;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token, isAuthenticated } = useAuth();

    const refreshCart = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${AUTH_URL}/cart`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data.cart || []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCart([]);
        }
    }, [isAuthenticated, token]);

    const addToCart = async (item: CartItem): Promise<boolean> => {
        if (!token) return false;
        setIsLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(item)
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data.cart || []);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (templateId: string): Promise<boolean> => {
        if (!token) return false;
        setIsLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/cart/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data.cart || []);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const checkout = async (): Promise<{ success: boolean; message: string }> => {
        if (!token) return { success: false, message: 'No autenticado' };
        setIsLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                setCart([]);
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Checkout error:', error);
            return { success: false, message: 'Error al procesar la compra' };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartCount: cart.length,
            addToCart,
            removeFromCart,
            checkout,
            refreshCart,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
