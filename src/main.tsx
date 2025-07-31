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
  },
  onOfflineReady() {
    console.log('PWA离线就绪');
  },
  onRegistered(r) {
    console.log('SW注册成功:', r);
  },
  onRegisterError(error) {
    console.log('SW注册失败:', error);
  },
});

// 导出updateSW供其他地方使用
(window as any).updateSW = updateSW;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
