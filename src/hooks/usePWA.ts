import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

  useEffect(() => {
    // 检测PWA是否已安装
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkIfInstalled();

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 监听应用安装完成事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('应用已成功安装到您的设备！');
    };

    // 监听网络状态变化
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('网络连接已恢复');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('当前处于离线模式，部分功能可能受限');
    };

    // 监听Service Worker更新
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
      // 不再自动显示toast，只设置状态
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 检查Service Worker更新
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, []);

  /**
   * 触发PWA安装
   */
  const installPWA = async () => {
    if (!deferredPrompt) {
      toast.error('当前环境不支持应用安装');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('正在安装应用...');
      } else {
        toast.info('安装已取消');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('PWA安装失败:', error);
      toast.error('安装失败，请稍后重试');
    }
  };

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
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installPWA,
    updateSW,
    checkNetworkStatus
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