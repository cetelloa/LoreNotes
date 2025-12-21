import { motion } from 'framer-motion';
import React from 'react';

interface CraftButtonProps {
    variant?: 'primary' | 'secondary' | 'accent';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const CraftButton = ({ variant = 'primary', children, className = '', onClick, disabled = false }: CraftButtonProps) => {
    const gradients = {
        primary: 'linear-gradient(135deg, #FF6B9D 0%, #FEC180 100%)',
        secondary: 'linear-gradient(135deg, #A8E6CF 0%, #84C7D0 100%)',
        accent: 'linear-gradient(135deg, #C9A0DC 0%, #FF6B9D 100%)',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative px-6 py-3 font-heading font-bold text-ink-black text-lg
                border-[3px] border-dashed border-ink-black rounded-2xl
                overflow-hidden cursor-pointer
                ${className}
            `}
            style={{
                background: gradients[variant],
                boxShadow: '4px 4px 0px #2D3142',
            }}
            whileHover={{
                scale: 1.05,
                rotate: 1,
                boxShadow: '6px 6px 0px #2D3142'
            }}
            whileTap={{
                scale: 0.95,
                rotate: -1,
                boxShadow: '2px 2px 0px #2D3142'
            }}
        >
            {/* Paper texture overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
            />

            {/* Content relative for z-index */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};
