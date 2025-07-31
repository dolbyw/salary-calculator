import React from 'react';
import { cn } from '../../lib/utils';
import { useTouchDevice } from '../../hooks/useTouchDevice';

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
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    green: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          'block font-medium text-slate-700 mb-2',
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
            // 基础样式
            'w-full border-2',
            'text-slate-800 placeholder-slate-400',
            'transition-all duration-300 ease-out',
            'transform-gpu will-change-transform',
            // 粘土拟态效果
            'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
            // 聚焦效果
            'focus:outline-none focus:ring-0',
            'focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]',
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
              'hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]',
              'hover:scale-[1.01]',
              'hover:brightness-105',
              'focus:scale-[1.02]'
            ],
            // 变体样式
            variantStyles[variant],
            // 错误状态
            error && 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
            className
          )}
        />
      </div>
      {error && (
        <p className={cn(
          'text-red-500 mt-1',
          // 触屏设备优化错误文本大小
          isTouchDevice ? 'text-base' : 'text-sm'
        )}>{error}</p>
      )}
    </div>
  );
};