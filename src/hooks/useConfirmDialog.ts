import { useState, useCallback } from 'react';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * 确认对话框Hook
 * 提供移动端友好的确认对话框功能
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    variant: 'warning',
    onConfirm: () => {},
    onCancel: undefined
  });

  /**
   * 显示确认对话框
   */
  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        variant: options.variant || 'warning',
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  /**
   * 关闭对话框
   */
  const closeDialog = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    } else {
      setDialogState(prev => ({ ...prev, isOpen: false }));
    }
  }, [dialogState.onCancel]);

  return {
    dialogState,
    showConfirm,
    closeDialog
  };
};