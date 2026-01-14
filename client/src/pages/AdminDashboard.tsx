import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, DollarSign, Tag, Info, Trash2, Edit, BookOpen, Plus, Save, BarChart3, Users, Calendar, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { TEMPLATES_URL, AUTH_URL, BLOG_URL } from '../config';

interface Template {
    id: string;
    title: string;
    description: string;
    purpose: string;
    price: number;
    category: string;
    imageFileId: string;
    tutorialVideoUrl?: string;
    createdAt: string;
}

interface BlogPost {
    _id?: string;
    title: string;
    content: string;
    author: string;
    createdAt?: string;
    isPublished: boolean;
    videoUrl?: string;
}

interface Sale {
    id: string;
    buyer: { username: string; email: string };
    templateId: string;
    title: string;
    price: number;
    purchaseDate: string;
    paypalOrderId?: string;
}

interface Coupon {
    _id: string;
    code: string;
    discountPercent: number;
    maxUses: number | null;
    currentUses: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}

export const AdminDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'blog' | 'sales' | 'coupons'>('templates');

    // Templates state
    const [templates, setTemplates] = useState<Template[]>([]);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // Blog state
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
    const [blogSuccess, setBlogSuccess] = useState('');
    const [blogError, setBlogError] = useState('');

    // Sales state
    const [sales, setSales] = useState<Sale[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    // Coupons state
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponDiscount, setNewCouponDiscount] = useState('');
    const [newCouponMaxUses, setNewCouponMaxUses] = useState('');
    const [newCouponExpires, setNewCouponExpires] = useState('');

    // Template Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [purpose, setPurpose] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [tutorialVideoUrl, setTutorialVideoUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkAdminStatus();
        fetchTemplates();
        fetchBlogPosts();
        fetchSales();
    }, [token]);

    const checkAdminStatus = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            const res = await fetch(`${AUTH_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.role === 'admin') setIsAdmin(true);
            else navigate('/');
        } catch { navigate('/login'); }
        setLoading(false);
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch(TEMPLATES_URL);
            const data = await res.json();
            setTemplates(data);
        } catch (err) { console.error('Error fetching templates:', err); }
    };

    const fetchBlogPosts = async () => {
        try {
            const res = await fetch(BLOG_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBlogPosts(data);
            }
        } catch (err) { console.error('Error fetching blog posts:', err); }
    };

    const fetchSales = async () => {
        try {
            const res = await fetch(`${AUTH_URL}/admin/sales`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSales(data.sales || []);
                setTotalRevenue(data.totalRevenue || 0);
            }
        } catch (err) { console.error('Fetch sales error:', err); }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${AUTH_URL}/admin/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (err) { console.error('Fetch coupons error:', err); }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${AUTH_URL}/admin/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: newCouponCode,
                    discountPercent: parseInt(newCouponDiscount),
                    maxUses: newCouponMaxUses ? parseInt(newCouponMaxUses) : null,
                    expiresAt: newCouponExpires || null
                })
            });
            if (res.ok) {
                setNewCouponCode('');
                setNewCouponDiscount('');
                setNewCouponMaxUses('');
                setNewCouponExpires('');
                fetchCoupons();
            }
        } catch (err) { console.error('Create coupon error:', err); }
    };

    const handleToggleCoupon = async (id: string) => {
        try {
            await fetch(`${AUTH_URL}/admin/coupons/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCoupons();
        } catch (err) { console.error('Toggle coupon error:', err); }
    };

    const handleDeleteCoupon = async (id: string) => {
        try {
            await fetch(`${AUTH_URL}/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCoupons();
        } catch (err) { console.error('Delete coupon error:', err); }
    };

    const resetTemplateForm = () => {
        setTitle(''); setDescription(''); setPurpose('');
        setPrice(''); setCategory(''); setTutorialVideoUrl('');
        setImageFile(null); setTemplateFile(null);
        setEditingTemplate(null);
    };

    const handleSubmitTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError(''); setUploadSuccess('');

        const isEditing = !!editingTemplate;

        if (!isEditing && (!imageFile || !templateFile)) {
            setUploadError('Debes subir una imagen y un archivo de plantilla');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('purpose', purpose);
        formData.append('price', price);
        formData.append('author', user?.username || 'Admin');
        formData.append('category', category);
        if (tutorialVideoUrl) formData.append('tutorialVideoUrl', tutorialVideoUrl);
        if (imageFile) formData.append('image', imageFile);
        if (templateFile) formData.append('templateFile', templateFile);

        try {
            const url = isEditing ? `${TEMPLATES_URL}/${editingTemplate.id}` : TEMPLATES_URL;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: formData });

            if (res.ok) {
                setUploadSuccess(isEditing ? '¡Plantilla actualizada!' : '¡Plantilla subida!');
                resetTemplateForm();
                fetchTemplates();
            } else {
                const data = await res.json();
                setUploadError(data.error || 'Error al procesar plantilla');
            }
        } catch { setUploadError('Error de conexión'); }
        setUploading(false);
    };

    const handleEditTemplate = (template: Template) => {
        setEditingTemplate(template);
        setTitle(template.title);
        setDescription(template.description || '');
        setPurpose(template.purpose || '');
        setPrice(template.price?.toString() || '');
        setCategory(template.category || '');
        setTutorialVideoUrl(template.tutorialVideoUrl || '');
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('¿Eliminar esta plantilla?')) return;
        try {
            await fetch(`${TEMPLATES_URL}/${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (err) { console.error('Delete error:', err); }
    };

    // Blog functions
    const handleSaveBlogPost = async () => {
        if (!editingBlog) return;
        setBlogError(''); setBlogSuccess('');

        try {
            const isNew = !editingBlog._id;
            const url = isNew ? BLOG_URL : `${BLOG_URL}/${editingBlog._id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingBlog)
            });

            if (res.ok) {
                setBlogSuccess(isNew ? '¡Post creado!' : '¡Post actualizado!');
                setEditingBlog(null);
                fetchBlogPosts();
            } else {
                setBlogError('Error al guardar post');
            }
        } catch { setBlogError('Error de conexión'); }
    };

    const handleDeleteBlogPost = async (id: string) => {
        if (!confirm('¿Eliminar este post?')) return;
        try {
            await fetch(`${BLOG_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchBlogPosts();
        } catch (err) { console.error('Delete blog error:', err); }
    };

    if (loading) return <div className="text-center text-xl font-serif p-8 text-elegant-gray">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className="space-y-4 md:space-y-6 px-4 md:px-0 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-serif text-elegant-black">Panel Admin</h1>
                <p className="text-elegant-gray">Gestiona plantillas y blog</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2
                        ${activeTab === 'templates' ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                >
                    <FileText size={16} /> Plantillas
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2
                        ${activeTab === 'blog' ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                >
                    <BookOpen size={16} /> Blog
                </button>
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2
                        ${activeTab === 'sales' ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                >
                    <BarChart3 size={16} /> Ventas
                </button>
                <button
                    onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
                    className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2
                        ${activeTab === 'coupons' ? 'bg-elegant-black text-white' : 'bg-cream text-elegant-gray hover:bg-cream-dark'}`}
                >
                    <Ticket size={16} /> Cupones
                </button>
            </div>

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Upload/Edit Form */}
                    <motion.div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                        <h2 className="text-lg md:text-xl font-heading mb-4 flex items-center gap-2">
                            {editingTemplate ? <><Edit size={20} /> Editar Plantilla</> : <><Upload size={20} /> Nueva Plantilla</>}
                        </h2>

                        {uploadSuccess && <div className="bg-green-100 border-2 border-green-400 text-green-700 p-2 rounded-lg mb-3 text-sm">{uploadSuccess}</div>}
                        {uploadError && <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded-lg mb-3 text-sm">{uploadError}</div>}

                        <form onSubmit={handleSubmitTemplate} className="space-y-3">
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm"><FileText size={14} /> Título</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" placeholder="Nombre" required />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm"><Info size={14} /> Descripción</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" rows={2} />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm"><Tag size={14} /> Propósito</label>
                                <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" placeholder="Ej: Invitaciones de boda" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="flex items-center gap-1 font-heading mb-1 text-xs"><DollarSign size={12} /> Precio</label>
                                    <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                                        className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" required />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 font-heading mb-1 text-xs"><Tag size={12} /> Categoría</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm">
                                        <option value="">Seleccionar</option>
                                        <option value="bodas">Bodas</option>
                                        <option value="cumpleanos">Cumpleaños</option>
                                        <option value="negocios">Negocios</option>
                                        <option value="educacion">Educación</option>
                                        <option value="otros">Otros</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm">📹 Video Tutorial (opcional)</label>
                                <input type="url" value={tutorialVideoUrl} onChange={(e) => setTutorialVideoUrl(e.target.value)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm"
                                    placeholder="URL de TikTok o Instagram" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm"><Image size={14} /> Imagen {editingTemplate && '(opcional)'}</label>
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 font-heading mb-1 text-sm"><FileText size={14} /> Archivo {editingTemplate && '(opcional)'}</label>
                                <input type="file" accept=".pdf,.docx,.pptx,.xlsx" onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                                    className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <CraftButton variant="primary" className="flex-1 justify-center" disabled={uploading}>
                                    {uploading ? 'Guardando...' : editingTemplate ? 'Actualizar' : 'Subir'}
                                </CraftButton>
                                {editingTemplate && (
                                    <button type="button" onClick={resetTemplateForm} className="px-4 py-2 bg-gray-200 rounded-lg">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Templates List */}
                    <motion.div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                        <h2 className="text-lg md:text-xl font-serif mb-4">Plantillas ({templates.length})</h2>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {templates.length === 0 ? (
                                <p className="text-elegant-gray text-center py-8">No hay plantillas</p>
                            ) : templates.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-cream rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading font-bold text-sm truncate">{t.title}</h3>
                                        <p className="text-xs text-gray-500">{t.category} • ${t.price?.toFixed(2)}</p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => handleEditTemplate(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Blog Tab */}
            {activeTab === 'blog' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Blog Editor */}
                    <motion.div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg md:text-xl font-serif flex items-center gap-2">
                                {editingBlog?._id ? <><Edit size={20} /> Editar Post</> : <><Plus size={20} /> Nuevo Post</>}
                            </h2>
                            {!editingBlog && (
                                <button onClick={() => setEditingBlog({ title: '', content: '', author: user?.username || 'Admin', isPublished: false })}
                                    className="px-3 py-1 bg-accent-craft rounded-lg text-sm font-heading flex items-center gap-1">
                                    <Plus size={16} /> Crear
                                </button>
                            )}
                        </div>

                        {blogSuccess && <div className="bg-green-100 border-2 border-green-400 text-green-700 p-2 rounded-lg mb-3 text-sm">{blogSuccess}</div>}
                        {blogError && <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded-lg mb-3 text-sm">{blogError}</div>}

                        {editingBlog ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="font-heading text-sm mb-1 block">Título</label>
                                    <input type="text" value={editingBlog.title}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                        className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="font-heading text-sm mb-1 block">Contenido</label>
                                    <textarea value={editingBlog.content}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                        className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" rows={8} />
                                </div>
                                <div>
                                    <label className="font-heading text-sm mb-1 block">URL de Video (YouTube/TikTok)</label>
                                    <input type="url" value={editingBlog.videoUrl || ''}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, videoUrl: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=... o TikTok URL"
                                        className="w-full p-2 border-2 border-dashed border-ink-black rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={editingBlog.isPublished}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, isPublished: e.target.checked })} />
                                    <label className="text-sm">Publicado</label>
                                </div>
                                <div className="flex gap-2">
                                    <CraftButton variant="primary" onClick={handleSaveBlogPost} className="flex-1 justify-center">
                                        <Save size={16} /> Guardar
                                    </CraftButton>
                                    <button onClick={() => setEditingBlog(null)} className="px-4 py-2 bg-gray-200 rounded-lg">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Selecciona un post para editar o crea uno nuevo</p>
                        )}
                    </motion.div>

                    {/* Blog Posts List */}
                    <motion.div className="bg-white/95 p-4 md:p-6 rounded-xl border-4 border-ink-black shadow-lg">
                        <h2 className="text-lg md:text-xl font-heading mb-4">Posts del Blog ({blogPosts.length})</h2>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {blogPosts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay posts de blog</p>
                            ) : blogPosts.map((post) => (
                                <div key={post._id} className="flex items-center justify-between p-3 bg-paper-white rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading font-bold text-sm truncate">{post.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {post.isPublished ? '✅ Publicado' : '📝 Borrador'} • {post.author}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => setEditingBlog(post)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteBlogPost(post._id!)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="text-green-500" size={24} />
                                <span className="text-elegant-gray">Ingresos Totales</span>
                            </div>
                            <p className="text-3xl font-bold text-elegant-black">${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="text-blue-500" size={24} />
                                <span className="text-elegant-gray">Ventas Totales</span>
                            </div>
                            <p className="text-3xl font-bold text-elegant-black">{sales.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="text-purple-500" size={24} />
                                <span className="text-elegant-gray">Ticket Promedio</span>
                            </div>
                            <p className="text-3xl font-bold text-elegant-black">
                                ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                            <Calendar size={20} /> Historial de Ventas
                        </h2>

                        {sales.length === 0 ? (
                            <p className="text-elegant-gray text-center py-8">No hay ventas registradas.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-cream">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Fecha</th>
                                            <th className="text-left p-3 font-medium">Comprador</th>
                                            <th className="text-left p-3 font-medium">Plantilla</th>
                                            <th className="text-right p-3 font-medium">Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map((sale) => (
                                            <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3">
                                                    {new Date(sale.purchaseDate).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{sale.buyer.username}</p>
                                                        <p className="text-xs text-gray-500">{sale.buyer.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3">{sale.title}</td>
                                                <td className="p-3 text-right font-medium text-green-600">
                                                    ${sale.price?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Create Coupon Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                            <Plus size={20} /> Crear Cupón
                        </h2>
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Código</label>
                                <input
                                    type="text"
                                    value={newCouponCode}
                                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Ej: DESCUENTO20"
                                    className="w-full px-4 py-2 bg-cream rounded-lg border-none focus:ring-2 focus:ring-elegant-black/20 uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                                <input
                                    type="number"
                                    value={newCouponDiscount}
                                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                                    placeholder="Ej: 20"
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-2 bg-cream rounded-lg border-none focus:ring-2 focus:ring-elegant-black/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Usos máximos (opcional)</label>
                                <input
                                    type="number"
                                    value={newCouponMaxUses}
                                    onChange={(e) => setNewCouponMaxUses(e.target.value)}
                                    placeholder="Dejar vacío = ilimitado"
                                    min="1"
                                    className="w-full px-4 py-2 bg-cream rounded-lg border-none focus:ring-2 focus:ring-elegant-black/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expira (opcional)</label>
                                <input
                                    type="date"
                                    value={newCouponExpires}
                                    onChange={(e) => setNewCouponExpires(e.target.value)}
                                    className="w-full px-4 py-2 bg-cream rounded-lg border-none focus:ring-2 focus:ring-elegant-black/20"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-elegant-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Crear Cupón
                            </button>
                        </form>
                    </div>

                    {/* Coupons List */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                            <Ticket size={20} /> Cupones ({coupons.length})
                        </h2>

                        {coupons.length === 0 ? (
                            <p className="text-elegant-gray text-center py-8">No hay cupones creados.</p>
                        ) : (
                            <div className="space-y-3">
                                {coupons.map((coupon) => (
                                    <div key={coupon._id} className={`p-4 rounded-xl border-2 ${coupon.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono font-bold text-lg">{coupon.code}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                                {coupon.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-elegant-gray mb-3">
                                            <span>{coupon.discountPercent}% descuento</span>
                                            <span>{coupon.currentUses}/{coupon.maxUses || '∞'} usos</span>
                                            {coupon.expiresAt && (
                                                <span>Expira: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleCoupon(coupon._id)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${coupon.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                            >
                                                {coupon.isActive ? <><ToggleRight size={16} /> Desactivar</> : <><ToggleLeft size={16} /> Activar</>}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon._id)}
                                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
