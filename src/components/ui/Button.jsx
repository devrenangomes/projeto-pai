import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "rounded-lg text-sm font-medium transition-colors flex items-center gap-2";

    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
        secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
        danger: "text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100",
        ghost: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
        dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
    };

    const padding = variant === 'ghost' ? 'p-1.5' : 'px-4 py-2';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${padding} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
