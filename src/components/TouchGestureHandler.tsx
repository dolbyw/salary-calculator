import React, { useRef, useCallback, useEffect } from 'react';
import { useTouch, useTouchDevice } from '../hooks/useTouchDevice';

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * 触屏手势处理组件
 * 支持滑动、双击、长按等手势
 */
export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  className,
  disabled = false
}) => {
  const { isTouchDevice } = useTouchDevice();
  const { handleTouchStart, handleTouchEnd, getSwipeDirection, isTap } = useTouch();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const handleTouchStartWrapper = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice) return;
    
    handleTouchStart(e);
    isLongPressRef.current = false;
    
    // 长按检测
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, 500); // 500ms 长按阈值
    }
  }, [disabled, isTouchDevice, handleTouchStart, onLongPress]);

  const handleTouchEndWrapper = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice) return;
    
    handleTouchEnd(e);
    
    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    // 如果是长按，不处理其他手势
    if (isLongPressRef.current) {
      return;
    }
    
    const swipeDirection = getSwipeDirection();
    
    if (swipeDirection) {
      // 处理滑动手势
      switch (swipeDirection) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    } else if (isTap() && onDoubleTap) {
      // 处理双击
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        onDoubleTap();
      }
      lastTapRef.current = now;
    }
  }, [disabled, isTouchDevice, handleTouchEnd, getSwipeDirection, isTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice) return;
    
    // 如果有滑动，取消长按
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }, [disabled, isTouchDevice]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (!isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStartWrapper}
      onTouchEnd={handleTouchEndWrapper}
      onTouchMove={handleTouchMove}
      style={{
        touchAction: 'pan-y', // 允许垂直滚动，但阻止水平滚动和缩放
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  );
};

/**
 * 页面滑动导航组件
 * 支持左右滑动切换页面
 */
interface SwipeNavigationProps {
  children: React.ReactNode;
  currentPage: string;
  pages: string[];
  onPageChange: (page: string) => void;
  className?: string;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  currentPage,
  pages,
  onPageChange,
  className
}) => {
  const { isTouchDevice } = useTouchDevice();

  const handleSwipeLeft = useCallback(() => {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex < pages.length - 1) {
      onPageChange(pages[currentIndex + 1]);
    }
  }, [currentPage, pages, onPageChange]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      onPageChange(pages[currentIndex - 1]);
    }
  }, [currentPage, pages, onPageChange]);

  if (!isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <TouchGestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className={className}
    >
      {children}
    </TouchGestureHandler>
  );
};