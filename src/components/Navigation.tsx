import React, { useState, useEffect, useRef } from 'react';
import { Calculator, History, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationProps {
  currentPage: 'calculator' | 'history' | 'settings';
  onPageChange: (page: 'calculator' | 'history' | 'settings') => void;
}

/**
 * 悬浮导航组件 - 固定在左下角，支持智能吸附和自动滑出
 */
export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 鼠标位置检测
  useEffect(() => {
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
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const navItems = [
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
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-60"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-1.5 shadow-[6px_6px_20px_rgba(148,163,184,0.25),-6px_-6px_20px_rgba(255,255,255,0.9)] backdrop-blur-sm border border-white/20">
        <div className="flex flex-col space-y-1.5">
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
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  'font-medium transition-all duration-300 ease-out',
                  'transform-gpu will-change-transform',
                  'focus:outline-none focus:ring-0',
                  // 悬停和按压效果
                  !isActive && 'hover:scale-110 active:scale-95',
                  isActive && 'scale-105',
                  // 颜色样式
                  getItemStyles(item.id, item.color)
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
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