import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './hooks/useTheme';
import { registerSW } from 'virtual:pwa-register';

// 注册Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('PWA需要更新');
    // 提示用户更新而不是自动更新
    if (confirm('发现新版本，是否立即更新？')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('PWA离线就绪');
    // 触发自定义事件通知应用PWA已准备就绪
    window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
    
    // 在开发环境下显示更多信息
    if (import.meta.env.DEV) {
      console.log('PWA离线功能已启用，应用可以在无网络环境下使用');
    }
  },
  onRegistered(r) {
    console.log('Service Worker注册成功:', r);
    
    // 检查是否有待更新的SW
    if (r && r.waiting) {
      console.log('发现待更新的Service Worker');
    }
    
    // 定期检查更新（每30分钟）
    if (r) {
      setInterval(() => {
        r.update();
      }, 30 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('Service Worker注册失败:', error);
    
    // 在开发环境下提供更详细的错误信息
    if (import.meta.env.DEV) {
      console.error('可能的原因：');
      console.error('1. Service Worker文件不存在');
      console.error('2. 网络连接问题');
      console.error('3. 浏览器不支持Service Worker');
    }
  },
});

// 导出updateSW供其他地方使用
(window as any).updateSW = updateSW;

// 添加PWA安装相关的调试信息和事件处理
if (typeof window !== 'undefined') {
  // 监听beforeinstallprompt事件进行调试
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🚀 beforeinstallprompt事件触发:', e);
    console.log('平台支持:', (e as any).platforms);
  });
  
  // 监听appinstalled事件
  window.addEventListener('appinstalled', (e) => {
    console.log('✅ PWA安装完成:', e);
  });
  
  // 监听显示模式变化
  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  const handleDisplayModeChange = (e: MediaQueryListEvent) => {
    console.log('📱 显示模式变化:', e.matches ? 'standalone' : 'browser');
  };
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleDisplayModeChange);
  } else {
    mediaQuery.addListener(handleDisplayModeChange);
  }
  
  // 检查PWA安装状态和环境
  window.addEventListener('load', () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;
    
    // 检查PWA安装条件
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    const supportsPWA = hasServiceWorker && hasManifest && isHTTPS;
    
    console.log('🔍 PWA环境检查:', {
      isInstalled,
      isStandalone,
      isInWebAppiOS,
      supportsPWA,
      hasServiceWorker,
      hasManifest,
      isHTTPS,
      userAgent: navigator.userAgent,
      location: window.location.href,
      manifestUrl: document.querySelector('link[rel="manifest"]')?.getAttribute('href')
    });
    
    // 开发环境下的额外检查
    if (import.meta.env.DEV) {
      console.log('🛠️ 开发环境PWA提示:');
      console.log('- 如果安装提示未显示，请检查上述条件');
      console.log('- 某些浏览器需要用户交互后才显示安装提示');
      console.log('- Chrome需要满足参与度启发式算法');
      console.log('- 按 Ctrl+Shift+P 显示调试信息');
      
      // 检查manifest文件是否可访问
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const manifestUrl = manifestLink.getAttribute('href');
        if (manifestUrl) {
          fetch(manifestUrl)
            .then(response => {
              if (response.ok) {
                console.log('✅ Manifest文件可访问');
                return response.json();
              } else {
                console.error('❌ Manifest文件访问失败:', response.status);
              }
            })
            .then(manifest => {
              if (manifest) {
                console.log('📄 Manifest内容:', manifest);
              }
            })
            .catch(error => {
              console.error('❌ Manifest文件解析失败:', error);
            });
        }
      }
    }
  });
  
  // 添加手动触发安装提示的全局函数（仅开发环境）
  if (import.meta.env.DEV) {
    (window as any).triggerPWAInstall = () => {
      console.log('🔧 手动触发PWA安装检查...');
      // 这只是一个调试函数，实际的安装提示由浏览器控制
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    };
    
    console.log('🔧 开发工具已加载，可使用 window.triggerPWAInstall() 测试');
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
