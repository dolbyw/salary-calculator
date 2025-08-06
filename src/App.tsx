import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';
import { SalaryCalculator } from './components/SalaryCalculator';
import { SalaryHistory } from './components/SalaryHistory';
import { SalarySettings } from './components/SalarySettings';
import { SwipeNavigation } from './components/TouchGestureHandler';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { useSalaryStore } from './store/salaryStore';
import { useTheme } from './hooks/useTheme';
import { useTouchDevice } from './hooks/useTouchDevice';
import { usePWA } from './hooks/usePWA';
import { cn } from './lib/utils';

/**
 * 主应用组件
 */
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'history' | 'settings'>('calculator');
  const { calculateSalary } = useSalaryStore();
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { isDark, colors } = useTheme();
  const { confirmDialog, closeConfirmDialog } = usePWA();
  
  // 页面顺序，用于滑动导航
  const pageOrder: ('calculator' | 'history' | 'settings')[] = ['calculator', 'history', 'settings'];

  // 初始化时计算一次薪资
  useEffect(() => {
    calculateSalary();
  }, [calculateSalary]);

  /**
   * 获取当前页面的背景色 - 使用useMemo确保正确响应主题变化
   */
  const getCurrentPageBackground = React.useMemo(() => {
    switch (currentPage) {
      case 'calculator':
        return colors.background.calculator;
      case 'history':
        return colors.background.history;
      case 'settings':
        return colors.background.settings;
      default:
        return colors.background.calculator;
    }
  }, [currentPage, colors.background]);

  /**
   * 渲染当前页面内容 - 使用useMemo优化
   */
  const renderCurrentPage = useMemo(() => {
    switch (currentPage) {
      case 'calculator':
        return <SalaryCalculator />;
      case 'history':
        return <SalaryHistory />;
      case 'settings':
        return <SalarySettings />;
      default:
        return <SalaryCalculator />;
    }
  }, [currentPage]);

  const handlePageChange = useCallback((page: 'calculator' | 'history' | 'settings') => {
    setCurrentPage(page);
  }, []);

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 ease-out",
      getCurrentPageBackground
    )}>
      {/* PWA安装提示 */}
      <PWAInstallPrompt />
      
      {/* 离线状态指示器 */}
      <OfflineIndicator />
      
      {/* 悬浮导航栏 */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* 主容器 - 支持触屏滑动导航 */}
      <SwipeNavigation
        currentPage={currentPage}
        pages={pageOrder}
        onPageChange={handlePageChange}
        className={cn(
          "container mx-auto max-w-5xl transition-all duration-300",
          isTouchDevice ? (
            isMobile ? "px-4 py-4 pb-20" : "px-6 py-6 pb-24"
          ) : "px-3 py-4 pb-20"
        )}
      >
        {/* 页面内容区域 */}
        <div className={cn(
          "transition-all duration-300 ease-out",
          isTouchDevice && "touch-manipulation"
        )}>
          <main className={cn(
            "transition-all duration-300",
            isMobile ? "space-y-4" : isTouchDevice ? "space-y-5" : "space-y-6"
          )}>
            {renderCurrentPage}
          </main>
        </div>
        
        {/* 触屏设备页面指示器 - 优化手机屏幕适配 */}
        {isTouchDevice && (
          <div className={cn(
            "fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300",
            isMobile ? "bottom-4" : "bottom-8"
          )}>
            <div className={cn(
              'flex backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 border',
              colors.indicator.background,
              colors.indicator.border,
              isMobile ? 'space-x-2 px-3 py-2' : 'space-x-2 px-3 py-2'
            )}>
              {pageOrder.map((page, index) => {
                const isActive = currentPage === page;
                const pageLabels = {
                  calculator: '计算器',
                  history: '历史记录', 
                  settings: '设置'
                };
                
                return (
                  <button
                     key={page}
                     onClick={() => handlePageChange(page)}
                     className={cn(
                       'rounded-full transition-all duration-300 transform-gpu flex items-center justify-center',
                       'active:scale-90 touch-manipulation',
                       isMobile ? 'px-4 py-2 text-xs min-w-[3.5rem] h-8' : 'w-2.5 h-2.5',
                       // 根据页面类型设置对应颜色
                       page === 'calculator' && (
                         isActive 
                           ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                           : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300'
                       ),
                       page === 'history' && (
                         isActive 
                           ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm'
                           : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 hover:from-emerald-200 hover:to-emerald-300'
                       ),
                       page === 'settings' && (
                         isActive 
                           ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm'
                           : 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 hover:from-pink-200 hover:to-pink-300'
                       ),
                       // 黑夜模式下的颜色
                       isDark && page === 'calculator' && (
                         isActive 
                           ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                           : 'bg-gradient-to-r from-blue-800/60 to-blue-900/60 text-blue-200 hover:from-blue-700/60 hover:to-blue-800/60'
                       ),
                       isDark && page === 'history' && (
                         isActive 
                           ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm'
                           : 'bg-gradient-to-r from-emerald-800/60 to-emerald-900/60 text-emerald-200 hover:from-emerald-700/60 hover:to-emerald-800/60'
                       ),
                       isDark && page === 'settings' && (
                         isActive 
                           ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-sm'
                           : 'bg-gradient-to-r from-pink-800/60 to-pink-900/60 text-pink-200 hover:from-pink-700/60 hover:to-pink-800/60'
                       )
                     )}
                     aria-label={`切换到${pageLabels[page]}页面`}
                   >
                     {isMobile && (
                       <span className="text-xs font-medium whitespace-nowrap">
                         {pageLabels[page] === '计算器' ? '计算' : 
                          pageLabels[page] === '历史记录' ? '历史' : 
                          '设置'}
                       </span>
                     )}
                   </button>
                );
              })}
            </div>
          </div>
        )}
      </SwipeNavigation>

      {/* Toast 通知 - 触屏设备优化 */}
      <Toaster
          position={isTouchDevice ? 'bottom-center' : 'top-right'}
          toastOptions={{
            duration: isTouchDevice ? 4000 : 3000, // 触屏设备显示更长时间
            className: cn(
              colors.toast.background,
              colors.toast.border,
              colors.toast.text,
              colors.toast.shadow,
              'rounded-2xl font-medium',
              isTouchDevice ? 'text-base p-4 min-h-12' : 'text-sm p-3'
            ),
          }}
        />
      
      {/* 确认对话框 */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onClose={confirmDialog.onCancel || closeConfirmDialog}
      />
    </div>
  );
}

// 使用React.memo优化组件性能
export default React.memo(App);
