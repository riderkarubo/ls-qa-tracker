import React from 'react';
import { categoryColors, type CategoryColor } from '@/config/ui';

interface CardProps {
  children: React.ReactNode;
  category?: CategoryColor;
  className?: string;
}

export function Card({ children, category = 'primary', className = '' }: CardProps) {
  const colors = categoryColors[category];

  return (
    <div
      className={`rounded-xl border-2 ${colors.border} p-6 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
