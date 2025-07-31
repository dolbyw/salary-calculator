import React, { useState, useRef, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayButton } from './ui/ClayButton';
import { MonthSelector } from './ui/MonthSelector';
import { useSalaryStore, calculateSalaryDetails } from '../store/salaryStore';
import { PieChart as PieChartIcon, TrendingUp, BarChart3, Download, Image } from 'lucide-react';
import { ChartData, MonthlySalaryStats } from '../types/salary';
import html2canvas from 'html2canvas';

interface SalaryChartsProps {
  recordId?: string;
}

/**
 * 薪资图表组件
 */
export const SalaryCharts: React.FC<SalaryChartsProps> = ({ recordId }) => {
  const [activeChart, setActiveChart] = useState<'pie' | 'line' | 'bar'>('pie');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startMonth, setStartMonth] = useState<string>('');
  const [endMonth, setEndMonth] = useState<string>('');
  const [barChartMode, setBarChartMode] = useState<'range' | 'single'>('range');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [enlargedChart, setEnlargedChart] = useState<'pie' | 'line' | 'bar' | null>(null);
  const [visibleCharts, setVisibleCharts] = useState<{
    pie: boolean;
    line: boolean;
    bar: boolean;
  }>({ pie: false, line: false, bar: false });
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { 
    getChartData, 
    getMonthlySalaryStats, 
    getAvailableMonths, 
    getFilteredMonthlySalaryStats, 
    getMonthlyChartData,
    records
  } = useSalaryStore();
  
  const availableMonths = getAvailableMonths();
  
  // 获取图表数据
  const pieData = selectedMonth ? getMonthlyChartData(selectedMonth) : getChartData(recordId);
  
  const monthlyStats = (() => {
    if (activeChart === 'line' && startMonth && endMonth) {
      return getFilteredMonthlySalaryStats(startMonth, endMonth);
    } else if (activeChart === 'bar' && barChartMode === 'range' && startMonth && endMonth) {
      return getFilteredMonthlySalaryStats(startMonth, endMonth);
    } else if (activeChart === 'bar' && barChartMode === 'single' && selectedMonth) {
      const singleMonthData = getMonthlyChartData(selectedMonth);
      return [{
        month: selectedMonth,
        totalSalary: singleMonthData.reduce((sum, item) => sum + item.value, 0),
        baseSalary: singleMonthData.find(item => item.name === '基础薪资')?.value || 0,
        overtime: singleMonthData.find(item => item.name === '加班费')?.value || 0,
        others: singleMonthData.find(item => item.name === '其它加项')?.value || 0
      }];
    }
    return getMonthlySalaryStats();
  })();

  /**
   * 导出图表数据
   */
  const exportChartData = () => {
    let dataToExport;
    let filename;
    
    if (activeChart === 'pie') {
      dataToExport = pieData;
      filename = `薪资组成分析_${selectedMonth || '全部月份'}.json`;
    } else {
      dataToExport = monthlyStats;
      filename = `月度薪资统计_${activeChart === 'line' ? '趋势' : '对比'}.json`;
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
  const toggleChartVisibility = (chartType: 'pie' | 'line' | 'bar') => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartType]: !prev[chartType]
    }));
  };

  /**
   * 自定义饼图标签 - 智能标签定位算法，优先保持标签与饼块的自然位置关系
   */
  const renderCustomizedLabel = useCallback((props: any, allData: any[]) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, index } = props;
    const RADIAN = Math.PI / 180;
    
    // 如果百分比太小，不显示标签
    if (percent < 0.03) return null;
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    
    // 响应式调整
    const isSmallScreen = window.innerWidth < 640;
    const containerWidth = isSmallScreen ? 320 : 450;
    const containerHeight = isSmallScreen ? 280 : 350;
    
    // 计算连接线的起点（从饼图边缘开始）
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    
    // 确定标签在左侧还是右侧
    const isRightSide = cos >= 0;
    
    // 标签尺寸
    const labelHeight = isSmallScreen ? 32 : 36;
    const labelWidth = isSmallScreen ? 85 : 105;
    const minSpacing = isSmallScreen ? 6 : 8;
    
    // 计算理想的标签位置（最接近饼块的自然位置）
    const idealDistance = isSmallScreen ? 60 : 80;
    const idealX = isRightSide 
      ? Math.min(cx + outerRadius + idealDistance, containerWidth - labelWidth - 10)
      : Math.max(cx - outerRadius - idealDistance, labelWidth + 10);
    const idealY = cy + (outerRadius + idealDistance) * sin;
    
    // 获取所有需要显示的标签数据
    const visibleLabels = allData?.filter((item: any) => item.percent >= 0.03) || [];
    
    // 计算当前标签的最终位置
    let finalX = idealX;
    let finalY = idealY;
    
    // 边界检查和调整
    const topMargin = 40;
    const bottomMargin = 40;
    finalY = Math.max(topMargin + labelHeight/2, Math.min(finalY, containerHeight - bottomMargin - labelHeight/2));
    
    // 检测与其他标签的重叠并调整位置
    const currentLabelIndex = visibleLabels.findIndex(item => 
      Math.abs(item.midAngle - midAngle) < 0.1 && item.name === name
    );
    
    if (currentLabelIndex >= 0) {
      // 获取同侧的其他标签
      const sideLabels = visibleLabels.filter((item: any, idx: number) => {
        if (idx === currentLabelIndex) return false;
        const itemCos = Math.cos(-RADIAN * item.midAngle);
        return isRightSide ? itemCos >= 0 : itemCos < 0;
      });
      
      // 检测重叠并调整
      for (const otherLabel of sideLabels) {
        const otherSin = Math.sin(-RADIAN * otherLabel.midAngle);
        const otherIdealY = cy + (outerRadius + idealDistance) * otherSin;
        const otherFinalY = Math.max(topMargin + labelHeight/2, 
          Math.min(otherIdealY, containerHeight - bottomMargin - labelHeight/2));
        
        // 检查垂直重叠
        const verticalDistance = Math.abs(finalY - otherFinalY);
        if (verticalDistance < labelHeight + minSpacing) {
          // 发生重叠，需要调整位置
          const adjustment = (labelHeight + minSpacing - verticalDistance) / 2;
          
          // 根据角度关系决定调整方向
          if (midAngle < otherLabel.midAngle) {
            // 当前标签角度更小，向上调整
            finalY = Math.max(topMargin + labelHeight/2, finalY - adjustment);
          } else {
            // 当前标签角度更大，向下调整
            finalY = Math.min(containerHeight - bottomMargin - labelHeight/2, finalY + adjustment);
          }
        }
      }
    }
    
    // 计算连接线路径
    const midDistance = isSmallScreen ? 20 : 30;
    const midX = cx + (outerRadius + midDistance) * cos;
    const midY = cy + (outerRadius + midDistance) * sin;
    
    // 水平连接段
    const horizontalLength = isSmallScreen ? 15 : 25;
    const hx = isRightSide ? finalX - horizontalLength : finalX + horizontalLength;
    const hy = finalY;
    
    const textAnchor = isRightSide ? 'start' : 'end';
    const percentText = `${(percent * 100).toFixed(1)}%`;
    
    // 响应式字体和尺寸
    const fontSize = isSmallScreen ? 11 : 13;
    const percentFontSize = isSmallScreen ? 10 : 12;
    const bgWidth = isSmallScreen ? 85 : 105;
    const bgHeight = isSmallScreen ? 28 : 32;
    
    return (
      <g 
        key={`label-${name}-${index}`}
        style={{
          transform: 'translateZ(0)', // 启用硬件加速
          transformOrigin: `${finalX}px ${finalY}px`, // 设置变换原点为标签位置
        }}
      >
        {/* 优化的三段式连接线 */}
        <path
          d={`M${sx},${sy}L${midX},${midY}L${hx},${hy}L${isRightSide ? finalX - 5 : finalX + 5},${hy}`}
          stroke="#94a3b8"
          strokeWidth={isSmallScreen ? 1.5 : 2}
          fill="none"
          strokeDasharray="2,2"
          opacity={0.7}
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* 标签背景 */}
        <rect
          x={isRightSide ? finalX - 8 : finalX - bgWidth + 8}
          y={finalY - bgHeight/2}
          width={bgWidth}
          height={bgHeight}
          fill="rgba(255, 255, 255, 0.96)"
          stroke="#cbd5e1"
          strokeWidth={1}
          rx={isSmallScreen ? 8 : 10}
          filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center',
          }}
        />
        {/* 标签文本 */}
        <text
          x={isRightSide ? finalX : finalX - 8}
          y={finalY - (isSmallScreen ? 5 : 6)}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={600}
          fill="#1f2937"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center',
          }}
        >
          {name}
        </text>
        <text
          x={isRightSide ? finalX : finalX - 8}
          y={finalY + (isSmallScreen ? 7 : 8)}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={percentFontSize}
          fontWeight={500}
          fill="#6b7280"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center',
          }}
        >
          {percentText}
        </text>
      </g>
    );
  }, []);

  /**
   * 自定义工具提示
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: ¥{entry.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /**
   * 月度统计工具提示
   */
  const MonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: ¥{entry.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          ))}
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
    <div className="space-y-4">
      {/* 图表显示控制 */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <ClayButton
            variant={visibleCharts.pie ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => toggleChartVisibility('pie')}
            className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${!visibleCharts.pie ? 'opacity-50' : ''}`}
          >
            <PieChartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">饼图 {!visibleCharts.pie && '(隐藏)'}</span>
            <span className="sm:hidden">饼图</span>
          </ClayButton>
          <ClayButton
            variant={visibleCharts.line ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => toggleChartVisibility('line')}
            className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${!visibleCharts.line ? 'opacity-50' : ''}`}
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">折线图 {!visibleCharts.line && '(隐藏)'}</span>
            <span className="sm:hidden">折线图</span>
          </ClayButton>
          <ClayButton
            variant={visibleCharts.bar ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => toggleChartVisibility('bar')}
            className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${!visibleCharts.bar ? 'opacity-50' : ''}`}
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">柱状图 {!visibleCharts.bar && '(隐藏)'}</span>
            <span className="sm:hidden">柱状图</span>
          </ClayButton>
        </div>
      </div>

      {/* 饼图 - 薪资组成 */}
        {visibleCharts.pie && (
          <ClayCard variant="purple">
            <ClayCardTitle className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold">薪资组成分析</span>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveChart('pie');
                    setShowExportDialog(true);
                  }}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Image className="w-3 h-3" />
                  <span className="hidden sm:inline">导出</span>
                </ClayButton>
              </div>
              <MonthSelector
                value={selectedMonth}
                onChange={setSelectedMonth}
                availableMonths={availableMonths}
                placeholder="全部月份"
                className="text-xs sm:text-sm w-full sm:w-auto"
              />
            </ClayCardTitle>
            <ClayCardContent>
              {pieData.length > 0 ? (
                <div 
                  ref={activeChart === 'pie' ? chartRef : undefined}
                  onDoubleClick={() => setEnlargedChart('pie')}
                  className="cursor-pointer"
                  title="双击放大查看"
                >
                  <div className="h-64 sm:h-80 lg:h-96 px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props) => renderCustomizedLabel(props, pieData)}
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
                      <LineChart data={monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#374151"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                          tick={{ fill: '#374151', fontWeight: 500 }}
                          angle={window.innerWidth < 640 ? -45 : 0}
                          textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                          height={window.innerWidth < 640 ? 60 : 30}
                        />
                        <YAxis 
                          stroke="#374151"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                          tick={{ fill: '#374151', fontWeight: 500 }}
                          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                          width={window.innerWidth < 640 ? 50 : 60}
                        />
                        <Tooltip content={<MonthlyTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="totalSalary" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                          name="总薪资"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="baseSalaryTotal" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          name="基础薪资"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="overtimeTotal" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="加班费"
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

      {/* 柱状图 - 月度薪资对比或单月占比 */}
        {visibleCharts.bar && (
          <ClayCard variant="pink">
            <ClayCardTitle className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold">{barChartMode === 'single' ? '单月薪资占比' : '月度薪资对比'}</span>
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveChart('bar');
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
                  <div className="flex flex-wrap gap-2">
                    <ClayButton
                      variant={barChartMode === 'range' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBarChartMode('range')}
                      className="text-xs sm:text-sm"
                    >
                      时间范围
                    </ClayButton>
                    <ClayButton
                      variant={barChartMode === 'single' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBarChartMode('single')}
                      className="text-xs sm:text-sm"
                    >
                      单月占比
                    </ClayButton>
                  </div>
                  
                  {barChartMode === 'range' && (
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
                  )}
                  
                  {barChartMode === 'single' && (
                    <MonthSelector
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      availableMonths={availableMonths}
                      placeholder="选择月份"
                      className="text-xs sm:text-sm"
                    />
                  )}
                </div>
              </div>
            </ClayCardTitle>
            <ClayCardContent>
              {monthlyStats.length > 0 ? (
                <div 
                  ref={activeChart === 'bar' ? chartRef : undefined}
                  onDoubleClick={() => setEnlargedChart('bar')}
                  className="cursor-pointer"
                  title="双击放大查看"
                >
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {barChartMode === 'single' && monthlyStats.length === 1 ? (
                        // 单月占比 - 使用饼图数据格式
                        <BarChart data={pieData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#374151"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            tick={{ fill: '#374151', fontWeight: 500 }}
                            angle={window.innerWidth < 640 ? -45 : 0}
                            textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                            height={window.innerWidth < 640 ? 60 : 30}
                          />
                          <YAxis 
                            stroke="#374151"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            tick={{ fill: '#374151', fontWeight: 500 }}
                            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                            width={window.innerWidth < 640 ? 50 : 60}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="value" 
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={window.innerWidth < 640 ? 30 : 40}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        // 时间范围对比
                        <BarChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#374151"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            tick={{ fill: '#374151', fontWeight: 500 }}
                            angle={window.innerWidth < 640 ? -45 : 0}
                            textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                            height={window.innerWidth < 640 ? 60 : 30}
                          />
                          <YAxis 
                            stroke="#374151"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            tick={{ fill: '#374151', fontWeight: 500 }}
                            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                            width={window.innerWidth < 640 ? 50 : 60}
                          />
                          <Tooltip content={<MonthlyTooltip />} />
                          <Bar 
                            dataKey="baseSalaryTotal" 
                            stackId="a" 
                            fill="#8b5cf6" 
                            name="基础薪资"
                            radius={[0, 0, 4, 4]}
                            maxBarSize={window.innerWidth < 640 ? 30 : 40}
                          />
                          <Bar 
                            dataKey="customItemsTotal" 
                            stackId="a" 
                            fill="#ec4899" 
                            name="其它加项"
                            maxBarSize={window.innerWidth < 640 ? 30 : 40}
                          />
                          <Bar 
                            dataKey="overtimeTotal" 
                            stackId="a" 
                            fill="#10b981" 
                            name="加班费"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={window.innerWidth < 640 ? 30 : 40}
                          />
                        </BarChart>
                      )}
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
      
      {/* 导出对话框 */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ClayCard variant="default" className="max-w-md w-full mx-4">
            <ClayCardTitle>导出图表</ClayCardTitle>
            <ClayCardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="includeDetails"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="includeDetails" className="text-sm font-medium text-gray-700">
                    包含薪资明细
                  </label>
                </div>
                
                <div className="text-sm text-gray-500">
                  {includeDetails ? '将导出图表和最新薪资明细' : '仅导出图表'}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <ClayButton
                  variant="secondary"
                  onClick={() => setShowExportDialog(false)}
                >
                  取消
                </ClayButton>
                <ClayButton
                  variant="primary"
                  onClick={() => exportChartImage(includeDetails)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
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
                {enlargedChart === 'bar' && (barChartMode === 'single' ? '单月薪资占比' : '月度薪资对比')}
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
                     <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={(props) => renderCustomizedLabel(props, pieData)}
                         outerRadius={120}
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
                     <LineChart data={monthlyStats} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                       <XAxis 
                         dataKey="month" 
                         stroke="#374151"
                         fontSize={14}
                         tick={{ fill: '#374151', fontWeight: 500 }}
                       />
                       <YAxis 
                         stroke="#374151"
                         fontSize={14}
                         tick={{ fill: '#374151', fontWeight: 500 }}
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
                 {enlargedChart === 'bar' && (
                   <ResponsiveContainer width="100%" height="100%">
                     {barChartMode === 'single' && monthlyStats.length === 1 ? (
                       <BarChart data={pieData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                         <XAxis 
                           dataKey="name" 
                           stroke="#374151"
                           fontSize={14}
                           tick={{ fill: '#374151', fontWeight: 500 }}
                         />
                         <YAxis 
                           stroke="#374151"
                           fontSize={14}
                           tick={{ fill: '#374151', fontWeight: 500 }}
                           tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                         />
                         <Tooltip content={<CustomTooltip />} />
                         <Bar 
                           dataKey="value" 
                           fill="#8b5cf6"
                           radius={[6, 6, 0, 0]}
                           maxBarSize={60}
                         >
                           {pieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Bar>
                       </BarChart>
                     ) : (
                       <BarChart data={monthlyStats} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                         <XAxis 
                           dataKey="month" 
                           stroke="#374151"
                           fontSize={14}
                           tick={{ fill: '#374151', fontWeight: 500 }}
                         />
                         <YAxis 
                           stroke="#374151"
                           fontSize={14}
                           tick={{ fill: '#374151', fontWeight: 500 }}
                           tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                         />
                         <Tooltip content={<MonthlyTooltip />} />
                         <Bar 
                           dataKey="baseSalaryTotal" 
                           stackId="a" 
                           fill="#8b5cf6" 
                           name="基础薪资"
                           radius={[0, 0, 6, 6]}
                           maxBarSize={60}
                         />
                         <Bar 
                           dataKey="customItemsTotal" 
                           stackId="a" 
                           fill="#ec4899" 
                           name="其它加项"
                           maxBarSize={60}
                         />
                         <Bar 
                           dataKey="overtimeTotal" 
                           stackId="a" 
                           fill="#10b981" 
                           name="加班费"
                           radius={[6, 6, 0, 0]}
                           maxBarSize={60}
                         />
                       </BarChart>
                     )}
                   </ResponsiveContainer>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};