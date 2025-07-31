import React from 'react';
import { cn } from '../../lib/utils';

interface ClayCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'green' | 'pink' | 'orange';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

/**
 * 粘土拟态风格的卡片组件
 */
export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  variant = 'default',
  className,
  padding = 'md',
  hover = false,
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
      border: 'border-slate-200',
      shadow: 'shadow-[8px_8px_20px_rgba(148,163,184,0.2),-8px_-8px_20px_rgba(255,255,255,0.8)]',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      shadow: 'shadow-[8px_8px_20px_rgba(139,92,246,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      shadow: 'shadow-[8px_8px_20px_rgba(52,211,153,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      border: 'border-pink-200',
      shadow: 'shadow-[8px_8px_20px_rgba(244,114,182,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-200',
      shadow: 'shadow-[8px_8px_20px_rgba(251,113,133,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={cn(
        // 基础样式
        'rounded-3xl border-2 transition-all duration-300 ease-out',
        'transform-gpu will-change-transform',
        // 变体样式
        currentVariant.bg,
        currentVariant.border,
        currentVariant.shadow,
        // 内边距
        paddingStyles[padding],
        // 悬停效果
        hover && [
          'hover:scale-[1.02]',
          'hover:shadow-[12px_12px_24px_rgba(148,163,184,0.25),-12px_-12px_24px_rgba(255,255,255,0.9)]',
          'cursor-pointer',
        ],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * 卡片标题组件
 */
export const ClayCardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-slate-800 mb-3',
        className
      )}
    >
      {children}
    </h3>
  );
};

/**
 * 卡片内容组件
 */
export const ClayCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn('text-slate-600', className)}>
      {children}
    </div>
  );
};