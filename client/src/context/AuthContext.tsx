import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    emailNotifications?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Import centralized API URL
import { AUTH_URL } from '../config';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    // Reset the inactivity timer
    const resetActivityTimer = useCallback(() => {
        if (!token) return;

        localStorage.setItem('lastActivity', Date.now().toString());

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            console.log('⏰ Session expired due to inactivity');
            logout();
            window.location.href = '/login?expired=true';
        }, SESSION_TIMEOUT);
    }, [token, logout]);

    // Check if session expired on load
    useEffect(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity && token) {
            const elapsed = Date.now() - parseInt(lastActivity);
            if (elapsed > SESSION_TIMEOUT) {
                console.log('⏰ Session expired while away');
                logout();
                return;
            }
        }

        if (token) {
            resetActivityTimer();
        }
    }, [token, resetActivityTimer, logout]);

    // Listen for user activity
    useEffect(() => {
        if (!token) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetActivityTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [token, resetActivityTimer]);

    // Fetch fresh user data from the server
    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${AUTH_URL}/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setToken(storedToken);
                localStorage.setItem('user', JSON.stringify(userData));
                resetActivityTimer();
            } else {
                // Token invalid, clear everything
                logout();
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // On mount, fetch fresh user data instead of using stale localStorage data
        refreshUser();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('lastActivity', Date.now().toString());

            // Immediately fetch fresh user data after login
            const meResponse = await fetch(`${AUTH_URL}/me`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (meResponse.ok) {
                const userData = await meResponse.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            resetActivityTimer();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return true;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            refreshUser,
            isAuthenticated: !!token,
            isLoading,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
