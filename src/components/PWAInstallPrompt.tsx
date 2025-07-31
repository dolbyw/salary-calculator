import React from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

/**
 * PWA安装提示组件
 * 当检测到可以安装PWA时显示安装横幅
 */
export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    // 检查是否已经被用户关闭过
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
    
    // 开发环境下，添加调试信息
    if (import.meta.env.DEV) {
      console.log('PWA Install Prompt Debug:', {
        isInstallable,
        isInstalled,
        isDismissed,
        dismissed: localStorage.getItem('pwa-install-dismissed')
      });
    }
  }, [isInstallable, isInstalled, isDismissed]);

  React.useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      // 延迟显示，避免打扰用户
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  /**
   * 处理安装按钮点击
   */
  const handleInstall = async () => {
    await installPWA();
    setIsVisible(false);
  };

  /**
   * 处理关闭按钮点击
   */
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-2xl p-4 transform transition-all duration-300 ease-out animate-in slide-in-from-top">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">安装薪资计算器</h3>
              <p className="text-xs text-purple-100">获得更好的使用体验</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-purple-200 hover:text-white transition-colors p-1"
            aria-label="关闭安装提示"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-xs text-purple-100">
            <Monitor className="w-3 h-3" />
            <span>添加到桌面，快速访问</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-purple-100">
            <Download className="w-3 h-3" />
            <span>离线使用，随时计算薪资</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-white text-purple-600 font-medium py-2 px-4 rounded-xl hover:bg-purple-50 transition-colors text-sm flex items-center justify-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>立即安装</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-purple-200 hover:text-white transition-colors text-sm"
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * PWA状态指示器组件
 * 显示当前PWA状态（已安装、可安装等）
 */
export const PWAStatusIndicator: React.FC = () => {
  const { isInstalled, isOnline } = usePWA();

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1 shadow-lg">
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-orange-500'
          }`} />
          <span className="text-gray-600">
            {isOnline ? 'PWA在线' : 'PWA离线'}
          </span>
        </div>
      </div>
    </div>
  );
};