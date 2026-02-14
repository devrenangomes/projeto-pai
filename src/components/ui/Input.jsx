import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
