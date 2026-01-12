import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Package, Download, Check, AlertCircle, Bell, Globe, Instagram, Link2, Calendar, ShoppingBag, Camera, Upload, X } from 'lucide-react';
import { AUTH_URL, TEMPLATES_URL } from '../config';

interface Purchase {
    templateId: string;
    title: string;
    price: number;
    purchaseDate: string;
}

const AVATAR_OPTIONS = [
    '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐸', '🦉',
    '🌸', '🌺', '🌻', '🌷', '✨', '🎨', '🎭', '📚'
];

const CATEGORIES = [
    'Notion', 'Canva', 'Illustrator', 'Photoshop', 'Figma', 'PowerPoint', 'Excel', 'Word'
];

const COUNTRIES = [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador',
    'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'Rep. Dominicana', 'Uruguay', 'Venezuela', 'Otro'
];

// Compress image to base64 (max 200KB)
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();

        img.onload = () => {
            const maxSize = 200;
            let { width, height } = img;

            if (width > height) {
                if (width > maxSize) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.src = URL.createObjectURL(file);
    });
};

export const AccountPage = () => {
    const { user, token, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'social' | 'preferences' | 'purchases'>('profile');

    // Camera state
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile state
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [country, setCountry] = useState(user?.country || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Social links state
    const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || '');
    const [tiktok, setTiktok] = useState(user?.socialLinks?.tiktok || '');
    const [portfolio, setPortfolio] = useState(user?.socialLinks?.portfolio || '');
    const [socialLoading, setSocialLoading] = useState(false);
    const [socialMessage, setSocialMessage] = useState({ type: '', text: '' });

    // Preferences state
    const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
    const [favoriteCategories, setFavoriteCategories] = useState<string[]>(user?.favoriteCategories || []);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesMessage, setPreferencesMessage] = useState({ type: '', text: '' });

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
            setFullName(user.fullName || '');
            setBio(user.bio || '');
            setCountry(user.country || '');
            setAvatarUrl(user.avatarUrl || '');
            setInstagram(user.socialLinks?.instagram || '');
            setTiktok(user.socialLinks?.tiktok || '');
            setPortfolio(user.socialLinks?.portfolio || '');
            setEmailNotifications(user.emailNotifications ?? true);
            setFavoriteCategories(user.favoriteCategories || []);
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
                body: JSON.stringify({ username, email, fullName, bio, country, avatarUrl })
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

    const handleUpdateSocial = async (e: React.FormEvent) => {
        e.preventDefault();
        setSocialLoading(true);
        setSocialMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${AUTH_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    socialLinks: { instagram, tiktok, portfolio }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setSocialMessage({ type: 'success', text: '¡Redes sociales actualizadas!' });
                refreshUser();
            } else {
                setSocialMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setSocialMessage({ type: 'error', text: 'Error de conexión' });
        }
        setSocialLoading(false);
    };

    const handleUpdatePreferences = async () => {
        setPreferencesLoading(true);
        setPreferencesMessage({ type: '', text: '' });

        try {
            // Update notifications
            await fetch(`${AUTH_URL}/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ emailNotifications })
            });

            // Update favorite categories
            await fetch(`${AUTH_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ favoriteCategories })
            });

            setPreferencesMessage({ type: 'success', text: '¡Preferencias guardadas!' });
            refreshUser();
        } catch (error) {
            setPreferencesMessage({ type: 'error', text: 'Error de conexión' });
        }
        setPreferencesLoading(false);
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

    const toggleCategory = (cat: string) => {
        if (favoriteCategories.includes(cat)) {
            setFavoriteCategories(favoriteCategories.filter(c => c !== cat));
        } else {
            setFavoriteCategories([...favoriteCategories, cat]);
        }
    };

    // Avatar file upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setProfileMessage({ type: 'error', text: 'Por favor selecciona una imagen' });
            return;
        }

        try {
            const base64 = await compressImage(file);
            setAvatarUrl(base64);
            setProfileMessage({ type: 'success', text: 'Imagen cargada. Guarda para confirmar.' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Error al procesar la imagen' });
        }
    };

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 400, height: 400 }
            });
            setCameraStream(stream);
            setShowCameraModal(true);

            // Wait for modal to render, then set video source
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'No se pudo acceder a la cámara' });
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCameraModal(false);
    };

    // Capture photo from camera
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        // Set canvas size to match video
        canvas.width = 200;
        canvas.height = 200;

        // Draw video frame to canvas (centered crop)
        const size = Math.min(video.videoWidth, video.videoHeight);
        const x = (video.videoWidth - size) / 2;
        const y = (video.videoHeight - size) / 2;

        ctx.drawImage(video, x, y, size, size, 0, 0, 200, 200);

        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setAvatarUrl(base64);

        stopCamera();
        setProfileMessage({ type: 'success', text: 'Foto capturada. Guarda para confirmar.' });
    };

    // Check if avatar is a base64 image
    const isImageAvatar = (url: string) => url?.startsWith('data:image');

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'social', label: 'Redes', icon: Instagram },
        { id: 'preferences', label: 'Preferencias', icon: Bell },
        { id: 'security', label: 'Seguridad', icon: Lock },
        { id: 'purchases', label: 'Plantillas', icon: Package }
    ];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-lavender-soft flex items-center justify-center text-4xl">
                        {avatarUrl || '👤'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-elegant-black">
                            {fullName || user?.username || 'Usuario'}
                        </h1>
                        <p className="text-elegant-gray text-sm">@{user?.username}</p>
                        {bio && <p className="text-elegant-gray text-sm mt-1">{bio}</p>}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-elegant-gray mb-1">
                            <Calendar size={14} />
                        </div>
                        <p className="text-sm font-medium text-elegant-black">Miembro desde</p>
                        <p className="text-xs text-elegant-gray">{formatDate(user?.createdAt)}</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-elegant-gray mb-1">
                            <ShoppingBag size={14} />
                        </div>
                        <p className="text-sm font-medium text-elegant-black">Plantillas</p>
                        <p className="text-xs text-elegant-gray">{user?.purchasedCount || 0} compradas</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-elegant-gray mb-1">
                            <Globe size={14} />
                        </div>
                        <p className="text-sm font-medium text-elegant-black">País</p>
                        <p className="text-xs text-elegant-gray">{country || 'No especificado'}</p>
                    </div>
                </div>
            </div>

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
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <h2 className="text-xl font-serif mb-4">Información Personal</h2>

                        {profileMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {profileMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {profileMessage.text}
                            </div>
                        )}

                        {/* Avatar Selection */}
                        <div>
                            <label className="block text-elegant-gray text-sm mb-3">Tu avatar</label>

                            {/* Current Avatar Preview */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full bg-lavender-soft flex items-center justify-center overflow-hidden">
                                    {isImageAvatar(avatarUrl) ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{avatarUrl || '👤'}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-sm hover:bg-cream-dark transition-colors"
                                    >
                                        <Upload size={16} /> Subir foto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-sm hover:bg-cream-dark transition-colors"
                                    >
                                        <Camera size={16} /> Cámara
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Emoji Options */}
                            <p className="text-xs text-elegant-light mb-2">O elige un emoji:</p>
                            <div className="flex flex-wrap gap-2">
                                {AVATAR_OPTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setAvatarUrl(emoji)}
                                        className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${avatarUrl === emoji
                                            ? 'bg-elegant-black text-white scale-110'
                                            : 'bg-cream hover:bg-cream-dark'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-elegant-gray text-sm mb-2">Nombre completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-elegant-gray text-sm mb-2">Usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Biografía <span className="text-elegant-light">(máx. 200 caracteres)</span></label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20 resize-none"
                                rows={3}
                                placeholder="Cuéntanos sobre ti..."
                            />
                            <p className="text-xs text-elegant-light mt-1">{bio.length}/200</p>
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">País</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                            >
                                <option value="">Selecciona tu país</option>
                                {COUNTRIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {profileLoading ? 'Guardando...' : 'Guardar Perfil'}
                        </button>
                    </form>
                )}

                {/* Social Links Tab */}
                {activeTab === 'social' && (
                    <form onSubmit={handleUpdateSocial} className="space-y-5">
                        <h2 className="text-xl font-serif mb-4">Redes Sociales</h2>

                        {socialMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${socialMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {socialMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {socialMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2 flex items-center gap-2">
                                <Instagram size={16} /> Instagram
                            </label>
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                placeholder="@tuusuario"
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2 flex items-center gap-2">
                                🎵 TikTok
                            </label>
                            <input
                                type="text"
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                placeholder="@tuusuario"
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2 flex items-center gap-2">
                                <Link2 size={16} /> Portfolio / Sitio Web
                            </label>
                            <input
                                type="url"
                                value={portfolio}
                                onChange={(e) => setPortfolio(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                placeholder="https://tusitio.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={socialLoading}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {socialLoading ? 'Guardando...' : 'Guardar Redes'}
                        </button>
                    </form>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif mb-4">Preferencias</h2>

                        {preferencesMessage.text && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${preferencesMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {preferencesMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {preferencesMessage.text}
                            </div>
                        )}

                        {/* Email Notifications */}
                        <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
                            <div>
                                <h3 className="font-medium text-elegant-black">Notificaciones por email</h3>
                                <p className="text-sm text-elegant-gray">Recibir emails cuando hay nuevos posts en el blog</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative w-14 h-7 rounded-full transition-colors ${emailNotifications ? 'bg-elegant-black' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'left-8' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        {/* Favorite Categories */}
                        <div>
                            <h3 className="font-medium text-elegant-black mb-3">Categorías favoritas</h3>
                            <p className="text-sm text-elegant-gray mb-3">Selecciona las categorías que más te interesan</p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${favoriteCategories.includes(cat)
                                            ? 'bg-elegant-black text-white'
                                            : 'bg-cream text-elegant-gray hover:bg-cream-dark'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleUpdatePreferences}
                            disabled={preferencesLoading}
                            className="bg-elegant-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {preferencesLoading ? 'Guardando...' : 'Guardar Preferencias'}
                        </button>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <h2 className="text-xl font-serif mb-4">Cambiar Contraseña</h2>

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
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-elegant-gray text-sm mb-2">Nueva contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
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
                                className="w-full p-3 bg-cream rounded-xl text-elegant-black focus:outline-none focus:ring-2 focus:ring-elegant-black/20"
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

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                    <div>
                        <h2 className="text-xl font-serif mb-4">Mis Plantillas Compradas</h2>

                        {purchasesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-elegant-black border-t-transparent rounded-full"></div>
                            </div>
                        ) : purchases.length === 0 ? (
                            <div className="text-center py-12">
                                <Package size={48} className="mx-auto text-elegant-light mb-4" />
                                <p className="text-elegant-gray">Aún no has comprado plantillas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {purchases.map((purchase, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                                        <div>
                                            <h3 className="font-medium text-elegant-black">{purchase.title}</h3>
                                            <p className="text-sm text-elegant-gray">
                                                {new Date(purchase.purchaseDate).toLocaleDateString()} • ${purchase.price?.toFixed(2)}
                                            </p>
                                        </div>
                                        <a
                                            href={`${TEMPLATES_URL}/${purchase.templateId}/download`}
                                            className="flex items-center gap-2 bg-elegant-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            <Download size={14} />
                                            Descargar
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Camera Modal */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-serif">Tomar foto</h3>
                            <button onClick={stopCamera} className="p-2 hover:bg-cream rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="aspect-square bg-black rounded-xl overflow-hidden mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <button
                            onClick={capturePhoto}
                            className="w-full bg-elegant-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Camera size={18} /> Capturar
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
