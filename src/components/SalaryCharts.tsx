import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayButton } from './ui/ClayButton';
import { MonthSelector } from './ui/MonthSelector';
import { useSalaryStore, calculateSalaryDetails } from '../store/salaryStore';
import { useTouchDevice, useHapticFeedback } from '../hooks/useTouchDevice';
import { useTheme } from '../hooks/useTheme';
import { PieChart as PieChartIcon, TrendingUp, Download, Image } from 'lucide-react';
import { ChartData, MonthlySalaryStats } from '../types/salary';
import { cn } from '../lib/utils';
import html2canvas from 'html2canvas';

// Color palette for salary chart segments
const SALARY_COLORS = {
  baseSalary: '#8b5cf6',           // purple - base salary
  professionalAllowance: '#a78bfa', // light purple - professional allowance
  mealAllowance: '#c4b5fd',        // lighter purple - meal allowance
  nightShiftAllowance: '#ddd6fe',  // very light purple - night shift allowance
  cleanRoomAllowance: '#ede9fe',   // palest purple - clean room allowance
  customItems: '#f3e8ff',          // faint purple - other additions
  overtime1: '#10b981',            // green - overtime 1
  overtime2: '#34d399',            // light green - overtime 2
  overtime3: '#6ee7b7',            // lighter green - overtime 3
  other: '#94a3b8'                 // gray - other items
};

interface SalaryChartsProps {
  recordId?: string;
}

/**
 * 薪资图表组件
 */
