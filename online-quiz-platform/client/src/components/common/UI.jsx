import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-green-500 hover:bg-green-600 text-white shadow-sm',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'hover:bg-slate-100 text-slate-600',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input 
        className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all ${error ? 'border-red-500 focus:ring-red-200' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const Badge = ({ children, variant = 'blue', className = '' }) => {
  const variants = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} border-4 border-slate-100 border-t-green-500 rounded-full animate-spin ${className}`}></div>
  );
};

export const Card = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
      {title && <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
