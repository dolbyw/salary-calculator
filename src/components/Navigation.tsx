import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calculator, History, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTouchDevice } from '../hooks/useTouchDevice';

/**
 * 导航组件属性接口
 */
interface NavigationProps {
  currentPage: 'calculator' | 'history' | 'settings';
  onPageChange: (page: 'calculator' | 'history' | 'settings') => void;
}

/**
 * 悬浮导航组件 - 固定在左下角，支持智能吸附和自动滑出
 * 优化了触屏交互的稳定性和可用性
 */
export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);
  const debounceRef = useRef<NodeJS.Timeout>();
  
  // 使用统一的触屏设备检测Hook
  const { isTouchDevice, isMobile } = useTouchDevice();

  /**
   * 防抖函数 - 避免频繁的状态切换
   */
  const debounceSetVisible = useCallback((visible: boolean, delay: number = 100) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setIsVisible(visible);
    }, delay);
  }, []);

  /**
   * 清理所有定时器
   */
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
  }, []);

  /**
   * 触屏手势处理 - 优化了边缘检测和稳定性
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isTouchDevice) return;
    
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  }, [isTouchDevice]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isTouchDevice) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 优化边缘滑动检测 - 增加灵敏度和容错性
    const edgeThreshold = isMobile ? 60 : 50; // 移动设备增加边缘检测范围
    const swipeThreshold = isMobile ? 40 : 50; // 移动设备降低滑动阈值
    const verticalTolerance = isMobile ? 120 : 100; // 移动设备增加垂直容错
    
    if (touchStartX < edgeThreshold && deltaX > swipeThreshold && Math.abs(deltaY) < verticalTolerance) {
      clearAllTimers();
      setIsVisible(true);
      
      // 根据设备类型调整显示时间
      const displayDuration = isMobile ? 4000 : 3000;
      timeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          debounceSetVisible(false, 200);
        }
      }, displayDuration);
    }
    
    // 优化双击边缘检测
    const now = Date.now();
    const tapThreshold = isMobile ? 120 : 100;
    const tapTolerance = isMobile ? 30 : 20;
    
    if (touchStartX < tapThreshold && distance < tapTolerance) {
      const timeSinceLastTap = now - lastTapRef.current;
      if (timeSinceLastTap < 400 && timeSinceLastTap > 50) { // 防止误触
        clearAllTimers();
        setIsVisible(true);
        // 双击后显示更长时间
        timeoutRef.current = setTimeout(() => {
          if (!isHovered) {
            debounceSetVisible(false, 200);
          }
        }, 5000);
      }
      lastTapRef.current = now;
    }
  }, [touchStartX, touchStartY, isHovered, isTouchDevice, isMobile, clearAllTimers, debounceSetVisible]);

  /**
   * 事件监听器管理 - 分离触屏和鼠标事件处理
   */
  useEffect(() => {
    if (isTouchDevice) {
      // 触屏设备事件监听
      const options = { passive: true, capture: false };
      document.addEventListener('touchstart', handleTouchStart, options);
      document.addEventListener('touchend', handleTouchEnd, options);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
        clearAllTimers();
      };
    }
  }, [isTouchDevice, handleTouchStart, handleTouchEnd, clearAllTimers]);

  /**
   * 鼠标事件处理（仅非触屏设备）
   */
  useEffect(() => {
    if (isTouchDevice) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const navElement = navRef.current;
      if (!navElement) return;

      const rect = navElement.getBoundingClientRect();
      const buffer = 120; // 增加检测缓冲区域
      
      // 检测鼠标是否在导航栏附近
      const isNearNav = 
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer;

      if (isNearNav || isHovered) {
        clearAllTimers();
        setIsVisible(true);
      } else {
        // 使用防抖延迟隐藏
        clearAllTimers();
        timeoutRef.current = setTimeout(() => {
          if (!isHovered) {
            debounceSetVisible(false, 100);
          }
        }, 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearAllTimers();
    };
  }, [isHovered, isTouchDevice, clearAllTimers, debounceSetVisible]);

  /**
   * 鼠标交互处理（仅非触屏设备）
   */
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      setIsHovered(true);
      clearAllTimers();
      setIsVisible(true);
    }
  }, [isTouchDevice, clearAllTimers]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      setIsHovered(false);
    }
  }, [isTouchDevice]);

  /**
   * 导航栏直接触摸处理 - 优化了触屏交互
   */
  const handleTouchStartNav = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    e.stopPropagation();
    setIsHovered(true);
    clearAllTimers();
    setIsVisible(true);
  }, [isTouchDevice, clearAllTimers]);

  const handleTouchEndNav = useCallback(() => {
    if (!isTouchDevice) return;
    
    setIsHovered(false);
    // 根据设备类型调整隐藏延迟
    const hideDelay = isMobile ? 3000 : 2500;
    timeoutRef.current = setTimeout(() => {
      debounceSetVisible(false, 200);
    }, hideDelay);
  }, [isTouchDevice, isMobile, debounceSetVisible]);

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  // 根据当前页面显示不同的导航项
  const getNavItems = () => {
    return [
      {
        id: 'calculator' as const,
        label: '薪资计算',
        icon: Calculator,
        color: 'purple',
      },
      {
        id: 'history' as const,
        label: '历史记录',
        icon: History,
        color: 'green',
      },
      {
        id: 'settings' as const,
        label: '设置',
        icon: Settings,
        color: 'pink',
      },
    ];
  };
  
  const navItems = getNavItems();

  const getItemStyles = (itemId: string, color: string) => {
    const isActive = currentPage === itemId;
    
    const colorStyles = {
      purple: {
        active: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-[4px_4px_12px_rgba(139,92,246,0.4),-4px_-4px_12px_rgba(167,139,250,0.4)]',
        inactive: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 hover:shadow-[2px_2px_8px_rgba(139,92,246,0.2),-2px_-2px_8px_rgba(167,139,250,0.2)]',
      },
      green: {
        active: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[4px_4px_12px_rgba(52,211,153,0.4),-4px_-4px_12px_rgba(110,231,183,0.4)]',
        inactive: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:shadow-[2px_2px_8px_rgba(52,211,153,0.2),-2px_-2px_8px_rgba(110,231,183,0.2)]',
      },
      pink: {
        active: 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-[4px_4px_12px_rgba(244,114,182,0.4),-4px_-4px_12px_rgba(251,182,206,0.4)]',
        inactive: 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 hover:from-pink-100 hover:to-pink-200 hover:shadow-[2px_2px_8px_rgba(244,114,182,0.2),-2px_-2px_8px_rgba(251,182,206,0.2)]',
      },
      gray: {
        active: 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-[4px_4px_12px_rgba(107,114,128,0.4),-4px_-4px_12px_rgba(156,163,175,0.4)]',
        inactive: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-[2px_2px_8px_rgba(107,114,128,0.2),-2px_-2px_8px_rgba(156,163,175,0.2)]',
      },
    };

    return isActive 
      ? colorStyles[color as keyof typeof colorStyles].active
      : colorStyles[color as keyof typeof colorStyles].inactive;
  };

  return (
    <nav 
      ref={navRef}
      className={cn(
        "fixed bottom-4 left-4 z-50 transition-all duration-500 ease-out",
        "touch-none select-none", // 防止触屏时的默认行为
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-60",
        // 触屏设备优化
        isTouchDevice && [
          "bottom-6 left-6", // 触屏设备增加边距
          !isVisible && "-translate-x-20" // 触屏设备隐藏更多
        ]
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStartNav}
      onTouchEnd={handleTouchEndNav}
    >
      <div className={cn(
        "bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-[6px_6px_20px_rgba(148,163,184,0.25),-6px_-6px_20px_rgba(255,255,255,0.9)] backdrop-blur-sm border border-white/20",
        // 触屏设备优化间距
        isTouchDevice ? "p-2" : "p-1.5"
      )}>
        <div className={cn(
          "flex flex-col",
          // 触屏设备增加间距
          isTouchDevice ? "space-y-2" : "space-y-1.5"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                title={item.label}
                className={cn(
                  // 基础样式
                  'flex items-center justify-center rounded-lg',
                  'font-medium transition-all duration-300 ease-out',
                  'transform-gpu will-change-transform',
                  'focus:outline-none focus:ring-0',
                  // 触屏设备优化尺寸
                  isTouchDevice ? 'w-12 h-12 text-lg' : 'w-10 h-10',
                  // 触屏友好的触觉反馈
                  isTouchDevice && [
                    'active:scale-90 active:brightness-110',
                    'touch-manipulation', // 优化触屏响应
                    !isActive && 'active:shadow-inner'
                  ],
                  // 鼠标设备的悬停效果
                  !isTouchDevice && [
                    !isActive && 'hover:scale-110 active:scale-95',
                    isActive && 'scale-105'
                  ],
                  // 触屏设备的激活状态
                  isTouchDevice && isActive && 'scale-110',
                  // 颜色样式
                  getItemStyles(item.id, item.color)
                )}
              >
                <Icon className={cn(
                  // 触屏设备图标更大
                  isTouchDevice ? 'w-6 h-6' : 'w-5 h-5',
                  isActive ? 'text-white' : 'text-current'
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};