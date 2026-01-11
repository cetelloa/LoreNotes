import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Package, Download, Check, AlertCircle, Bell } from 'lucide-react';
import { AUTH_URL, TEMPLATES_URL } from '../config';

interface Purchase {
    templateId: string;
    title: string;
    price: number;
    purchaseDate: string;
}

export const AccountPage = () => {
    const { user, token, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'purchases'>('profile');

    // Profile state
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState({ type: '', text: '' });

    // Purchases state
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchasesLoading, setPurchasesLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setEmailNotifications(user.emailNotifications ?? true);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'purchases') {
            fetchPurchases();
        }
    }, [activeTab]);

    const fetchPurchases = async () => {
        setPurchasesLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/purchases`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPurchases(data.purchases || []);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
        setPurchasesLoading(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${AUTH_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();

            if (response.ok) {
                setProfileMessage({ type: 'success', text: '¡Perfil actualizado!' });
                refreshUser();
            } else {
                setProfileMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Error de conexión' });
        }
        setProfileLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await fetch(`${AUTH_URL}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordMessage({ type: 'success', text: '¡Contraseña actualizada!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'Error de conexión' });
        }
        setPasswordLoading(false);
    };

    const handleUpdateNotifications = async (newValue: boolean) => {
        setNotificationLoading(true);
        setEmailNotifications(newValue);
        setNotificationMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${AUTH_URL}/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ emailNotifications: newValue })
            });

            const data = await response.json();

            if (response.ok) {
                setNotificationMessage({ type: 'success', text: 'Preferencias actualizadas' });
            } else {
                setEmailNotifications(!newValue); // Revert on error
                setNotificationMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setEmailNotifications(!newValue);
            setNotificationMessage({ type: 'error', text: 'Error de conexión' });
        }
        setNotificationLoading(false);
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'security', label: 'Seguridad', icon: Lock },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'purchases', label: 'Mis Plantillas', icon: Package }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-serif text-elegant-black mb-8">
                Mi Cuenta
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-elegant-black text-white'
                                : 'bg-cream text-elegant-gray hover:bg-cream-dark'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
            >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <h2 className="text-2xl font-serif mb-4">Editar Perfil</h2>

                        {profileMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {profileMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {profileMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Nombre de usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <h2 className="text-2xl font-serif mb-4">Cambiar Contraseña</h2>

                        {passwordMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Contraseña actual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Nueva contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-4 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif mb-4">Notificaciones</h2>

                        {notificationMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${notificationMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {notificationMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {notificationMessage.text}
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
                            <div>
                                <h3 className="font-medium text-elegant-black">Nuevos posts del blog</h3>
                                <p className="text-sm text-elegant-gray">
                                    Recibe un email cuando publiquemos un nuevo post en el blog
                                </p>
                            </div>
                            <button
                                onClick={() => handleUpdateNotifications(!emailNotifications)}
                                disabled={notificationLoading}
                                className={`relative w-14 h-7 rounded-full transition-colors ${emailNotifications ? 'bg-elegant-black' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'left-8' : 'left-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                    <div>
                        <h2 className="text-2xl font-serif mb-4">Mis Plantillas</h2>

                        {purchasesLoading ? (
                            <p className="text-elegant-gray">Cargando...</p>
                        ) : purchases.length === 0 ? (
                            <div className="text-center py-12">
                                <Package size={48} className="mx-auto text-elegant-light mb-4" />
                                <p className="text-elegant-gray">Aún no has comprado plantillas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {purchases.map((purchase, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                                        <div>
                                            <h3 className="font-medium text-elegant-black">{purchase.title}</h3>
                                            <p className="text-sm text-elegant-gray">
                                                Comprado: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-elegant-black font-medium">${purchase.price?.toFixed(2)}</p>
                                        </div>
                                        <a
                                            href={`${TEMPLATES_URL}/${purchase.templateId}/download`}
                                            className="flex items-center gap-2 bg-elegant-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            <Download size={16} />
                                            Descargar
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
