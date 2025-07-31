import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * 月份选择器组件的属性接口
 */
interface MonthSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'purple' | 'green' | 'pink' | 'blue';
  availableMonths?: string[];
  className?: string;
}

/**
 * 月份选择器组件
 * 用于选择年月，支持粘土拟态设计风格
 */
export const MonthSelector: React.FC<MonthSelectorProps> = ({
  value,
  onChange,
  placeholder = '选择月份',
  variant = 'default',
  availableMonths = [],
  className = '',
}) => {
  /**
   * 获取变体样式
   */
  const getVariantStyles = () => {
    const baseStyles = 'relative w-full px-3 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none cursor-pointer';
    
    switch (variant) {
      case 'purple':
        return `${baseStyles} bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-300 hover:bg-purple-100`;
      case 'green':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800 focus:border-green-400 focus:ring-green-300 hover:bg-green-100`;
      case 'pink':
        return `${baseStyles} bg-pink-50 border-pink-200 text-pink-800 focus:border-pink-400 focus:ring-pink-300 hover:bg-pink-100`;
      case 'blue':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800 focus:border-blue-400 focus:ring-blue-300 hover:bg-blue-100`;
      default:
        return `${baseStyles} bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-400 focus:ring-slate-300 hover:bg-slate-100`;
    }
  };

  /**
   * 生成月份选项
   */
  const generateMonthOptions = () => {
    if (availableMonths.length > 0) {
      return availableMonths.map(month => ({
        value: month,
        label: formatMonthLabel(month)
      }));
    }

    // 如果没有提供可用月份，生成最近24个月
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push({
        value: monthValue,
        label: formatMonthLabel(monthValue)
      });
    }
    
    return options;
  };

  /**
   * 格式化月份标签
   */
  const formatMonthLabel = (monthValue: string): string => {
    const [year, month] = monthValue.split('-');
    return `${year}年${month}月`;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={getVariantStyles()}
        style={{
          backgroundImage: 'none',
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* 自定义下拉箭头 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};