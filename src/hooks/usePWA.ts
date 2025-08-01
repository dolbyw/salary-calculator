import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useConfirmDialog } from './useConfirmDialog';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * PWA功能管理Hook
 * 提供PWA安装、更新、网络状态等功能
 */
export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { showConfirm, dialogState, closeDialog } = useConfirmDialog();

  // 检测PWA安装状态的回调函数
  const checkIfInstalled = useCallback(() => {
    // 主要检测方法：display-mode standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // iOS Safari检查
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    // 检查localStorage中的安装标记
    const hasInstallFlag = localStorage.getItem('pwa-installed') === 'true';
    
    // 综合判断（简化逻辑，提高准确性）
    const installed = isStandalone || isIOSStandalone || hasInstallFlag;
    
    // 更新状态
    setIsInstalled(installed);
    
    // 如果检测到已安装，设置localStorage标记
    if (installed && !hasInstallFlag) {
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-time', Date.now().toString());
    }
    
    if (import.meta.env.DEV) {
      console.log('🔍 PWA安装状态检查:', {
        isStandalone,
        isIOSStandalone,
        hasInstallFlag,
        installed,
        userAgent: navigator.userAgent.substring(0, 100)
      });
    }
    
    return installed;
  }, []);

  // 检测浏览器是否支持PWA安装
  const checkInstallSupport = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // 基础PWA支持检测
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    
    // 浏览器和设备检测
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isEdge = userAgent.includes('edg');
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = userAgent.includes('android');
    const isMobile = isIOS || isAndroid;
    
    // PWA安装支持判断（简化逻辑）
    const browserSupportsInstall = 
      (isChrome && (isAndroid || !isMobile)) ||  // Chrome on Android/Desktop
      (isSafari && isIOS) ||                    // Safari on iOS
      (isEdge && !isMobile);                    // Edge on Desktop
    
    const canInstallPWA = hasServiceWorker && hasManifest && browserSupportsInstall && !checkIfInstalled();
    setCanInstall(canInstallPWA);
    
    if (import.meta.env.DEV) {
      console.log('PWA安装支持检查:', {
        hasServiceWorker,
        hasManifest,
        browserSupportsInstall,
        canInstallPWA,
        browser: isChrome ? 'Chrome' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Other',
        platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'
      });
    }
    
    return canInstallPWA;
  }, [checkIfInstalled]);

  useEffect(() => {
    // 初始化检查
    checkIfInstalled();
    checkInstallSupport();

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt事件触发:', e);
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      
      if (import.meta.env.DEV) {
        console.log('PWA安装提示可用:', {
          platforms: promptEvent.platforms,
          event: promptEvent
        });
      }
    };

    // 监听应用安装完成事件
    const handleAppInstalled = (e: Event) => {
      console.log('✅ PWA安装完成事件:', e);
      
      // 立即更新所有相关状态
      setIsInstalled(true);
      setIsInstallable(false);
      setCanInstall(false);
      setDeferredPrompt(null);
      
      // 设置安装标记到localStorage
      const currentTime = Date.now().toString();
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-time', currentTime);
      
      // 显示安装成功通知
      toast.success('应用已成功安装到您的设备！', {
        duration: 3000
      });
      
      if (import.meta.env.DEV) {
        console.log('🎉 PWA安装完成');
      }
    };

    // 监听网络状态变化
    const handleOnline = () => {
      setIsOnline(true);
      // 移除toast通知，使用OfflineIndicator组件显示状态
    };

    const handleOffline = () => {
      setIsOnline(false);
      // 移除toast通知，使用OfflineIndicator组件显示状态
    };

    // 监听Service Worker更新
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
      console.log('Service Worker更新可用');
    };

    // 监听显示模式变化（用于检测PWA安装状态变化）
    const handleDisplayModeChange = () => {
      if (import.meta.env.DEV) {
        console.log('📱 显示模式变化，重新检查安装状态');
      }
      checkIfInstalled();
    };

    // 添加事件监听器
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 监听显示模式变化
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleDisplayModeChange);
    }
    
    // 延迟初始检查，确保页面完全加载
    const initialCheckTimeout = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.log('🚀 执行初始PWA状态检查');
      }
      checkIfInstalled();
      checkInstallSupport();
    }, 1000);
    
    // 检查Service Worker更新
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    // 开发环境下的调试检查
    if (import.meta.env.DEV) {
      setTimeout(() => {
        if (!deferredPrompt && !isInstalled && canInstall) {
          console.log('开发环境：启用安装提示');
          setIsInstallable(true);
        }
      }, 2000);
    }

    // 清理事件监听器和定时器
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
      
      clearTimeout(initialCheckTimeout);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, [checkIfInstalled, checkInstallSupport, canInstall, deferredPrompt, isInstalled]);

  /**
   * 触发PWA安装
   */
  const installPWA = async () => {
    if (!deferredPrompt) {
      if (import.meta.env.DEV) {
        const shouldInstall = await showConfirm({
          title: '开发环境模拟安装',
          message: '这是开发环境的模拟安装提示。\n\n点击"确定"模拟安装PWA应用。',
          confirmText: '模拟安装',
          cancelText: '取消',
          variant: 'info'
        });
        
        if (shouldInstall) {
          // 模拟安装过程
          toast.success('模拟安装成功！在生产环境中，这将是真实的PWA安装。', {
            duration: 3000
          });
          
          // 模拟安装状态变化
          setIsInstalled(true);
          setIsInstallable(false);
          setCanInstall(false);
          
          // 设置localStorage标记
          localStorage.setItem('pwa-installed', 'true');
          localStorage.setItem('pwa-install-time', Date.now().toString());
          
          // 延迟重新检查状态
          setTimeout(() => {
            checkIfInstalled();
            checkInstallSupport();
          }, 500);
          
          console.log('🔧 开发环境：模拟PWA安装完成');
        }
        return;
      }
      
      toast.error('当前环境不支持应用安装', {
        description: '请确保使用支持PWA的浏览器，并满足安装条件'
      });
      return;
    }

    try {
      console.log('开始PWA安装流程...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('用户安装选择:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ 用户接受了PWA安装');
        toast.success('正在安装应用...', {
          duration: 2000
        });
        
        // 预设安装状态（实际状态会在appinstalled事件中确认）
        setTimeout(() => {
          setIsInstalled(true);
          setIsInstallable(false);
          setCanInstall(false);
          localStorage.setItem('pwa-installed', 'true');
          
          // 强制重新检查状态
          checkIfInstalled();
          checkInstallSupport();
        }, 1000);
      } else {
        console.log('❌ 用户拒绝了PWA安装');
        toast.info('安装已取消', {
          description: '您可以稍后通过浏览器菜单安装应用'
        });
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ PWA安装失败:', error);
      toast.error('安装失败，请稍后重试', {
        description: '如果问题持续存在，请尝试刷新页面'
      });
    }
  };

  /**
   * 手动检查PWA安装条件
   */
  const checkInstallability = useCallback(() => {
    const conditions = {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasManifest: document.querySelector('link[rel="manifest"]') !== null,
      isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
      isNotInstalled: !isInstalled,
      hasDeferredPrompt: !!deferredPrompt
    };
    
    if (import.meta.env.DEV) {
      console.log('PWA安装条件检查:', conditions);
    }
    
    return conditions;
  }, [isInstalled, deferredPrompt]);

  /**
   * 重置PWA安装状态（仅开发环境）
   */
  const resetPWAStatus = useCallback(() => {
    if (!import.meta.env.DEV) {
      console.warn('重置PWA状态仅在开发环境可用');
      return;
    }
    
    // 清除localStorage中的安装标记
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-install-time');
    localStorage.removeItem('pwa-last-install-time');
    
    // 重置状态
    setIsInstalled(false);
    setIsInstallable(false);
    setCanInstall(false);
    setDeferredPrompt(null);
    
    // 重新检查状态
    setTimeout(() => {
      checkIfInstalled();
      checkInstallSupport();
    }, 100);
    
    console.log('🔄 PWA状态已重置');
    toast.success('PWA状态已重置', {
      duration: 2000
    });
  }, [checkIfInstalled, checkInstallSupport]);

  /**
   * 更新Service Worker
   */
  const updateSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Service Worker更新失败:', error);
        toast.error('更新失败，请刷新页面重试');
      }
    }
  };

  /**
   * 检查网络状态
   */
  const checkNetworkStatus = () => {
    return {
      isOnline,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0
    };
  };

  return {
    deferredPrompt,
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    canInstall,
    installPWA,
    updateSW,
    checkInstallability,
    checkNetworkStatus,
    resetPWAStatus,
    // 确认对话框相关
    confirmDialog: dialogState,
    closeConfirmDialog: closeDialog
  };
};

/**
 * 推送通知管理Hook
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [isSupported, setIsSupported] = useState('Notification' in window);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
  }, []);

  /**
   * 请求通知权限
   */
  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('当前浏览器不支持推送通知');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('通知权限已开启');
        return true;
      } else {
        toast.error('通知权限被拒绝');
        return false;
      }
    } catch (error) {
      console.error('请求通知权限失败:', error);
      toast.error('请求通知权限失败');
      return false;
    }
  };

  /**
   * 发送本地通知
   */
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('没有通知权限');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      });

      // 自动关闭通知
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  };

  /**
   * 订阅推送通知
   */
  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });

      // 这里可以将订阅信息发送到服务器
      console.log('推送订阅成功:', subscription);
      return subscription;
    } catch (error) {
      console.error('推送订阅失败:', error);
      return null;
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    subscribeToPush
  };
};