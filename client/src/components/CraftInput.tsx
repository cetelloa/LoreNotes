import React from 'react';

interface CraftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const CraftInput = ({ label, className = '', ...props }: CraftInputProps) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="font-heading font-bold text-ink-black ml-2">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full bg-paper-white bg-opacity-50 border-b-[3px] border-dashed border-ink-black
          px-4 py-3 font-handwriting text-2xl text-ink-black
          placeholder:text-craft-gray placeholder:italic
          focus:outline-none focus:border-primary-craft focus:bg-primary-craft/5
          transition-all duration-300
          ${className}
        `}
                style={{
                    backgroundImage: "url('/textures/paper-lines.png')", // We simulate lines with CSS in real usage or generic text
                    backgroundSize: "100% 40px"
                }}
                {...props}
            />
        </div>
    );
};
