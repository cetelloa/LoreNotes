import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
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

// Dynamic API URL based on current hostname (for mobile access)
const getApiUrl = () => {
    const hostname = window.location.hostname;
    return `http://${hostname}:4000/api/auth`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Fetch fresh user data from the server
    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getApiUrl()}/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setToken(storedToken);
                localStorage.setItem('user', JSON.stringify(userData));
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
            const response = await fetch(`${getApiUrl()}/login`, {
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

            // Immediately fetch fresh user data after login
            const meResponse = await fetch(`${getApiUrl()}/me`, {
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

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (username: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${getApiUrl()}/register`, {
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

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
