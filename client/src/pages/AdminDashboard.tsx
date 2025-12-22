import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CraftButton } from '../components/CraftButton';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, DollarSign, Tag, Info, Trash2, Edit, BookOpen, Plus, Save } from 'lucide-react';
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
}

export const AdminDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'blog'>('templates');

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

    if (loading) return <div className="text-center text-xl font-heading p-8">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className="space-y-4 md:space-y-6 px-2 md:px-0">
            {/* Header */}
            <motion.div
                className="bg-gradient-to-r from-primary-craft to-secondary-craft p-4 md:p-6 rounded-xl border-4 border-ink-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl md:text-3xl font-heading text-white">Panel Admin 🎨</h1>
                <p className="text-white/80 text-sm">Gestiona plantillas y blog</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-lg font-heading border-2 transition-all flex items-center gap-2
                        ${activeTab === 'templates' ? 'bg-primary-craft text-white border-primary-craft' : 'bg-white border-gray-300'}`}
                >
                    <FileText size={18} /> Plantillas
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-4 py-2 rounded-lg font-heading border-2 transition-all flex items-center gap-2
                        ${activeTab === 'blog' ? 'bg-primary-craft text-white border-primary-craft' : 'bg-white border-gray-300'}`}
                >
                    <BookOpen size={18} /> Blog
                </button>
            </div>

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Upload/Edit Form */}
                    <motion.div className="bg-white/95 p-4 md:p-6 rounded-xl border-4 border-ink-black shadow-lg">
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
                    <motion.div className="bg-white/95 p-4 md:p-6 rounded-xl border-4 border-ink-black shadow-lg">
                        <h2 className="text-lg md:text-xl font-heading mb-4">Plantillas ({templates.length})</h2>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {templates.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay plantillas</p>
                            ) : templates.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-paper-white rounded-lg border-2 border-dashed border-gray-300">
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
                    <motion.div className="bg-white/95 p-4 md:p-6 rounded-xl border-4 border-ink-black shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg md:text-xl font-heading flex items-center gap-2">
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
        </div>
    );
};
