import React from 'react';
import { cn } from '../../lib/utils';
import { useTouchDevice } from '../../hooks/useTouchDevice';
import { useTheme } from '../../hooks/useTheme';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'purple' | 'green' | 'pink' | 'orange';
  autoFocus?: boolean;
}

/**
 * 粘土拟态风格的输入框组件
 */
export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  variant = 'default',
  className,
  autoFocus = false,
  ...props
}) => {
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { isDark, colors } = useTheme();
  
  // 修复variantStyles的useMemo依赖数组，确保主题切换时立即更新
  const variantStyles = React.useMemo(() => ({
    default: `bg-gradient-to-br ${colors.input.default}`,
    purple: `bg-gradient-to-br ${colors.input.purple}`,
    green: `bg-gradient-to-br ${colors.input.green}`,
    pink: `bg-gradient-to-br ${colors.input.pink}`,
    orange: `bg-gradient-to-br ${colors.input.orange}`,
  }), [colors.input.default, colors.input.purple, colors.input.green, colors.input.pink, colors.input.orange]);

  // 修复baseStyles的useMemo依赖数组，确保主题切换时立即更新
  const baseStyles = React.useMemo(() => cn(
    // 基础样式
    'w-full border-2',
    `${colors.text.primary} ${colors.text.placeholder}`,
    'transition-all duration-300 ease-out',
    'transform-gpu will-change-transform',
    // 粘土拟态效果
    isDark 
      ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
      : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
    // 聚焦效果
    'focus:outline-none focus:ring-0',
    isDark
      ? 'focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.15)]'
      : 'focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]',
    // 触屏设备优化
    isTouchDevice ? [
      // 更大的触摸目标
      isMobile ? 'px-4 py-4 text-base min-h-[48px] rounded-2xl' : 'px-4 py-3 text-base min-h-[44px] rounded-xl',
      'touch-manipulation', // 优化触屏响应
      'selection:bg-blue-200', // 优化文本选择
      // 触屏聚焦效果
      'focus:scale-[1.02]'
    ] : [
      // 桌面设备样式
      'px-3 py-2.5 rounded-xl',
      // 鼠标悬停效果
      isDark
        ? 'hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.25),inset_-1px_-1px_3px_rgba(255,255,255,0.08)]'
        : 'hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]',
      'hover:scale-[1.01]',
      'hover:brightness-105',
      'focus:scale-[1.02]'
    ],
    // 变体样式
    variantStyles[variant],
    // 错误状态
    error && (isDark 
      ? 'border-red-600 bg-gradient-to-br from-red-900 to-red-800'
      : 'border-red-300 bg-gradient-to-br from-red-50 to-red-100')
  ), [colors.text.primary, colors.text.placeholder, isDark, isTouchDevice, isMobile, variantStyles, variant, error]);

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          'block font-medium mb-2',
          colors.text.primary,
          // 触屏设备优化字体大小
          isTouchDevice ? 'text-base' : 'text-sm'
        )}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          autoFocus={autoFocus}
          // 触屏设备优化属性
          autoComplete={props.type === 'number' ? 'off' : 'on'}
          inputMode={props.type === 'number' ? 'decimal' : 'text'}
          className={cn(
            baseStyles,
            className
          )}
        />
      </div>
      {error && (
        <p className={cn(
          'mt-1',
          colors.text.error,
          // 触屏设备优化错误文本大小
          isTouchDevice ? 'text-base' : 'text-sm'
        )}>{error}</p>
      )}
    </div>
  );
};