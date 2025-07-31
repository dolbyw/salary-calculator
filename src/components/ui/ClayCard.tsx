import React from 'react';
import { cn } from '../../lib/utils';
import { useTouchDevice, useHapticFeedback } from '../../hooks/useTouchDevice';
import { useTheme } from '../../hooks/useTheme';

interface ClayCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'green' | 'pink' | 'orange' | 'gray';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  hapticFeedback?: boolean;
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
  onClick,
  hapticFeedback = true,
}) => {
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { triggerHaptic } = useHapticFeedback();
  const { isDark } = useTheme();

  const handleClick = () => {
    if (!onClick) return;
    
    // 触觉反馈
    if (hapticFeedback && isTouchDevice) {
      triggerHaptic('light');
    }
    
    onClick();
  };

  const isClickable = !!onClick || hover;
  const variantStyles = {
    default: {
      bg: isDark 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100',
      border: isDark ? 'border-gray-600' : 'border-slate-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(55,65,81,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(148,163,184,0.2),-8px_-8px_20px_rgba(255,255,255,0.8)]',
    },
    purple: {
      bg: isDark 
        ? 'bg-gradient-to-br from-purple-800 to-purple-900' 
        : 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: isDark ? 'border-purple-600' : 'border-purple-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(88,28,135,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(139,92,246,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    green: {
      bg: isDark 
        ? 'bg-gradient-to-br from-emerald-800 to-emerald-900' 
        : 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      border: isDark ? 'border-emerald-600' : 'border-emerald-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(6,78,59,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(52,211,153,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    pink: {
      bg: isDark 
        ? 'bg-gradient-to-br from-pink-800 to-pink-900' 
        : 'bg-gradient-to-br from-pink-50 to-pink-100',
      border: isDark ? 'border-pink-600' : 'border-pink-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(131,24,67,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(244,114,182,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    orange: {
      bg: isDark 
        ? 'bg-gradient-to-br from-orange-800 to-orange-900' 
        : 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: isDark ? 'border-orange-600' : 'border-orange-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(154,52,18,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(251,113,133,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    gray: {
      bg: isDark 
        ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100',
      border: isDark ? 'border-gray-600' : 'border-gray-200',
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(55,65,81,0.3)]' 
        : 'shadow-[8px_8px_20px_rgba(107,114,128,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
  };

  const paddingStyles = {
    sm: isTouchDevice 
      ? (isMobile ? 'p-5' : 'p-4') 
      : 'p-4',
    md: isTouchDevice 
      ? (isMobile ? 'p-7' : 'p-6') 
      : 'p-6',
    lg: isTouchDevice 
      ? (isMobile ? 'p-9' : 'p-8') 
      : 'p-8',
  };

  const currentVariant = variantStyles[variant];

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      onClick={handleClick}
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
        // 可点击样式
        isClickable && [
          'cursor-pointer',
          // 触屏设备优化
          isTouchDevice ? [
            'touch-manipulation',
            'select-none',
            'active:scale-95',
            'active:brightness-110',
            // 触屏设备的悬停效果（通过触摸实现）
            'focus:scale-[1.02]',
            isDark 
              ? 'focus:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(55,65,81,0.4)]' 
              : 'focus:shadow-[12px_12px_24px_rgba(148,163,184,0.25),-12px_-12px_24px_rgba(255,255,255,0.9)]'
          ] : [
            // 鼠标设备的悬停效果
            'hover:scale-[1.02]',
            isDark 
              ? 'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(55,65,81,0.4)]' 
              : 'hover:shadow-[12px_12px_24px_rgba(148,163,184,0.25),-12px_-12px_24px_rgba(255,255,255,0.9)]',
            'active:scale-95'
          ]
        ],
        // 按钮重置样式（当作为button使用时）
        onClick && [
          'text-left',
          'focus:outline-none',
          'focus:ring-0'
        ],
        className
      )}
    >
      {children}
    </CardComponent>
  );
};

/**
 * 卡片标题组件
 */
export const ClayCardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { isDark } = useTheme();
  
  return (
    <h3
      className={cn(
        'text-lg font-semibold mb-3 transition-colors duration-300',
        isDark ? 'text-white' : 'text-slate-800',
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
  const { isDark } = useTheme();
  
  return (
    <div className={cn(
      'transition-colors duration-300',
      isDark ? 'text-slate-100' : 'text-slate-600',
      className
    )}>
      {children}
    </div>
  );
};