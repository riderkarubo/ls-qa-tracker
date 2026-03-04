import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-bold transition-all';
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700',
    accent: 'bg-indigo-600 text-white shadow-md hover:shadow-lg hover:bg-indigo-700',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
