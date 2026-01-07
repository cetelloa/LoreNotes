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
        const generated = Array.from({ length: 35 }, (_, i) => ({
            id: i,
            type: types[Math.floor(Math.random() * types.length)],
            x: Math.random() * 100,
            y: Math.random() * 100,
            rotation: Math.random() * 360,
            scale: 0.4 + Math.random() * 0.8,
            duration: 12 + Math.random() * 25,
            size: 32 + Math.floor(Math.random() * 40),
        }));
        setElements(generated);
    }, []);

    const getIcon = (type: string, size: number) => {
        const iconProps = { size, className: "opacity-15" };
        switch (type) {
            case 'scissors': return <Scissors {...iconProps} className="text-primary-craft opacity-15" />;
            case 'brush': return <Paintbrush {...iconProps} className="text-secondary-craft opacity-15" />;
            case 'ruler': return <Ruler {...iconProps} className="text-accent-craft opacity-15" />;
            case 'palette': return <Palette {...iconProps} className="text-craft-purple opacity-15" />;
            case 'pencil': return <PenTool {...iconProps} className="text-wood-brown opacity-15" />;
            case 'star': return <Star {...iconProps} className="text-warning-yellow opacity-20" />;
            case 'heart': return <Heart {...iconProps} className="text-primary-craft opacity-15" />;
            case 'sparkle': return <Sparkles {...iconProps} className="text-accent-craft opacity-20" />;
            case 'flower': return <Flower2 {...iconProps} className="text-secondary-craft opacity-15" />;
            case 'bookmark': return <Bookmark {...iconProps} className="text-craft-purple opacity-15" />;
            case 'gift': return <Gift {...iconProps} className="text-primary-craft opacity-20" />;
            case 'crown': return <Crown {...iconProps} className="text-warning-yellow opacity-15" />;
            case 'shapes': return <Shapes {...iconProps} className="text-craft-blue opacity-15" />;
            default: return <Hash {...iconProps} className="text-craft-blue opacity-15" />;
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
