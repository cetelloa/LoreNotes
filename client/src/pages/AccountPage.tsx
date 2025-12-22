import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';
import { User, Lock, Package, Download, Check, AlertCircle } from 'lucide-react';
import { AUTH_URL, TEMPLATES_URL } from '../config';

interface Purchase {
    templateId: string;
    title: string;
    price: number;
    purchaseDate: string;
}

export const AccountPage = () => {
    const { user, token, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'purchases'>('profile');

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

    // Purchases state
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchasesLoading, setPurchasesLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
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

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'security', label: 'Seguridad', icon: Lock },
        { id: 'purchases', label: 'Mis Plantillas', icon: Package }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading text-ink-black mb-8">
                Mi Cuenta ⚙️
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-heading transition-all ${activeTab === tab.id
                                ? 'bg-primary-craft text-white'
                                : 'bg-white/80 text-ink-black hover:bg-primary-craft/20'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <h2 className="text-2xl font-heading mb-4">Editar Perfil</h2>

                        {profileMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {profileMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {profileMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block font-heading text-ink-black mb-2">Nombre de usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl bg-paper-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-heading text-ink-black mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl bg-paper-white"
                                required
                            />
                        </div>

                        <CraftButton variant="primary" disabled={profileLoading}>
                            {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </CraftButton>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <h2 className="text-2xl font-heading mb-4">Cambiar Contraseña</h2>

                        {passwordMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {passwordMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block font-heading text-ink-black mb-2">Contraseña actual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl bg-paper-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-heading text-ink-black mb-2">Nueva contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl bg-paper-white"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block font-heading text-ink-black mb-2">Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border-2 border-dashed border-ink-black rounded-xl bg-paper-white"
                                required
                            />
                        </div>

                        <CraftButton variant="accent" disabled={passwordLoading}>
                            {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </CraftButton>
                    </form>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                    <div>
                        <h2 className="text-2xl font-heading mb-4">Mis Plantillas Compradas</h2>

                        {purchasesLoading ? (
                            <p className="text-gray-500">Cargando...</p>
                        ) : purchases.length === 0 ? (
                            <div className="text-center py-8">
                                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">Aún no has comprado plantillas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {purchases.map((purchase, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-paper-white rounded-xl border-2 border-dashed border-gray-300">
                                        <div>
                                            <h3 className="font-heading text-lg">{purchase.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                Comprado: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-primary-craft font-bold">${purchase.price?.toFixed(2)}</p>
                                        </div>
                                        <a
                                            href={`${TEMPLATES_URL}/${purchase.templateId}/download`}
                                            className="flex items-center gap-2 bg-accent-craft text-ink-black px-4 py-2 rounded-xl font-heading hover:opacity-80 transition-opacity"
                                        >
                                            <Download size={18} />
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
