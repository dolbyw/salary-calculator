import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

/**
 * 主题管理Hook
 * 支持白天、黑夜和自动三种模式
 */
export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'auto';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  /**
   * 检测系统主题偏好
   */
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  /**
   * 解析当前应该使用的主题
   */
  const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
    if (mode === 'auto') {
      return getSystemTheme();
    }
    return mode;
  };

  /**
   * 应用主题到DOM
   */
  const applyTheme = (theme: ResolvedTheme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  /**
   * 切换主题模式
   */
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
    
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    
    // 强制重新渲染以确保主题立即应用
    setTimeout(() => {
      const event = new CustomEvent('themeChanged', { detail: { mode, resolved } });
      window.dispatchEvent(event);
    }, 0);
  };

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'auto') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // 初始化主题
    const resolved = resolveTheme(themeMode);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themeMode]);

  return {
    themeMode,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isAuto: themeMode === 'auto'
  };
};