import React from 'react';
import { cn } from '../../lib/utils';
import { useTouchDevice, useHapticFeedback } from '../../hooks/useTouchDevice';
import { useTheme } from '../../hooks/useTheme';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  hapticFeedback?: boolean;
}

/**
 * 粘土拟态风格的按钮组件
 */
export const ClayButton: React.FC<ClayButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  hapticFeedback = true,
  onClick,
  ...props
}) => {
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { triggerHaptic } = useHapticFeedback();
  const { isDark, colors } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // 触觉反馈
    if (hapticFeedback && isTouchDevice) {
      triggerHaptic('light');
    }
    
    onClick?.(e);
  };
  
  // 使用统一的主题配色方案 - 修复useMemo依赖数组，确保主题切换时立即更新
  const variantStyles = React.useMemo(() => ({
    primary: {
      base: `bg-gradient-to-br ${colors.button.primary}`,
      shadow: isDark 
        ? 'shadow-[4px_4px_12px_rgba(0,0,0,0.6),-4px_-4px_12px_rgba(16,185,129,0.1)]' 
        : 'shadow-[4px_4px_12px_rgba(59,130,246,0.3),-4px_-4px_12px_rgba(147,197,253,0.3)]',
      hover: isDark 
        ? 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(0,0,0,0.7),-6px_-6px_16px_rgba(16,185,129,0.15)]' 
        : 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(59,130,246,0.4),-6px_-6px_16px_rgba(147,197,253,0.4)]',
      active: 'active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]',
    },
    secondary: {
      base: `bg-gradient-to-br ${colors.button.secondary}`,
      shadow: isDark 
        ? 'shadow-[4px_4px_12px_rgba(0,0,0,0.6),-4px_-4px_12px_rgba(71,85,105,0.1)]' 
        : 'shadow-[4px_4px_12px_rgba(148,163,184,0.3),-4px_-4px_12px_rgba(241,245,249,0.8)]',
      hover: isDark 
        ? 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(0,0,0,0.7),-6px_-6px_16px_rgba(71,85,105,0.15)]' 
        : 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(148,163,184,0.4),-6px_-6px_16px_rgba(241,245,249,0.9)]',
      active: 'active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]',
    },
    success: {
      base: `bg-gradient-to-br ${colors.button.success}`,
      shadow: isDark 
        ? 'shadow-[4px_4px_12px_rgba(0,0,0,0.6),-4px_-4px_12px_rgba(71,85,105,0.1)]' 
        : 'shadow-[4px_4px_12px_rgba(52,211,153,0.3),-4px_-4px_12px_rgba(110,231,183,0.3)]',
      hover: isDark 
        ? 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(0,0,0,0.7),-6px_-6px_16px_rgba(71,85,105,0.15)]' 
        : 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(52,211,153,0.4),-6px_-6px_16px_rgba(110,231,183,0.4)]',
      active: 'active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]',
    },
    danger: {
      base: `bg-gradient-to-br ${colors.button.danger}`,
      shadow: isDark 
        ? 'shadow-[4px_4px_12px_rgba(0,0,0,0.6),-4px_-4px_12px_rgba(71,85,105,0.1)]' 
        : 'shadow-[4px_4px_12px_rgba(248,113,113,0.3),-4px_-4px_12px_rgba(252,165,165,0.3)]',
      hover: isDark 
        ? 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(0,0,0,0.7),-6px_-6px_16px_rgba(71,85,105,0.15)]' 
        : 'hover:brightness-110 hover:shadow-[6px_6px_16px_rgba(248,113,113,0.4),-6px_-6px_16px_rgba(252,165,165,0.4)]',
      active: 'active:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)]',
    },
  }), [colors.button.primary, colors.button.secondary, colors.button.success, colors.button.danger, isDark]);

  const sizeStyles = {
    sm: isTouchDevice 
      ? (isMobile ? 'px-5 py-3 text-sm rounded-xl min-h-[44px]' : 'px-4 py-2.5 text-sm rounded-xl min-h-[40px]')
      : 'px-4 py-2 text-sm rounded-xl',
    md: isTouchDevice 
      ? (isMobile ? 'px-7 py-4 text-base rounded-2xl min-h-[48px]' : 'px-6 py-3.5 text-base rounded-2xl min-h-[44px]')
      : 'px-6 py-3 text-base rounded-2xl',
    lg: isTouchDevice 
      ? (isMobile ? 'px-9 py-5 text-lg rounded-3xl min-h-[52px]' : 'px-8 py-4.5 text-lg rounded-3xl min-h-[48px]')
      : 'px-8 py-4 text-lg rounded-3xl',
  };

  const currentVariant = variantStyles[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        // 基础样式
        'font-medium transition-all duration-200 ease-out',
        'transform-gpu will-change-transform',
        'focus:outline-none focus:ring-0',
        // 触屏优化
        isTouchDevice && [
          'touch-manipulation', // 优化触屏响应
          'select-none', // 防止文本选择
          'active:scale-95', // 触屏按压反馈
          !disabled && 'active:brightness-110'
        ],
        // 鼠标设备的悬停效果
        !isTouchDevice && !disabled && [
          'hover:scale-105',
          'active:scale-95'
        ],
        // 尺寸
        sizeStyles[size],
        // 变体样式
        currentVariant.base,
        currentVariant.shadow,
        !disabled && !isTouchDevice && currentVariant.hover,
        !disabled && currentVariant.active,
        // 禁用状态
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};