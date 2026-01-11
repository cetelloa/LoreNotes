import { Instagram, Music2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/lore_notes2/' },
    { name: 'TikTok', icon: Music2, url: 'https://www.tiktok.com/@lore_notes2?lang=es' },
    { name: 'Email', icon: Mail, url: 'mailto:lorenotes2@gmail.com' },
];

export const CraftFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-serif italic text-elegant-black mb-4">LoreNotes</h3>
                        <p className="text-elegant-gray text-sm leading-relaxed">
                            Tu destino para encontrar las mejores plantillas creativas. Diseños únicos para cada ocasión.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-medium text-elegant-black uppercase tracking-wider mb-4">Explorar</h4>
                        <ul className="space-y-2">
                            <li><Link to="/templates" className="text-elegant-gray hover:text-elegant-black transition-colors text-sm">Plantillas</Link></li>
                            <li><Link to="/blog" className="text-elegant-gray hover:text-elegant-black transition-colors text-sm">Blog</Link></li>
                            <li><Link to="/terms" className="text-elegant-gray hover:text-elegant-black transition-colors text-sm">Términos y Condiciones</Link></li>
                            <li><Link to="/privacy" className="text-elegant-gray hover:text-elegant-black transition-colors text-sm">Política de Privacidad</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-sm font-medium text-elegant-black uppercase tracking-wider mb-4">Síguenos</h4>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-cream hover:bg-cream-dark transition-colors"
                                    title={social.name}
                                >
                                    <social.icon size={18} className="text-elegant-gray hover:text-elegant-black transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center text-sm text-elegant-light">
                    © {new Date().getFullYear()} LoreNotes. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};
