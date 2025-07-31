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
  const { isDark, colors } = useTheme();

  const handleClick = () => {
    if (!onClick) return;
    
    // 触觉反馈
    if (hapticFeedback && isTouchDevice) {
      triggerHaptic('light');
    }
    
    onClick();
  };

  const isClickable = !!onClick || hover;
  // 使用统一的主题配色方案
  const variantStyles = React.useMemo(() => ({
    default: {
      bg: `bg-gradient-to-br ${colors.card.default}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(148,163,184,0.2),-8px_-8px_20px_rgba(255,255,255,0.8)]',
    },
    purple: {
      bg: `bg-gradient-to-br ${colors.card.purple}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(139,92,246,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    green: {
      bg: `bg-gradient-to-br ${colors.card.green}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(52,211,153,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    pink: {
      bg: `bg-gradient-to-br ${colors.card.pink}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(244,114,182,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    orange: {
      bg: `bg-gradient-to-br ${colors.card.orange}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(251,113,133,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
    gray: {
      bg: `bg-gradient-to-br ${colors.card.gray}`,
      shadow: isDark 
        ? 'shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(71,85,105,0.1)]' 
        : 'shadow-[8px_8px_20px_rgba(107,114,128,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]',
    },
  }), [colors.card, isDark]);

  const paddingStyles = React.useMemo(() => ({
    sm: isTouchDevice 
      ? (isMobile ? 'p-5' : 'p-4') 
      : 'p-4',
    md: isTouchDevice 
      ? (isMobile ? 'p-7' : 'p-6') 
      : 'p-6',
    lg: isTouchDevice 
      ? (isMobile ? 'p-9' : 'p-8') 
      : 'p-8',
  }), [isTouchDevice, isMobile]);

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
              ? 'focus:shadow-[12px_12px_24px_rgba(0,0,0,0.7),-12px_-12px_24px_rgba(71,85,105,0.15)]' 
              : 'focus:shadow-[12px_12px_24px_rgba(148,163,184,0.25),-12px_-12px_24px_rgba(255,255,255,0.9)]'
          ] : [
            // 鼠标设备的悬停效果
            'hover:scale-[1.02]',
            isDark 
              ? 'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.7),-12px_-12px_24px_rgba(71,85,105,0.15)] hover:brightness-110' 
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
  const { colors } = useTheme();
  
  return (
    <h3
      className={cn(
        'text-lg font-semibold mb-3 transition-colors duration-300',
        colors.text.primary,
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
  const { colors } = useTheme();
  
  return (
    <div className={cn(
      'transition-colors duration-300',
      colors.text.secondary,
      className
    )}>
      {children}
    </div>
  );
};