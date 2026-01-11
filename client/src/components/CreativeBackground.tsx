import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingElement {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

export const CreativeBackground = () => {
    const [elements, setElements] = useState<FloatingElement[]>([]);

    useEffect(() => {
        // Generate subtle floating circles
        const generated = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 100 + Math.floor(Math.random() * 200),
            duration: 20 + Math.random() * 30,
            delay: Math.random() * 5,
            opacity: 0.03 + Math.random() * 0.05,
        }));
        setElements(generated);
    }, []);

    const colors = ['#e8e4f0', '#d4e8e0', '#f5e6e8', '#ebe8e2'];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {elements.map((el, index) => (
                <motion.div
                    key={el.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: el.size,
                        height: el.size,
                        backgroundColor: colors[index % colors.length],
                        opacity: el.opacity,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: el.delay,
                    }}
                />
            ))}
        </div>
    );
};
