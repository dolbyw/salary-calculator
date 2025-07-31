import React, { createContext, useState, useEffect, useCallback, useMemo, useContext, ReactNode } from 'react';

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 主题配色方案接口 - 完整的UI元素配色定义
 */
export interface ThemeColors {
  // 背景色系
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    // 页面级背景
    calculator: string;
    history: string;
    settings: string;
  };
  // 卡片色系
  card: {
    default: string;
    purple: string;
    green: string;
    pink: string;
    orange: string;
    gray: string;
    background: string;
    border: string;
  };
  // 按钮色系
  button: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
  };
  // 文字色系
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    accent: string;
    placeholder: string;
    error: string;
  };
  // 边框色系
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // 导航色系
  navigation: {
    background: string;
    border: string;
    activeItem: string;
    inactiveItem: string;
    hoverItem: string;
    shadow: string;
  };
  // 输入框色系
  input: {
    default: string;
    purple: string;
    green: string;
    pink: string;
    orange: string;
  };
  // Toast通知色系
  toast: {
    background: string;
    border: string;
    text: string;
    shadow: string;
  };
  // 页面指示器色系
  indicator: {
    background: string;
    border: string;
    active: string;
    inactive: string;
    hover: string;
  };
  // 薪资计算器专用色系
  calculator: {
    // 总薪资卡片
    totalSalary: {
      background: string;
      text: string;
      amount: string;
    };
    // 基础薪资卡片
    baseSalary: {
      background: string;
      text: string;
      amount: string;
    };
    // 加班费卡片
    overtime: {
      background: string;
      text: string;
      amount: string;
    };
    // 其它加项卡片
    customItems: {
      background: string;
      text: string;
      amount: string;
    };
    // 详细明细区域
    details: {
      background: string;
      text: string;
      label: string;
    };
  };
  // 历史记录专用色系
  history: {
    // 记录项背景
    item: {
      background: string;
      border: string;
      text: string;
      amount: string;
    };
    // 记录详情
    details: {
      background: string;
      text: string;
      label: string;
    };
    // 总计区域
    summary: {
      background: string;
      text: string;
      border: string;
    };
  };
}

/**
 * 白天模式配色方案 - 完整的UI元素配色
 */
const lightTheme: ThemeColors = {
  background: {
    primary: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    secondary: 'bg-slate-100',
    tertiary: 'bg-gray-50',
    // 页面特定背景
    calculator: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    history: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    settings: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50',
  },
  card: {
    default: 'from-slate-50 to-slate-100 border-slate-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    green: 'from-emerald-50 to-emerald-100 border-emerald-200',
    pink: 'from-pink-50 to-pink-100 border-pink-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
    gray: 'from-gray-50 to-gray-100 border-gray-200',
    background: 'from-slate-50/90 to-slate-100/90',
    border: 'border-white/50',
  },
  button: {
    primary: 'from-blue-500 to-blue-600 text-white',
    secondary: 'from-slate-200 to-slate-300 text-slate-700',
    success: 'from-emerald-400 to-emerald-600 text-white',
    danger: 'from-red-400 to-red-600 text-white',
  },
  text: {
    primary: 'text-slate-800',
    secondary: 'text-slate-600',
    tertiary: 'text-slate-500',
    inverse: 'text-white',
    accent: 'text-emerald-600',
    placeholder: 'placeholder-slate-400',
    error: 'text-red-500',
  },
  border: {
    primary: 'border-slate-200',
    secondary: 'border-slate-300',
    accent: 'border-blue-200',
  },
  navigation: {
    background: 'bg-gradient-to-br from-white/90 to-slate-100/90 border',
    border: 'border-slate-200/60',
    activeItem: 'from-blue-500 to-blue-600',
    inactiveItem: 'text-slate-600',
    hoverItem: 'hover:text-slate-900 hover:bg-white/50',
    shadow: 'shadow-[6px_6px_20px_rgba(148,163,184,0.25),-6px_-6px_20px_rgba(255,255,255,0.9)]',
  },
  input: {
    default: 'from-slate-50 to-slate-100 border-slate-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    green: 'from-emerald-50 to-emerald-100 border-emerald-200',
    pink: 'from-pink-50 to-pink-100 border-pink-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
  },
  toast: {
    background: 'bg-white/95',
    border: 'border-slate-200',
    text: 'text-slate-800',
    shadow: 'shadow-lg shadow-slate-200/50',
  },
  indicator: {
    background: 'bg-white/90',
    border: 'border-slate-200',
    active: 'bg-blue-500',
    inactive: 'bg-slate-300',
    hover: 'bg-slate-400',
  },
  // 薪资计算器专用色系 - 白天模式
  calculator: {
    totalSalary: {
      background: 'bg-gradient-to-br from-purple-100 to-purple-200',
      text: 'text-purple-700',
      amount: 'text-purple-900',
    },
    baseSalary: {
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      text: 'text-blue-600',
      amount: 'text-blue-800',
    },
    overtime: {
      background: 'bg-gradient-to-br from-green-50 to-green-100',
      text: 'text-green-600',
      amount: 'text-green-800',
    },
    customItems: {
      background: 'bg-gradient-to-br from-orange-50 to-orange-100',
      text: 'text-orange-600',
      amount: 'text-orange-800',
    },
    details: {
      background: 'bg-slate-50',
      text: 'text-slate-700',
      label: 'text-slate-200',
    },
  },
  // 历史记录专用色系 - 白天模式
  history: {
    item: {
      background: 'bg-white/80',
      border: 'border-slate-200',
      text: 'text-slate-700',
      amount: 'text-purple-600',
    },
    details: {
      background: 'bg-slate-50',
      text: 'text-slate-600',
      label: 'text-slate-500',
    },
    summary: {
      background: 'from-purple-100 to-purple-200',
      text: 'text-purple-700',
      border: 'border-slate-400',
    },
  },
};

