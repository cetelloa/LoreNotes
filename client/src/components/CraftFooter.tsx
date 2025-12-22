import { Instagram, Music2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

// Configure your social media links here
const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/lore_notes2/', color: '#E4405F' },
    { name: 'TikTok', icon: Music2, url: 'https://www.tiktok.com/@lore_notes2?lang=es', color: '#00F2EA' },
    { name: 'Email', icon: Mail, url: 'mailto:lorenotes2@gmail.com', color: '#FF6B9D' },
];

export const CraftFooter = () => {
    return (
        <footer className="relative mt-20 bg-ink-black text-paper-white pt-16 pb-8 px-8">
            {/* Washi Tape Decoration Top */}
            <div
                className="absolute -top-6 left-0 right-0 h-8 shadow-sm transform -rotate-1"
                style={{
                    background: `repeating-linear-gradient(
                        45deg,
                        rgba(255, 107, 157, 0.9) 0px,
                        rgba(255, 107, 157, 0.9) 20px,
                        rgba(254, 193, 128, 0.9) 20px,
                        rgba(254, 193, 128, 0.9) 40px
                    )`,
                    clipPath: 'polygon(0% 0%, 100% 2%, 100% 100%, 0% 98%)'
                }}
            />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-heading text-primary-craft">LoreNotes</h3>
                    <p className="font-body text-gray-300">
                        Tu destino mágico para encontrar las mejores plantillas creativas. ¡Haz realidad tus ideas!
                    </p>
                </div>

                {/* Links */}
                <div className="space-y-4">
                    <h3 className="text-xl font-heading text-secondary-craft">Explora</h3>
                    <ul className="space-y-2 font-body text-gray-300">
                        <li className="hover:text-white cursor-pointer transition-colors">Plantillas Nuevas</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Vendedores Top</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Blog Creativo</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Ayuda IA</li>
                    </ul>
                </div>

                {/* Social */}
                <div className="space-y-4">
                    <h3 className="text-xl font-heading text-accent-craft">Síguenos</h3>
                    <p className="font-body text-gray-400 text-sm">
                        ¡Compartimos inspiración diaria en nuestras redes! 🎨
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {socialLinks.map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-gray-500 transition-all"
                                whileHover={{ scale: 1.1, backgroundColor: social.color }}
                                whileTap={{ scale: 0.95 }}
                                title={social.name}
                            >
                                <social.icon size={20} className="text-white" />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-700 text-center font-handwriting text-xl text-gray-500">
                Hecho con <span className="text-red-500 animate-pulse">❤</span> y mucha creatividad.
            </div>
        </footer>
    );
};
