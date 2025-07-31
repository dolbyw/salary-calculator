import React, { useState, useEffect } from 'react';
import { X, Hand, ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';
import { ClayCard, ClayCardContent, ClayCardTitle } from './ui/ClayCard';
import { ClayButton } from './ui/ClayButton';
import { useTouchDevice } from '../hooks/useTouchDevice';
import { cn } from '../lib/utils';

interface TouchHelpOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 触屏帮助覆盖层组件
 * 显示触屏手势使用说明
 */
export const TouchHelpOverlay: React.FC<TouchHelpOverlayProps> = ({
  isVisible,
  onClose
}) => {
  const { isTouchDevice, isMobile } = useTouchDevice();
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: <ArrowLeft className="w-8 h-8 text-purple-500" />,
      title: "左右滑动切换页面",
      description: "在屏幕上向左或向右滑动可以快速切换计算器、历史记录和设置页面",
      gesture: "swipe"
    },
    {
      icon: <Hand className="w-8 h-8 text-green-500" />,
      title: "从左边缘滑动显示导航",
      description: "从屏幕左边缘向右滑动可以显示导航栏，或者双击左边缘",
      gesture: "edge-swipe"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-pink-500" />,
      title: "触觉反馈",
      description: "按钮和交互元素提供触觉反馈，让操作更有感觉",
      gesture: "haptic"
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentTip(0);
    }
  }, [isVisible]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  if (!isVisible || !isTouchDevice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "relative max-w-md mx-4",
        isMobile ? "w-full" : "w-96"
      )}>
        <ClayCard variant="default" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <ClayCardTitle className="mb-0">触屏操作指南</ClayCardTitle>
            <ClayButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </ClayButton>
          </div>

          <ClayCardContent>
            <div className="space-y-6">
              {/* 当前提示 */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {tips[currentTip].icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {tips[currentTip].title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {tips[currentTip].description}
                </p>
              </div>

              {/* 手势演示动画 */}
              <div className="flex justify-center">
                <div className={cn(
                  "relative w-32 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border-2 border-slate-300",
                  "overflow-hidden"
                )}>
                  {tips[currentTip].gesture === 'swipe' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-purple-400 rounded-full animate-pulse" />
                      <ArrowRight className="w-4 h-4 text-purple-600 ml-2 animate-bounce" />
                    </div>
                  )}
                  {tips[currentTip].gesture === 'edge-swipe' && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-8 bg-green-400 rounded-r animate-pulse" />
                      <ArrowRight className="w-4 h-4 text-green-600 ml-1 animate-bounce" />
                    </div>
                  )}
                  {tips[currentTip].gesture === 'haptic' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-pink-400 rounded-lg animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* 导航点 */}
              <div className="flex justify-center space-x-2">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTip(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentTip === index
                        ? "bg-purple-500 scale-125"
                        : "bg-slate-300 hover:bg-slate-400"
                    )}
                  />
                ))}
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between items-center pt-4">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={prevTip}
                  disabled={currentTip === 0}
                >
                  上一个
                </ClayButton>
                
                <span className="text-sm text-slate-500">
                  {currentTip + 1} / {tips.length}
                </span>
                
                {currentTip === tips.length - 1 ? (
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={onClose}
                  >
                    开始使用
                  </ClayButton>
                ) : (
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={nextTip}
                  >
                    下一个
                  </ClayButton>
                )}
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>
      </div>
    </div>
  );
};

/**
 * 触屏帮助按钮组件
 */
interface TouchHelpButtonProps {
  className?: string;
}

export const TouchHelpButton: React.FC<TouchHelpButtonProps> = ({ className }) => {
  const { isTouchDevice } = useTouchDevice();
  const [showHelp, setShowHelp] = useState(false);
  const [hasShownHelp, setHasShownHelp] = useState(false);

  useEffect(() => {
    // 检查是否已经显示过帮助
    const hasShown = localStorage.getItem('touch-help-shown');
    if (!hasShown && isTouchDevice) {
      // 首次使用触屏设备时自动显示帮助
      setTimeout(() => {
        setShowHelp(true);
      }, 2000);
    }
    setHasShownHelp(!!hasShown);
  }, [isTouchDevice]);

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
    localStorage.setItem('touch-help-shown', 'true');
    setHasShownHelp(true);
  };

  if (!isTouchDevice) {
    return null;
  }

  return (
    <>
      <ClayButton
        variant="secondary"
        size="sm"
        onClick={handleShowHelp}
        className={cn("flex items-center gap-2", className)}
      >
        <Hand className="w-4 h-4" />
        触屏帮助
      </ClayButton>
      
      <TouchHelpOverlay
        isVisible={showHelp}
        onClose={handleCloseHelp}
      />
    </>
  );
};