/**
 * 黑夜模式配色方案 - 完整的UI元素配色
 */
const darkTheme: ThemeColors = {
  background: {
    primary: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    secondary: 'bg-slate-800',
    tertiary: 'bg-slate-700',
    // 页面特定背景
    calculator: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    history: 'bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900',
    settings: 'bg-gradient-to-br from-slate-900 via-pink-900/20 to-slate-900',
  },
  card: {
    default: 'from-slate-800 to-slate-900 border-slate-600/50',
    purple: 'from-slate-800 to-slate-900 border-l-4 border-l-purple-500/30 border-slate-600/50',
    green: 'from-slate-800 to-slate-900 border-l-4 border-l-emerald-500/30 border-slate-600/50',
    pink: 'from-slate-800 to-slate-900 border-l-4 border-l-pink-500/30 border-slate-600/50',
    orange: 'from-slate-800 to-slate-900 border-l-4 border-l-orange-500/30 border-slate-600/50',
    gray: 'from-slate-700 to-slate-800 border-slate-600/50',
    background: 'from-slate-800/90 to-slate-900/90',
    border: 'border-slate-600/30',
  },
  button: {
    primary: 'from-emerald-500 to-emerald-600 text-white',
    secondary: 'from-slate-700 to-slate-800 text-slate-200 border border-slate-600/30',
    success: 'from-emerald-500 to-emerald-600 text-white',
    danger: 'from-red-500 to-red-600 text-white',
  },
  text: {
    primary: 'text-slate-100',
    secondary: 'text-slate-200',
    tertiary: 'text-slate-300',
    inverse: 'text-slate-900',
    accent: 'text-emerald-400',
    placeholder: 'placeholder-slate-500',
    error: 'text-red-400',
  },
  border: {
    primary: 'border-slate-600/50',
    secondary: 'border-slate-500/50',
    accent: 'border-emerald-500/30',
  },
  navigation: {
    background: 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border',
    border: 'border-slate-500/40',
    activeItem: 'from-emerald-600 to-emerald-700',
    inactiveItem: 'text-slate-200',
    hoverItem: 'hover:text-white hover:bg-slate-600/60',
    shadow: 'shadow-[6px_6px_20px_rgba(0,0,0,0.7),-6px_-6px_20px_rgba(71,85,105,0.2)]',
  },
  input: {
    default: 'from-slate-800 to-slate-900 border-slate-700',
    purple: 'from-purple-800 to-purple-900 border-purple-700',
    green: 'from-emerald-800 to-emerald-900 border-emerald-700',
    pink: 'from-pink-800 to-pink-900 border-pink-700',
    orange: 'from-orange-800 to-orange-900 border-orange-700',
  },
  toast: {
    background: 'bg-slate-800/95',
    border: 'border-slate-600',
    text: 'text-slate-100',
    shadow: 'shadow-lg shadow-black/50',
  },
  indicator: {
    background: 'bg-slate-800/90',
    border: 'border-slate-600',
    active: 'bg-emerald-500',
    inactive: 'bg-slate-600',
    hover: 'bg-slate-500',
  },
  // 薪资计算器专用色系 - 黑夜模式
  calculator: {
    totalSalary: {
      background: 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/30',
      text: 'text-slate-300',
      amount: 'text-white',
    },
    baseSalary: {
      background: 'bg-gradient-to-br from-blue-800/60 to-blue-900/60 border border-blue-700/30',
      text: 'text-blue-300',
      amount: 'text-blue-100',
    },
    overtime: {
      background: 'bg-gradient-to-br from-emerald-800/60 to-emerald-900/60 border border-emerald-700/30',
      text: 'text-emerald-300',
      amount: 'text-emerald-100',
    },
    customItems: {
      background: 'bg-gradient-to-br from-amber-800/60 to-amber-900/60 border border-amber-700/30',
      text: 'text-amber-300',
      amount: 'text-amber-100',
    },
    details: {
      background: 'bg-slate-700/50 border border-slate-600/30',
      text: 'text-slate-300',
      label: 'text-slate-200',
    },
  },
  // 历史记录专用色系 - 黑夜模式
  history: {
    item: {
      background: 'bg-slate-800/80',
      border: 'border-slate-600/50',
      text: 'text-slate-200',
      amount: 'text-purple-400',
    },
    details: {
      background: 'bg-slate-700/50',
      text: 'text-slate-300',
      label: 'text-slate-400',
    },
    summary: {
      background: 'from-purple-800/60 to-purple-900/60',
      text: 'text-purple-200',
      border: 'border-slate-500/50',
    },
  },
};

