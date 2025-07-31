import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { SalaryCalculator } from './components/SalaryCalculator';
import { SalaryHistory } from './components/SalaryHistory';
import { SalarySettings } from './components/SalarySettings';
import { useSalaryStore } from './store/salaryStore';

/**
 * 主应用组件
 */
function App() {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'history' | 'settings'>('calculator');
  const { calculateSalary } = useSalaryStore();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* 悬浮导航栏 */}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* 主容器 */}
      <div className="container mx-auto px-3 py-4 max-w-5xl">
        {/* 页面内容 */}
        <main className="">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Toast 通知 */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            color: '#334155',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '4px 4px 12px rgba(148, 163, 184, 0.2), -4px -4px 12px rgba(255, 255, 255, 0.8)',
          },
        }}
      />
    </div>
  );
}

export default App;