export const SalaryCharts: React.FC<SalaryChartsProps> = ({ recordId }) => {
  const [activeChart, setActiveChart] = useState<'pie' | 'line'>('pie');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startMonth, setStartMonth] = useState<string>('');
  const [endMonth, setEndMonth] = useState<string>('');
  // 移除柱状图模式状态
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [enlargedChart, setEnlargedChart] = useState<'pie' | 'line' | null>(null);
  const [visibleCharts, setVisibleCharts] = useState<{
    pie: boolean;
    line: boolean;
  }>({ pie: false, line: false });
  const chartRef = useRef<HTMLDivElement>(null);
  
  // 触屏设备检测和触觉反馈
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { triggerHaptic } = useHapticFeedback();
  
  // 主题相关
  const { colors, isDark } = useTheme();
  
  // 设备信息获取函数
  const getDeviceInfo = () => {
    const isSmallScreen = window.innerWidth < 640;
    return { isTouchDevice, isMobile, isSmallScreen };
  };
  
  /**
   * 自定义饼图标签渲染函数
   * 显示项目名称、金额和百分比的紧凑布局
   */
  const renderCustomizedLabel = useCallback((props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name, value } = props;
    
    // 显示所有标签，包括小饼块
    // if (percent < 0.03) return null;
    
    const RADIAN = Math.PI / 180;
    const { isTouchDevice, isMobile, isSmallScreen } = getDeviceInfo();
    
    // 标签距离设置
    const labelDistance = isTouchDevice 
      ? (isMobile ? 25 : 30) 
      : (isSmallScreen ? 20 : 25);
    
    // 计算标签位置
    const radius = outerRadius + labelDistance;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // 文本对齐方式
    const textAnchor = x > cx ? 'start' : 'end';
    
    // 格式化金额
    const formattedValue = value.toLocaleString('zh-CN');
    const percentText = `${(percent * 100).toFixed(1)}%`;
    
    // 响应式字体大小
    const fontSize = isTouchDevice ? (isMobile ? 10 : 11) : 10;
    
    // 根据主题动态设置标签颜色
    const labelColor = isDark ? '#e2e8f0' : '#374151'; // 黑夜模式使用浅色，白天模式使用深色
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={labelColor}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="500"
        className="select-none"
      >
        {`${name} ¥${formattedValue} (${percentText})`}
      </text>
    );
  }, [isDark]);
  
  const { 
    getChartData, 
    getMonthlySalaryStats, 
    getAvailableMonths, 
    getFilteredMonthlySalaryStats, 
    getMonthlyChartData,
    records
  } = useSalaryStore();
  
  const availableMonths = getAvailableMonths();

  // 初始化折线图月份选择器默认值：默认从最早月份到最近月份
  useEffect(() => {
    if (!startMonth && !endMonth && availableMonths.length > 0) {
      // availableMonths 通常按降序排列（最新在前），因此最早月份位于数组末尾
      setStartMonth(availableMonths[availableMonths.length - 1]);
      setEndMonth(availableMonths[0]);
    }
  }, [availableMonths, startMonth, endMonth]);
  
  // 基于微软文档最佳实践的数据处理逻辑
  const pieData = useMemo(() => {
    const rawData = selectedMonth ? getMonthlyChartData(selectedMonth) : getChartData(recordId);
    
    // 微软文档建议：饼图类别应少于8个，提高可读性
    if (rawData.length > 7) {
      const total = rawData.reduce((sum, item) => sum + item.value, 0);
      // 使用5%阈值，符合微软Power BI最佳实践
      const threshold = total * 0.05;
      
      const significantItems = rawData.filter(item => item.value >= threshold);
      const minorItems = rawData.filter(item => item.value < threshold);
      
      // 将小项目合并为"其他"类别
      if (minorItems.length > 0) {
        const otherValue = minorItems.reduce((sum, item) => sum + item.value, 0);
        significantItems.push({
          name: '其他',
          value: otherValue,
          color: SALARY_COLORS.other
        });
      }
      
      // 按值降序排列，提升视觉效果
      return significantItems.sort((a, b) => b.value - a.value);
    }
    
    // 少于8个类别时，直接按值排序
    return rawData.sort((a, b) => b.value - a.value);
  }, [selectedMonth, recordId, getMonthlyChartData, getChartData]);
  
  const monthlyStats = (() => {
    if (activeChart === 'line' && startMonth && endMonth) {
      return getFilteredMonthlySalaryStats(startMonth, endMonth);
    }
    return getMonthlySalaryStats();
  })();

  /**
   * 导出图表数据
   */
  const exportChartData = () => {
    let dataToExport: any[];
    let filename: string;
    
    if (activeChart === 'pie') {
      dataToExport = pieData;
      filename = `薪资组成分析_${selectedMonth || '全部月份'}.json`;
    } else {
      dataToExport = monthlyStats;
      filename = `月度薪资统计_趋势.json`;
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 导出图表图片
   */
  const exportChartImage = async (withDetails: boolean = false) => {
    if (!chartRef.current) return;
    
    try {
      let elementToCapture = chartRef.current;
      
      if (withDetails) {
        // 创建包含图表和薪资明细的容器
        const container = document.createElement('div');
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '20px';
        container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        
        // 克隆图表
        const chartClone = chartRef.current.cloneNode(true) as HTMLElement;
        container.appendChild(chartClone);
        
        // 添加薪资明细
        const detailsDiv = document.createElement('div');
        detailsDiv.style.marginTop = '30px';
        detailsDiv.style.padding = '20px';
        detailsDiv.style.backgroundColor = '#f8fafc';
        detailsDiv.style.borderRadius = '12px';
        detailsDiv.style.border = '1px solid #e2e8f0';
        
        const latestSalary = records[records.length - 1];
        if (latestSalary) {
          // 重新计算薪资明细
          const calculation = calculateSalaryDetails(
            latestSalary.baseSalary,
            latestSalary.overtimeHours,
            latestSalary.overtimeRates
          );
          
          detailsDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1f2937;">最新薪资明细</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
              <div><strong>本薪:</strong> ¥${latestSalary.baseSalary.baseSalary.toLocaleString()}</div>
              <div><strong>餐补:</strong> ¥${latestSalary.baseSalary.mealAllowance.toLocaleString()}</div>
              <div><strong>夜班津贴:</strong> ¥${latestSalary.baseSalary.nightShiftAllowance.toLocaleString()}</div>
              <div><strong>无尘衣津贴:</strong> ¥${latestSalary.baseSalary.cleanRoomAllowance.toLocaleString()}</div>
              <div><strong>加班费:</strong> ¥${calculation.totalOvertimeAmount.toLocaleString()}</div>
              <div><strong>总薪资:</strong> ¥${latestSalary.totalSalary.toLocaleString()}</div>
            </div>
          `;
        }
        
        container.appendChild(detailsDiv);
        document.body.appendChild(container);
        
        elementToCapture = container;
      }
      
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        width: elementToCapture.offsetWidth,
        height: elementToCapture.offsetHeight
      });
      
      const link = document.createElement('a');
      const suffix = withDetails ? '_含明细' : '';
      link.download = `薪资图表_${activeChart}${suffix}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      // 清理临时元素
      if (withDetails && elementToCapture !== chartRef.current) {
        document.body.removeChild(elementToCapture);
      }
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('导出图片失败:', error);
    }
  };

  /**
   * 切换图表显示/隐藏状态
   */
  const toggleChartVisibility = (chartType: 'pie' | 'line') => {
    // 触屏设备触觉反馈
    if (isTouchDevice) {
      triggerHaptic('light');
    }
    setVisibleCharts(prev => ({
      ...prev,
      [chartType]: !prev[chartType]
    }));
  };
  
  /**
   * 处理图表切换（带触觉反馈）
   */
  const handleChartChange = (chartType: 'pie' | 'line') => {
    if (isTouchDevice) {
      triggerHaptic('medium');
    }
    setActiveChart(chartType);
  };
  
  /**
   * 处理图表放大（带触觉反馈）
   */
  const handleChartEnlarge = (chartType: 'pie' | 'line') => {
    if (isTouchDevice) {
      triggerHaptic('heavy');
    }
    setEnlargedChart(chartType);
  };

  // 基于微软文档最佳实践的颜色配置
   // 使用语义化颜色，确保可访问性和视觉层次




  /**
   * 基于微软文档最佳实践的增强型工具提示
   * 提供更丰富的数据展示和更好的可访问性
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="font-semibold text-slate-900">{label || '薪资构成'}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ¥{entry.value.toLocaleString('zh-CN')}
                    </p>
                    <p className="text-xs text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              总计: ¥{total.toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  /**
   * 月度统计增强型工具提示
   * 与饼图工具提示保持一致的设计风格
   */
  const MonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="font-semibold text-slate-900">{label}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ¥{entry.value.toLocaleString('zh-CN')}
                    </p>
                    <p className="text-xs text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
          {total > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                月度总计: ¥{total.toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (pieData.length === 0 && monthlyStats.length === 0) {
    return (
      <ClayCard variant="default">
        <ClayCardContent>
          <div className="text-center py-8 text-slate-500">
            暂无数据可显示图表
          </div>
        </ClayCardContent>
      </ClayCard>
    );
  }

  return (
    <div className={cn("space-y-4", isTouchDevice && "space-y-6")}>
      {/* 图表显示控制 */}
      <div className={cn("mb-4", isTouchDevice ? "mb-8" : "sm:mb-6")}>
        <div className={cn(
          "flex flex-wrap gap-2 justify-center sm:justify-start",
          isTouchDevice && "gap-4 justify-center"
        )}>
          <ClayButton
            variant={visibleCharts.pie ? 'primary' : 'secondary'}
            size={isTouchDevice ? "md" : "sm"}
            onClick={() => toggleChartVisibility('pie')}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-2",
              isTouchDevice ? "text-base px-6 py-3" : "text-xs sm:text-sm",
              !visibleCharts.pie && "opacity-50"
            )}
            hapticFeedback
          >
            <PieChartIcon className={cn(
              isTouchDevice ? "w-5 h-5" : "w-3 h-3 sm:w-4 sm:h-4"
            )} />
            <span className={cn(
              isTouchDevice ? "inline" : "hidden sm:inline"
            )}>饼图 {!visibleCharts.pie && '(隐藏)'}</span>
            {!isTouchDevice && <span className="sm:hidden">饼图</span>}
          </ClayButton>
          <ClayButton
            variant={visibleCharts.line ? 'primary' : 'secondary'}
            size={isTouchDevice ? "md" : "sm"}
            onClick={() => toggleChartVisibility('line')}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-2",
              isTouchDevice ? "text-base px-6 py-3" : "text-xs sm:text-sm",
              !visibleCharts.line && "opacity-50"
            )}
            hapticFeedback
          >
            <TrendingUp className={cn(
              isTouchDevice ? "w-5 h-5" : "w-3 h-3 sm:w-4 sm:h-4"
            )} />
            <span className={cn(
              isTouchDevice ? "inline" : "hidden sm:inline"
            )}>折线图 {!visibleCharts.line && '(隐藏)'}</span>
            {!isTouchDevice && <span className="sm:hidden">折线图</span>}
          </ClayButton>
          {/* 柱状图按钮已完全移除 */}
        </div>
      </div>

      {/* 饼图 - 薪资组成 */}
        {visibleCharts.pie && (
          <ClayCard variant="purple" padding={isTouchDevice ? "md" : "sm"}>
            <ClayCardTitle className={cn("flex flex-col gap-3", isTouchDevice && "gap-4")}>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-semibold",
                  isTouchDevice ? "text-xl" : "text-base sm:text-lg"
                )}>薪资组成分析</span>
                <ClayButton
                  variant="secondary"
                  size={isTouchDevice ? "md" : "sm"}
                  onClick={() => {
                    handleChartChange('pie');
                    setShowExportDialog(true);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1",
                    isTouchDevice ? "text-base px-4 py-2" : "text-xs sm:text-sm px-2 sm:px-3"
                  )}
                  hapticFeedback
                >
                  <Image className={cn(
                    isTouchDevice ? "w-4 h-4" : "w-3 h-3"
                  )} />
                  <span className={cn(
                    isTouchDevice ? "inline" : "hidden sm:inline"
                  )}>导出</span>
                </ClayButton>
              </div>
              <MonthSelector
                value={selectedMonth}
                onChange={setSelectedMonth}
                availableMonths={availableMonths}
                placeholder="全部月份"
                className={cn(
                  "w-full sm:w-auto",
                  isTouchDevice ? "text-base" : "text-xs sm:text-sm"
                )}
              />
            </ClayCardTitle>
            <ClayCardContent>
              {pieData.length > 0 ? (
                <div 
                  ref={activeChart === 'pie' ? chartRef : undefined}
                  onDoubleClick={() => handleChartEnlarge('pie')}
                  onTouchEnd={(e) => {
                    // 触屏设备双击放大
                    if (isTouchDevice && e.detail === 2) {
                      handleChartEnlarge('pie');
                    }
                  }}
                  className={cn(
                    "cursor-pointer",
                    isTouchDevice && "touch-manipulation select-none"
                  )}
                  title={isTouchDevice ? "双击放大查看" : "双击放大查看"}
                >
                  <div className={cn(
                    "px-2 sm:px-4 lg:px-8 py-2 sm:py-4",
                    isTouchDevice 
                      ? "h-80 lg:h-96" 
                      : "h-64 sm:h-80 lg:h-96"
                  )}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ 
                        top: isTouchDevice ? 80 : 70, 
                        right: isTouchDevice ? 120 : 100, 
                        bottom: isTouchDevice ? 80 : 70, 
                        left: isTouchDevice ? 120 : 100 
                      }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={{
                            stroke: '#94a3b8',
                            strokeWidth: 1.5,
                            strokeDasharray: '3,3'
                          }}
                          label={renderCustomizedLabel}
                          outerRadius={isTouchDevice ? (isMobile ? 50 : 60) : (window.innerWidth < 640 ? 55 : 65)}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                          className="drop-shadow-lg"
                          animationBegin={0}
                          animationDuration={1200}
                          animationEasing="ease-out"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                           content={<CustomTooltip />}
                           cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                           animationDuration={200}
                           wrapperStyle={{
                             outline: 'none',
                             zIndex: 1000
                           }}
                         />
                         {/* 图例已移除 */}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "text-center py-8 text-slate-500",
                  isTouchDevice && "py-12 text-lg"
                )}>
                  暂无数据可显示图表
                </div>
              )}
            </ClayCardContent>
          </ClayCard>
      )}

      {/* 折线图 - 月度薪资趋势 */}
        {visibleCharts.line && (
          <ClayCard variant="green">
            <ClayCardTitle className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold">月度薪资趋势</span>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveChart('line');
                    setShowExportDialog(true);
                  }}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Image className="w-3 h-3" />
                  <span className="hidden sm:inline">导出</span>
                </ClayButton>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">时间范围：</span>
                  <div className="flex items-center gap-2">
                    <MonthSelector
                      value={startMonth}
                      onChange={setStartMonth}
                      availableMonths={availableMonths}
                      placeholder="开始月份"
                      className="text-xs sm:text-sm flex-1 sm:flex-none"
                    />
                    <span className="text-xs sm:text-sm text-gray-500">至</span>
                    <MonthSelector
                      value={endMonth}
                      onChange={setEndMonth}
                      availableMonths={availableMonths}
                      placeholder="结束月份"
                      className="text-xs sm:text-sm flex-1 sm:flex-none"
                    />
                  </div>
                </div>
              </div>
            </ClayCardTitle>
            <ClayCardContent>
              {monthlyStats.length > 0 ? (
                <div 
                  ref={activeChart === 'line' ? chartRef : undefined}
                  onDoubleClick={() => setEnlargedChart('line')}
                  className="cursor-pointer"
                  title="双击放大查看"
                >
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyStats} margin={{ top: 50, right: 50, bottom: 20, left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#ffffff"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                          tick={{ fill: '#ffffff', fontWeight: 500 }}
                          angle={window.innerWidth < 640 ? -45 : 0}
                          textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                          height={window.innerWidth < 640 ? 60 : 30}
                        />
                        <YAxis 
                          stroke="#ffffff"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                          tick={{ fill: '#ffffff', fontWeight: 500 }}
                          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                          width={window.innerWidth < 640 ? 50 : 60}
                        />
                        {/* 移除悬停提示框 */}
                        <Line 
                          type="monotone" 
                          dataKey="totalSalary" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                          name="总薪资"
                          label={{ 
                            position: 'top', 
                            fill: '#10b981', 
                            fontSize: window.innerWidth < 640 ? 9 : 11,
                            fontWeight: 500,
                            offset: 8,
                            formatter: (value: number) => `¥${value.toLocaleString('zh-CN')}`
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="baseSalaryTotal" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          name="基础薪资"
                          label={{ 
                            position: 'top', 
                            fill: '#8b5cf6', 
                            fontSize: window.innerWidth < 640 ? 9 : 11,
                            fontWeight: 500,
                            offset: 8,
                            formatter: (value: number) => `¥${value.toLocaleString('zh-CN')}`
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="overtimeTotal" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="加班费"
                          label={{ 
                            position: 'top', 
                            fill: '#f59e0b', 
                            fontSize: window.innerWidth < 640 ? 9 : 11,
                            fontWeight: 500,
                            offset: 8,
                            formatter: (value: number) => `¥${value.toLocaleString('zh-CN')}`
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  暂无数据可显示图表
                </div>
              )}
            </ClayCardContent>
          </ClayCard>
      )}

      {/* 柱状图功能已移除 */}
      
      {/* 导出对话框 */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ClayCard variant="default" className={cn(
            "w-full max-w-md",
            isTouchDevice ? "mx-2" : "mx-4"
          )}>
            <ClayCardTitle className={cn(
              isTouchDevice ? "text-xl" : "text-lg"
            )}>导出图表</ClayCardTitle>
            <ClayCardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="includeDetails"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className={cn(
                      "text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2",
                      isTouchDevice ? "w-5 h-5" : "w-4 h-4"
                    )}
                  />
                  <label 
                    htmlFor="includeDetails" 
                    className={cn(
                      "font-medium text-gray-700",
                      isTouchDevice ? "text-base" : "text-sm"
                    )}
                  >
                    包含薪资明细
                  </label>
                </div>
                
                <div className={cn(
                  "text-gray-500",
                  isTouchDevice ? "text-base" : "text-sm"
                )}>
                  {includeDetails ? '将导出图表和最新薪资明细' : '仅导出图表'}
                </div>
              </div>
              
              <div className={cn(
                "mt-6 gap-3",
                isTouchDevice ? "grid grid-cols-1" : "flex justify-end"
              )}>
                <ClayButton
                  variant="secondary"
                  onClick={() => setShowExportDialog(false)}
                  className={cn(
                    isTouchDevice ? "w-full py-3 text-base" : ""
                  )}
                >
                  取消
                </ClayButton>
                <ClayButton
                  variant="primary"
                  onClick={() => exportChartImage(includeDetails)}
                  className={cn(
                    "flex items-center gap-2",
                    isTouchDevice ? "w-full py-3 text-base justify-center" : ""
                  )}
                >
                  <Download className={cn(
                    isTouchDevice ? "w-5 h-5" : "w-4 h-4"
                  )} />
                  导出图片
                </ClayButton>
                <ClayButton
                  variant="success"
                  onClick={exportChartData}
                  className={cn(
                    "flex items-center gap-2",
                    isTouchDevice ? "w-full py-3 text-base justify-center" : ""
                  )}
                >
                  <Download className={cn(
                    isTouchDevice ? "w-5 h-5" : "w-4 h-4"
                  )} />
                  导出数据
                </ClayButton>
              </div>
            </ClayCardContent>
          </ClayCard>
        </div>
      )}

      {/* 图表放大模态框 */}
      {enlargedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-gray-900">
                {enlargedChart === 'pie' && '薪资组成分析'}
                {enlargedChart === 'line' && '月度薪资趋势'}
              </h3>
              <ClayButton
                variant="secondary"
                size="sm"
                onClick={() => setEnlargedChart(null)}
                className="flex items-center gap-2"
              >
                ✕ 关闭
              </ClayButton>
            </div>
            <div className="p-6">
              <div className="h-96 lg:h-[500px]">
                {enlargedChart === 'pie' && (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart margin={{ top: 70, right: 100, bottom: 70, left: 100 }}>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         labelLine={{
                           stroke: '#94a3b8',
                           strokeWidth: 1.5,
                           strokeDasharray: '3,3'
                         }}
                         label={renderCustomizedLabel}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                         className="drop-shadow-lg"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip content={<CustomTooltip />} />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
                 {enlargedChart === 'line' && (
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={monthlyStats} margin={{ top: 50, right: 50, bottom: 20, left: 30 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                       <XAxis 
                         dataKey="month" 
                         stroke="#ffffff"
                         fontSize={14}
                         tick={{ fill: '#ffffff', fontWeight: 500 }}
                       />
                       <YAxis 
                         stroke="#ffffff"
                         fontSize={14}
                         tick={{ fill: '#ffffff', fontWeight: 500 }}
                         tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                       />
                       <Tooltip content={<MonthlyTooltip />} />
                       <Line 
                         type="monotone" 
                         dataKey="totalSalary" 
                         stroke="#10b981" 
                         strokeWidth={4}
                         dot={{ fill: '#10b981', strokeWidth: 3, r: 8 }}
                         activeDot={{ r: 10, stroke: '#10b981', strokeWidth: 3, fill: '#fff' }}
                         name="总薪资"
                       />
                       <Line 
                         type="monotone" 
                         dataKey="baseSalaryTotal" 
                         stroke="#8b5cf6" 
                         strokeWidth={3}
                         dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                         name="基础薪资"
                       />
                       <Line 
                         type="monotone" 
                         dataKey="overtimeTotal" 
                         stroke="#f59e0b" 
                         strokeWidth={3}
                         dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                         name="加班费"
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 )}
                 {/* 放大版柱状图功能已移除 */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};