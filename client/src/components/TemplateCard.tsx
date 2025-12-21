import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { CraftButton } from './CraftButton';

interface TemplateCardProps {
    title: string;
    author: string;
    price: number;
    image?: string;
    rating: number;
}

export const TemplateCard = ({ title, author, price, rating }: TemplateCardProps) => {
    return (
        <motion.div
            className="relative bg-white border-4 border-ink-black rounded-xl p-4 flex flex-col gap-3"
            style={{
                boxShadow: '8px 8px 0px rgba(255, 107, 157, 0.3)',
            }}
            whileHover={{ y: -10, rotate: 1, boxShadow: '12px 12px 0px rgba(255, 107, 157, 0.4)' }}
        >
            {/* Washi Tape Decor */}
            <div
                className="absolute -top-3 -right-8 w-24 h-8 bg-primary-craft opacity-80 rotate-12 shadow-sm rounded-sm"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' }}
            />

            {/* Image Placeholder */}
            <div className="bg-gray-100 rounded-lg h-48 w-full border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                <span className="font-handwriting text-gray-400 text-3xl">Foto Plantilla</span>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="bg-white p-2 rounded-full hover:scale-110 transition-transform shadow-md">
                        <Heart className="text-primary-craft" />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold leading-tight">{title}</h3>
                <p className="text-sm text-gray-500 font-body">por <span className="font-bold text-secondary-craft">{author}</span></p>
            </div>

            <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < rating ? "fill-warning-yellow text-warning-yellow" : "text-gray-300"} />
                ))}
            </div>

            <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-2xl font-bold text-ink-black">${price}</span>
                <CraftButton className="!py-2 !px-4 !text-sm">Ver</CraftButton>
            </div>
        </motion.div>
    );
};
