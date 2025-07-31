import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { ClayButton } from './ClayButton';

/**
 * 年月选择对话框的属性接口
 */
interface MonthPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (year: number, month: number) => void;
  title?: string;
  defaultYear?: number;
  defaultMonth?: number;
}

/**
 * 年月选择对话框组件
 * 用于在保存数据时选择年月，采用粘土拟态设计风格
 */
export const MonthPickerDialog: React.FC<MonthPickerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '选择年月',
  defaultYear,
  defaultMonth,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(defaultYear || currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth || currentDate.getMonth() + 1);

  /**
   * 生成年份选项（最近10年）
   */
  const generateYearOptions = () => {
    const currentYear = currentDate.getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  /**
   * 生成月份选项
   */
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  /**
   * 处理确认按钮点击
   */
  const handleConfirm = () => {
    onConfirm(selectedYear, selectedMonth);
    onClose();
  };

  /**
   * 处理取消按钮点击
   */
  const handleCancel = () => {
    // 重置为默认值
    setSelectedYear(defaultYear || currentDate.getFullYear());
    setSelectedMonth(defaultMonth || currentDate.getMonth() + 1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        {/* 对话框容器 */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-200 scale-100"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* 对话框头部 */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* 对话框内容 */}
          <div className="p-6 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              请选择此次薪资数据对应的年月：
            </div>

            {/* 年月选择器 */}
            <div className="space-y-4">
              {/* 年份选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  年份
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 transition-all duration-200 appearance-none cursor-pointer hover:bg-slate-100"
                  >
                    {generateYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 月份选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  月份
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {generateMonthOptions().map((month) => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          selectedMonth === month
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                        }
                      `}
                      style={{
                        boxShadow: selectedMonth === month 
                          ? '0 10px 25px -5px rgba(139, 92, 246, 0.4)' 
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {month}月
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 选择预览 */}

          </div>

          {/* 对话框底部 */}
          <div className="flex gap-3 p-6 border-t border-slate-200">
            <ClayButton
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              取消
            </ClayButton>
            <ClayButton
              variant="primary"
              onClick={handleConfirm}
              className="flex-1"
            >
              确认
            </ClayButton>
          </div>
        </div>
      </div>
    </>
  );
};