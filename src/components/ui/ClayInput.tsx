import React from 'react';
import { cn } from '../../lib/utils';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'purple' | 'green' | 'pink';
}

/**
 * 粘土拟态风格的输入框组件
 */
export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  variant = 'default',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    green: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200',
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={cn(
            // 基础样式
            'w-full px-3 py-2.5 rounded-xl border-2',
            'text-slate-800 placeholder-slate-400',
            'transition-all duration-300 ease-out',
            'transform-gpu will-change-transform',
            // 粘土拟态效果
            'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
            // 聚焦效果
            'focus:outline-none focus:ring-0',
            'focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]',
            'focus:scale-[1.02]',
            // 悬停效果 - 更和谐的动画
            'hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]',
            'hover:scale-[1.01]',
            'hover:brightness-105',
            // 变体样式
            variantStyles[variant],
            // 错误状态
            error && 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
            className
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};