/**
 * 主题上下文状态接口
 */
interface ThemeContextState {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
}

/**
 * 主题上下文 - 用于在组件间共享主题状态
 */
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

/**
 * 主题提供者组件 - 管理全局主题状态
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初始化主题模式状态
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('theme-mode');
      return (saved as ThemeMode) || 'auto';
    } catch {
      return 'auto';
    }
  });

  /**
   * 检测系统主题偏好
   */
  const getSystemTheme = useCallback((): boolean => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }, []);

  /**
   * 解析主题模式为具体的暗色状态
   */
  const resolveIsDark = useCallback((mode: ThemeMode): boolean => {
    switch (mode) {
      case 'light':
        return false;
      case 'dark':
        return true;
      case 'auto':
        return getSystemTheme();
      default:
        return false;
    }
  }, [getSystemTheme]);

  // 初始化暗色模式状态
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme-mode') as ThemeMode;
      const mode = saved || 'auto';
      return resolveIsDark(mode);
    } catch {
      return false;
    }
  });

  /**
   * 应用主题到DOM - 确保DOM操作的原子性和即时性
   */
  const applyTheme = useCallback((dark: boolean) => {
    try {
      const root = document.documentElement;
      
      // 强制同步DOM更新，确保立即应用
      if (dark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
      
      // 触发重绘以确保样式立即应用
      document.body.offsetHeight;
      
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }, []);

  /**
   * 切换主题模式 - 确保状态和DOM完全同步更新
   */
  const setTheme = useCallback((mode: ThemeMode) => {
    try {
      // 1. 先计算新的isDark值
      const newIsDark = resolveIsDark(mode);
      
      // 2. 立即应用DOM变化
      applyTheme(newIsDark);
      
      // 3. 批量更新所有状态，减少重渲染次数
      setThemeMode(mode);
      setIsDark(newIsDark);
      
      // 4. 保存到localStorage
      localStorage.setItem('theme-mode', mode);
      
    } catch (error) {
      console.warn('Failed to set theme:', error);
    }
  }, [resolveIsDark, applyTheme]);

  /**
   * 计算当前主题配色方案
   */
  const colors = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'auto') {
        const newIsDark = mediaQuery.matches;
        setIsDark(newIsDark);
        applyTheme(newIsDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  /**
   * 组件挂载时初始化主题
   */
  useEffect(() => {
    applyTheme(isDark);
  }, [applyTheme, isDark]);

  // 构建上下文值
  const value = useMemo(() => ({
    themeMode,
    isDark,
    colors,
    setTheme,
  }), [themeMode, isDark, colors, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 主题Hook - 消费主题上下文
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};