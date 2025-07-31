import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, History, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationProps {
  currentPage: 'calculator' | 'history' | 'settings' | 'pwa';
  onPageChange: (page: 'calculator' | 'history' | 'settings' | 'pwa') => void;
}

/**
 * 悬浮导航组件 - 固定在左下角，支持智能吸附和自动滑出
 */
export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  // 检测触屏设备
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    
    return () => {
      window.removeEventListener('resize', checkTouchDevice);
    };
  }, []);

  // 触屏手势处理
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 检测从左边缘向右滑动手势
    if (touchStartX < 50 && deltaX > 50 && Math.abs(deltaY) < 100) {
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 触屏设备上显示更长时间
      timeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setIsVisible(false);
        }
      }, 3000);
    }
    
    // 检测双击屏幕边缘显示导航
    const now = Date.now();
    if (touchStartX < 100 && distance < 20) {
      if (now - lastTapRef.current < 300) {
        setIsVisible(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
      lastTapRef.current = now;
    }
  }, [touchStartX, touchStartY, isHovered]);

  // 鼠标位置检测（仅非触屏设备）
  useEffect(() => {
    if (isTouchDevice) {
      // 触屏设备使用触摸事件
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
    
    // 非触屏设备使用鼠标事件
    const handleMouseMove = (e: MouseEvent) => {
      const navElement = navRef.current;
      if (!navElement) return;

      const rect = navElement.getBoundingClientRect();
      const buffer = 100; // 检测缓冲区域
      
      // 检测鼠标是否在导航栏附近
      const isNearNav = 
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer;

      if (isNearNav || isHovered) {
        setIsVisible(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        // 延迟隐藏，避免频繁切换
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          if (!isHovered) {
            setIsVisible(false);
          }
        }, 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered, isTouchDevice, handleTouchStart, handleTouchEnd]);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsHovered(false);
    }
  };

  // 触屏设备的触摸处理
  const handleTouchStartNav = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsHovered(true);
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTouchEndNav = () => {
    if (isTouchDevice) {
      setIsHovered(false);
      // 触屏设备延迟隐藏
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  };
  // 根据当前页面显示不同的导航项
  const getNavItems = () => {
    if (currentPage === 'pwa') {
      return [
        {
          id: 'settings' as const,
          label: '返回设置',
          icon: ArrowLeft,
          color: 'gray',
        },
      ];
    }
    
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