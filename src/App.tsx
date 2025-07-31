import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { SalaryCalculator } from './components/SalaryCalculator';
import { SalaryHistory } from './components/SalaryHistory';
import { SalarySettings } from './components/SalarySettings';
import { SwipeNavigation } from './components/TouchGestureHandler';

import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useSalaryStore } from './store/salaryStore';
import { useTouchDevice } from './hooks/useTouchDevice';

/**
 * 主应用组件
 */
function App() {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'history' | 'settings'>('calculator');
  const { calculateSalary } = useSalaryStore();
  const { isTouchDevice, isMobile } = useTouchDevice();
  
  // 页面顺序，用于滑动导航
  const pageOrder = ['calculator', 'history', 'settings'] as const;

  // 初始化时计算一次薪资
  useEffect(() => {
    calculateSalary();
  }, [calculateSalary]);

  /**
   * 渲染当前页面内容
   */
  const renderCurrentPage = () => {
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
  };

  const handlePageChange = (page: 'calculator' | 'history' | 'settings') => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
        className={`container mx-auto px-3 py-4 max-w-5xl ${isTouchDevice ? 'pb-24' : 'pb-20'}`}
      >
        {/* 页面内容区域 */}
        <div className={`transition-all duration-300 ease-out ${
          isTouchDevice ? 'touch-manipulation' : ''
        }`}>
          <main className={isMobile ? 'space-y-4' : 'space-y-6'}>
            {renderCurrentPage()}
          </main>
        </div>
        
        {/* 触屏设备页面指示器 */}
        {isTouchDevice && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
              {pageOrder.map((page, index) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-purple-500 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`切换到${page === 'calculator' ? '计算器' : page === 'history' ? '历史记录' : '设置'}页面`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </SwipeNavigation>

      {/* Toast 通知 - 触屏设备优化 */}
      <Toaster
        position={isMobile ? "top-center" : "top-center"}
        toastOptions={{
          duration: isTouchDevice ? 4000 : 3000, // 触屏设备显示更长时间
          style: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '2px solid #e2e8f0',
            borderRadius: isTouchDevice ? '20px' : '16px',
            color: '#334155',
            fontSize: isTouchDevice ? '16px' : '14px',
            fontWeight: '500',
            boxShadow: '4px 4px 12px rgba(148, 163, 184, 0.2), -4px -4px 12px rgba(255, 255, 255, 0.8)',
            padding: isTouchDevice ? '16px 20px' : '12px 16px',
            minHeight: isTouchDevice ? '48px' : 'auto',
          },
        }}
      />
    </div>
  );
}

export default App;
