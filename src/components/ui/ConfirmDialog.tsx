import React from 'react';
import { ClayButton } from './ClayButton';
import { AlertTriangle, X } from 'lucide-react';
import { useTouchDevice } from '../../hooks/useTouchDevice';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

/**
 * 移动端友好的确认对话框组件
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'warning',
  icon
}) => {
  const { isTouchDevice } = useTouchDevice();

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'info':
        return {
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl w-full max-w-md",
        isTouchDevice ? "mx-2" : "mx-4"
      )}>
        {/* 头部 */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          isTouchDevice ? "p-6" : "p-4"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "rounded-full p-2",
              styles.bgColor,
              styles.borderColor,
              "border"
            )}>
              {icon || <AlertTriangle className={cn(
                styles.iconColor,
                isTouchDevice ? "w-6 h-6" : "w-5 h-5"
              )} />}
            </div>
            <h3 className={cn(
              "font-semibold text-gray-900",
              isTouchDevice ? "text-xl" : "text-lg"
            )}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "text-gray-400 hover:text-gray-600 transition-colors",
              isTouchDevice ? "p-2" : "p-1"
            )}
          >
            <X className={cn(
              isTouchDevice ? "w-6 h-6" : "w-5 h-5"
            )} />
          </button>
        </div>

        {/* 内容 */}
        <div className={cn(
          "p-4",
          isTouchDevice ? "p-6" : "p-4"
        )}>
          <p className={cn(
            "text-gray-700 leading-relaxed",
            isTouchDevice ? "text-base" : "text-sm"
          )}>
            {message}
          </p>
        </div>

        {/* 按钮 */}
        <div className={cn(
          "flex gap-3 p-4 border-t bg-gray-50 rounded-b-2xl",
          isTouchDevice ? "p-6 flex-col" : "p-4 flex-row justify-end"
        )}>
          <ClayButton
            variant="secondary"
            onClick={onClose}
            className={cn(
              isTouchDevice ? "w-full py-3 text-base" : "px-4 py-2"
            )}
          >
            {cancelText}
          </ClayButton>
          <ClayButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              isTouchDevice ? "w-full py-3 text-base" : "px-4 py-2"
            )}
          >
            {confirmText}
          </ClayButton>
        </div>
      </div>
    </div>
  );
};