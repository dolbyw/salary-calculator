import { useState, useEffect } from 'react';

/**
 * 检测触屏设备的自定义Hook
 */
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    const checkDevice = () => {
      // 检测触屏支持
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);

      // 检测屏幕方向
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);

      // 检测屏幕尺寸
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isTouchDevice,
    isLandscape,
    screenSize,
    isMobile: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg'
  };
};

/**
 * 触屏手势处理Hook
 */
export const useTouch = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent | React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  };

  const handleTouchEnd = (e: TouchEvent | React.TouchEvent) => {
    const touch = e.changedTouches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const getSwipeDirection = () => {
    if (!touchStart || !touchEnd) return null;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 最小滑动距离
    const minSwipeDistance = 50;

    if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
      return null;
    }

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  const getSwipeDistance = () => {
    if (!touchStart || !touchEnd) return 0;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const isTap = () => {
    return getSwipeDistance() < 10;
  };

  return {
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
    getSwipeDistance,
    isTap,
    touchStart,
    touchEnd
  };
};

/**
 * 触觉反馈Hook
 */
export const useHapticFeedback = () => {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const triggerSuccess = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  const triggerError = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError
  };
};