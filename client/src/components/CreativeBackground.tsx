import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Scissors, Paintbrush, Ruler, Palette, PenTool, Hash, Star, Heart, Sparkles, Flower2, Bookmark, Gift, Crown, Shapes } from 'lucide-react';

interface CraftElement {
    id: number;
    type: 'scissors' | 'brush' | 'ruler' | 'palette' | 'pencil' | 'thread' | 'star' | 'heart' | 'sparkle' | 'flower' | 'bookmark' | 'gift' | 'crown' | 'shapes';
    x: number;
    y: number;
    rotation: number;
    scale: number;
    duration: number;
    size: number;
}

export const CreativeBackground = () => {
    const [elements, setElements] = useState<CraftElement[]>([]);

    useEffect(() => {
        // Generate more random elements with variety
        const types: CraftElement['type'][] = ['scissors', 'brush', 'ruler', 'palette', 'pencil', 'thread', 'star', 'heart', 'sparkle', 'flower', 'bookmark', 'gift', 'crown', 'shapes'];
        const generated = Array.from({ length: 55 }, (_, i) => ({
            id: i,
            type: types[Math.floor(Math.random() * types.length)],
            x: Math.random() * 100,
            y: Math.random() * 100,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 1,
            duration: 10 + Math.random() * 30,
            size: 48 + Math.floor(Math.random() * 48),
        }));
        setElements(generated);
    }, []);

    const getIcon = (type: string, size: number) => {
        switch (type) {
            case 'scissors': return <Scissors size={size} className="text-primary-craft opacity-30" />;
            case 'brush': return <Paintbrush size={size} className="text-secondary-craft opacity-30" />;
            case 'ruler': return <Ruler size={size} className="text-accent-craft opacity-30" />;
            case 'palette': return <Palette size={size} className="text-craft-purple opacity-30" />;
            case 'pencil': return <PenTool size={size} className="text-wood-brown opacity-30" />;
            case 'star': return <Star size={size} className="text-warning-yellow opacity-35" />;
            case 'heart': return <Heart size={size} className="text-primary-craft opacity-30" />;
            case 'sparkle': return <Sparkles size={size} className="text-accent-craft opacity-35" />;
            case 'flower': return <Flower2 size={size} className="text-secondary-craft opacity-30" />;
            case 'bookmark': return <Bookmark size={size} className="text-craft-purple opacity-30" />;
            case 'gift': return <Gift size={size} className="text-primary-craft opacity-35" />;
            case 'crown': return <Crown size={size} className="text-warning-yellow opacity-30" />;
            case 'shapes': return <Shapes size={size} className="text-craft-blue opacity-30" />;
            default: return <Hash size={size} className="text-craft-blue opacity-30" />;
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Glitter/Noise overlay handled by body bg image, here we do floating items */}

            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute"
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        rotate: [el.rotation, el.rotation + 45, el.rotation],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {getIcon(el.type, el.size)}
                </motion.div>
            ))}

            {/* Overlay to blend nicely with paper texture */}
            <div className="absolute inset-0 bg-paper-white opacity-20 mix-blend-overlay" />
        </div>
    );
};
