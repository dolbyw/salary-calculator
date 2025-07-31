import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Calculator, History, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTouchDevice } from '../hooks/useTouchDevice';
import { useTheme } from '../hooks/useTheme';

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
const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);
  const debounceRef = useRef<NodeJS.Timeout>();
  
  // 使用统一的触屏设备检测Hook和主题Hook
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { isDark, colors } = useTheme();

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
   * 统一的触屏手势处理
   */
  const handleTouchGesture = useCallback((e: TouchEvent) => {
    if (!isTouchDevice) return;
    
    if (e.type === 'touchstart') {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);
    } else if (e.type === 'touchend') {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // 边缘滑动检测
      const edgeThreshold = isMobile ? 60 : 50;
      const swipeThreshold = isMobile ? 40 : 50;
      const verticalTolerance = isMobile ? 120 : 100;
      
      if (touchStartX < edgeThreshold && deltaX > swipeThreshold && Math.abs(deltaY) < verticalTolerance) {
        clearAllTimers();
        setIsVisible(true);
        
        const displayDuration = isMobile ? 4000 : 3000;
        timeoutRef.current = setTimeout(() => {
          if (!isHovered) {
            debounceSetVisible(false, 200);
          }
        }, displayDuration);
      }
      
      // 双击边缘检测
      const now = Date.now();
      const tapThreshold = isMobile ? 120 : 100;
      const tapTolerance = isMobile ? 30 : 20;
      
      if (touchStartX < tapThreshold && distance < tapTolerance) {
        const timeSinceLastTap = now - lastTapRef.current;
        if (timeSinceLastTap < 400 && timeSinceLastTap > 50) {
          clearAllTimers();
          setIsVisible(true);
          timeoutRef.current = setTimeout(() => {
            if (!isHovered) {
              debounceSetVisible(false, 200);
            }
          }, 5000);
        }
        lastTapRef.current = now;
      }
    }
  }, [touchStartX, touchStartY, isHovered, isTouchDevice, isMobile, clearAllTimers, debounceSetVisible]);

  /**
   * 事件监听器管理 - 统一的触屏事件处理
   */
  useEffect(() => {
    if (isTouchDevice) {
      const options = { passive: true, capture: false };
      document.addEventListener('touchstart', handleTouchGesture, options);
      document.addEventListener('touchend', handleTouchGesture, options);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchGesture);
        document.removeEventListener('touchend', handleTouchGesture);
        clearAllTimers();
      };
    }
  }, [isTouchDevice, handleTouchGesture, clearAllTimers]);

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
   * 统一的鼠标交互处理
   */
  const handleMouseInteraction = useCallback((type: 'enter' | 'leave') => {
    if (isTouchDevice) return;
    
    if (type === 'enter') {
      setIsHovered(true);
      clearAllTimers();
      setIsVisible(true);
    } else {
      setIsHovered(false);
    }
  }, [isTouchDevice, clearAllTimers]);

  /**
   * 导航栏直接触摸处理
   */
  const handleNavTouch = useCallback((e: React.TouchEvent, type: 'start' | 'end') => {
    if (!isTouchDevice) return;
    
    if (type === 'start') {
      e.stopPropagation();
      setIsHovered(true);
      clearAllTimers();
      setIsVisible(true);
    } else {
      setIsHovered(false);
      const hideDelay = isMobile ? 3000 : 2500;
      timeoutRef.current = setTimeout(() => {
        debounceSetVisible(false, 200);
      }, hideDelay);
    }
  }, [isTouchDevice, isMobile, clearAllTimers, debounceSetVisible]);

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  // 根据当前页面显示不同的导航项 - 使用useMemo优化
  const navItems = useMemo(() => [
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
  ], []);

  /**
   * 获取导航项样式 - 使用useMemo优化
   */
  /**
   * 获取导航项样式 - 修复useMemo依赖数组，确保主题切换时立即更新
   */
  const getItemStyles = useMemo(() => {
    return (itemId: string) => {
      const isActive = currentPage === itemId;
      
      if (isActive) {
        return `bg-gradient-to-br ${colors.navigation.activeItem} text-white`;
      }
      
      return `${colors.navigation.inactiveItem} ${colors.navigation.hoverItem}`;
    };
  }, [currentPage, colors.navigation.activeItem, colors.navigation.inactiveItem, colors.navigation.hoverItem]);

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
      onMouseEnter={() => handleMouseInteraction('enter')}
      onMouseLeave={() => handleMouseInteraction('leave')}
      onTouchStart={(e) => handleNavTouch(e, 'start')}
      onTouchEnd={(e) => handleNavTouch(e, 'end')}
    >
      <div className={cn(
        "rounded-xl backdrop-blur-sm transition-colors duration-300",
        colors.navigation.background,
        colors.navigation.border,
        colors.navigation.shadow,
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
                  getItemStyles(item.id)
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

// 使用React.memo优化组件性能
export default React.memo(Navigation);
export { Navigation };