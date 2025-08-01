import React from 'react';
import { ClayButton } from './ClayButton';
import { Share, Plus, X, Smartphone } from 'lucide-react';
import { useTouchDevice } from '../../hooks/useTouchDevice';
import { cn } from '../../lib/utils';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * iOS Safari 安装指导对话框
 */
export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({
  isOpen,
  onClose
}) => {
  const { isTouchDevice } = useTouchDevice();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl w-full max-w-md",
        isTouchDevice ? "mx-2" : "mx-4"
      )}>
        {/* 头部 */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl",
          isTouchDevice ? "p-6" : "p-4"
        )}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className={cn(
                "font-semibold text-gray-900",
                isTouchDevice ? "text-xl" : "text-lg"
              )}>
                安装到主屏幕
              </h3>
              <p className={cn(
                "text-gray-600",
                isTouchDevice ? "text-sm" : "text-xs"
              )}>
                在Safari中安装应用
              </p>
            </div>
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
          "p-4 space-y-4",
          isTouchDevice ? "p-6 space-y-6" : "p-4 space-y-4"
        )}>
          {/* 步骤1 */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Share className="w-5 h-5 text-blue-600" />
                <span className={cn(
                  "font-medium text-gray-900",
                  isTouchDevice ? "text-base" : "text-sm"
                )}>点击分享按钮</span>
              </div>
              <p className={cn(
                "text-gray-600",
                isTouchDevice ? "text-sm" : "text-xs"
              )}>
                在Safari底部工具栏找到分享按钮（方框带箭头图标）
              </p>
            </div>
          </div>

          {/* 步骤2 */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span className={cn(
                  "font-medium text-gray-900",
                  isTouchDevice ? "text-base" : "text-sm"
                )}>添加到主屏幕</span>
              </div>
              <p className={cn(
                "text-gray-600",
                isTouchDevice ? "text-sm" : "text-xs"
              )}>
                在弹出菜单中向下滚动，找到"添加到主屏幕"选项
              </p>
            </div>
          </div>

          {/* 步骤3 */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className={cn(
                  "font-medium text-gray-900",
                  isTouchDevice ? "text-base" : "text-sm"
                )}>完成安装</span>
              </div>
              <p className={cn(
                "text-gray-600",
                isTouchDevice ? "text-sm" : "text-xs"
              )}>
                点击"添加"按钮，应用图标将出现在主屏幕上
              </p>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className={cn(
              "text-blue-800 text-center",
              isTouchDevice ? "text-sm" : "text-xs"
            )}>
              💡 安装后可以像原生应用一样使用，支持离线访问！
            </p>
          </div>
        </div>

        {/* 按钮 */}
        <div className={cn(
          "p-4 border-t bg-gray-50 rounded-b-2xl",
          isTouchDevice ? "p-6" : "p-4"
        )}>
          <ClayButton
            variant="primary"
            onClick={onClose}
            className={cn(
              "w-full",
              isTouchDevice ? "py-3 text-base" : "py-2"
            )}
          >
            我知道了
          </ClayButton>
        </div>
      </div>
    </div>
  );
};