import React from 'react';
import { Download, X, Smartphone, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

/**
 * PWA安装提示组件
 * 当检测到可以安装PWA时显示安装横幅
 */
export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installPWA, canInstall, checkInstallability, resetPWAStatus } = usePWA();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);

  React.useEffect(() => {
    // 开发环境下，添加调试信息
    if (import.meta.env.DEV) {
      const installConditions = checkInstallability();
      console.log('PWA Install Prompt Debug:', {
        isInstallable,
        isInstalled,
        canInstall,
        isDismissed,
        installConditions
      });
    }
  }, [isInstallable, isInstalled, canInstall, isDismissed, checkInstallability]);

  React.useEffect(() => {
    // 检查是否应该显示安装提示
    const shouldShow = (isInstallable || (import.meta.env.DEV && canInstall)) && 
                      !isInstalled && 
                      !isDismissed;
    
    if (shouldShow) {
      // 延迟显示，确保页面加载完成
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, isDismissed, canInstall]);

  // 开发环境下的调试功能
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // 添加键盘快捷键显示调试信息
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setShowDebugInfo(!showDebugInfo);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showDebugInfo]);

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
  };

  // 开发环境下的调试信息组件
  const DebugInfo = () => {
    if (!import.meta.env.DEV || !showDebugInfo) return null;
    
    const conditions = checkInstallability();
    
    return (
      <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">PWA调试信息</h4>
          <button onClick={() => setShowDebugInfo(false)}>
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {isInstallable ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
            <span>可安装: {isInstallable ? '是' : '否'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isInstalled ? <AlertCircle className="w-3 h-3 text-red-400" /> : <CheckCircle className="w-3 h-3 text-green-400" />}
            <span>已安装: {isInstalled ? '是' : '否'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {canInstall ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
            <span>可安装(检测): {canInstall ? '是' : '否'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {conditions.hasServiceWorker ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
            <span>Service Worker: {conditions.hasServiceWorker ? '支持' : '不支持'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {conditions.hasManifest ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
            <span>Manifest: {conditions.hasManifest ? '存在' : '缺失'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {conditions.isHTTPS ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
            <span>HTTPS: {conditions.isHTTPS ? '是' : '否'}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-300 space-y-1">
              <div>显示模式: {window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}</div>
              <div>iOS独立: {(window.navigator as any).standalone ? '是' : '否'}</div>
              <div>localStorage标记: {localStorage.getItem('pwa-installed') || '无'}</div>
              <div>安装时间: {localStorage.getItem('pwa-install-time') ? new Date(parseInt(localStorage.getItem('pwa-install-time')!)).toLocaleString() : '无'}</div>
              <div>当前时间: {new Date().toLocaleTimeString()}</div>
              <div>页面URL: {window.location.href}</div>
              <div>Referrer: {document.referrer || '无'}</div>
            </div>
            {import.meta.env.DEV && (
              <div className="mt-2 pt-2 border-t border-gray-500">
                <button
                  onClick={resetPWAStatus}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
                >
                  重置PWA状态
                </button>
                <div className="text-xs text-gray-400 mt-1">
                  点击重置所有PWA安装状态
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
          按 Ctrl+Shift+P 切换显示
        </div>
      </div>
    );
  };

  if (!isVisible && !showDebugInfo) {
    return <DebugInfo />;
  }

  return (
    <>
      <DebugInfo />
      {isVisible && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-2xl p-4 transform transition-all duration-300 ease-out animate-in slide-in-from-top">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">安装薪资计算器</h3>
                  <p className="text-xs text-purple-100">
                    {import.meta.env.DEV ? '开发环境 - 测试模式' : '获得更好的使用体验'}
                  </p>
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
              {import.meta.env.DEV && (
                <div className="flex items-center space-x-2 text-xs text-purple-100">
                  <AlertCircle className="w-3 h-3" />
                  <span>开发模式：实际安装需在生产环境</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-purple-600 font-medium py-2 px-4 rounded-xl hover:bg-purple-50 transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>{import.meta.env.DEV ? '测试安装' : '立即安装'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-purple-200 hover:text-white transition-colors text-sm"
              >
                稍后
              </button>
              {import.meta.env.DEV && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="px-2 py-2 text-purple-200 hover:text-white transition-colors text-xs"
                  title="显示调试信息"
                >
                  🐛
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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