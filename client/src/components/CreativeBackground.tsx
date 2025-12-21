import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Scissors, Paintbrush, Ruler, Palette, PenTool, Hash } from 'lucide-react';

interface CraftElement {
    id: number;
    type: 'scissors' | 'brush' | 'ruler' | 'palette' | 'pencil' | 'thread';
    x: number;
    y: number;
    rotation: number;
    scale: number;
    duration: number;
}

export const CreativeBackground = () => {
    const [elements, setElements] = useState<CraftElement[]>([]);

    useEffect(() => {
        // Generate random elements
        const generated = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            type: ['scissors', 'brush', 'ruler', 'palette', 'pencil', 'thread'][
                Math.floor(Math.random() * 6)
            ] as CraftElement['type'],
            x: Math.random() * 100,
            y: Math.random() * 100,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
            duration: 15 + Math.random() * 20,
        }));
        setElements(generated);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'scissors': return <Scissors className="text-primary-craft opacity-20" size={48} />;
            case 'brush': return <Paintbrush className="text-secondary-craft opacity-20" size={48} />;
            case 'ruler': return <Ruler className="text-accent-craft opacity-20" size={48} />;
            case 'palette': return <Palette className="text-craft-purple opacity-20" size={48} />;
            case 'pencil': return <PenTool className="text-wood-brown opacity-20" size={48} />;
            default: return <Hash className="text-craft-blue opacity-20" size={48} />;
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
                    {getIcon(el.type)}
                </motion.div>
            ))}

            {/* Overlay to blend nicely with paper texture */}
            <div className="absolute inset-0 bg-paper-white opacity-20 mix-blend-overlay" />
        </div>
    );
};
