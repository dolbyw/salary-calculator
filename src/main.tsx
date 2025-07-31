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
    // 自动更新
    updateSW(true);
  },
  onOfflineReady() {
    console.log('PWA离线就绪');
    // 触发自定义事件通知应用PWA已准备就绪
    window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
  },
  onRegistered(r) {
    console.log('SW注册成功:', r);
    // 检查是否有待更新的SW
    if (r && r.waiting) {
      console.log('发现待更新的Service Worker');
    }
  },
  onRegisterError(error) {
    console.error('SW注册失败:', error);
  },
});

// 导出updateSW供其他地方使用
(window as any).updateSW = updateSW;

// 添加PWA安装相关的调试信息
if (typeof window !== 'undefined') {
  // 监听beforeinstallprompt事件进行调试
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt事件触发:', e);
  });
  
  // 监听appinstalled事件
  window.addEventListener('appinstalled', (e) => {
    console.log('PWA安装完成:', e);
  });
  
  // 检查PWA安装状态
  window.addEventListener('load', () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    console.log('PWA安装状态检查:', {
      isStandalone,
      isInWebAppiOS,
      isInstalled: isStandalone || isInWebAppiOS,
      userAgent: navigator.userAgent,
      location: window.location.href
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
