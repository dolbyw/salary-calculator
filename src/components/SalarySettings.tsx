import React, { useState, useRef, useMemo, useCallback } from 'react';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayInput } from './ui/ClayInput';
import { ClayButton } from './ui/ClayButton';

import { useSalaryStore } from '../store/salaryStore';
import { Save, Download, Trash2, Upload, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeRate } from '../types/salary';

import { useTouchDevice } from '../hooks/useTouchDevice';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

/**
 * 设置页面组件
 */
export const SalarySettings: React.FC = React.memo(() => {
  const { overtimeRates, records, updateOvertimeRates, clearAllRecords, exportRecords, importRecords } = useSalaryStore();
  const { isTouchDevice, isMobile } = useTouchDevice();
  const { themeMode, setTheme, isDark, colors } = useTheme();
  
  const [tempRates, setTempRates] = useState<OvertimeRate>(overtimeRates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理费率输入变化 - 使用useCallback优化
   */
  const handleRateChange = useCallback((field: keyof OvertimeRate, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTempRates(prev => ({
      ...prev,
      [field]: numValue,
    }));
  }, []);

  /**
   * 保存费率设置 - 使用useCallback优化
   */
  const handleSaveRates = useCallback(() => {
    if (tempRates.overtime1 <= 0 || tempRates.overtime2 <= 0 || tempRates.overtime3 <= 0) {
      toast.error('费率必须大于0');
      return;
    }
    
    // 检查费率是否有变化
    if (JSON.stringify(tempRates) === JSON.stringify(overtimeRates)) {
      toast.info('费率未发生变化');
      return;
    }
    
    try {
      updateOvertimeRates(tempRates);
      toast.success('费率设置已保存');
    } catch (error) {
      toast.error('保存失败，请重试');
    }
  }, [tempRates, overtimeRates, updateOvertimeRates]);

  /**
   * 重置费率为默认值 - 使用useCallback优化
   */
  const handleResetRates = useCallback(() => {
    const defaultRates: OvertimeRate = {
      overtime1: 21,
      overtime2: 28,
      overtime3: 42,
    };
    setTempRates(defaultRates);
    updateOvertimeRates(defaultRates);
    toast.success('费率已重置为默认值');
  }, [updateOvertimeRates]);

  /**
   * 导出数据为CSV
   */
  const handleExportData = () => {
    if (records.length === 0) {
      toast.error('没有数据可导出');
      return;
    }

    try {
      const csvContent = exportRecords();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `薪资记录_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('数据导出成功');
      }
    } catch (error) {
      toast.error('导出失败，请重试');
    }
  };

  /**
   * 清空所有数据
   */
  const handleClearAllData = () => {
    if (records.length === 0) {
      toast.error('没有数据可清空');
      return;
    }
    
    if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      clearAllRecords();
      toast.success('所有数据已清空');
    }
  };

  /**
   * 处理文件导入
   */
  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  /**
   * 处理文件选择
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('请选择CSV文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
       try {
         const csvContent = e.target?.result as string;
         const result = importRecords(csvContent);
         if (result.success) {
           toast.success(result.message);
         } else {
           toast.error(result.message);
         }
       } catch (error) {
         toast.error('文件读取失败，请重试');
       }
     };
    reader.readAsText(file, 'utf-8');
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  return (
    <div className={cn("space-y-2 px-1", isMobile && "space-y-4")}>

      <div className={cn("space-y-2", isTouchDevice && "space-y-4")}>
        {/* 加班费率设置 */}
        <ClayCard variant="pink" padding={isTouchDevice ? "md" : "sm"}>
          <ClayCardTitle>加班费率设置</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <ClayInput
                  label="加班1费率 (元/小时)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempRates.overtime1 || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleRateChange('overtime1', value);
                  }}
                  placeholder="加班1费率"
                  variant="pink"
                />
                <ClayInput
                  label="加班2费率 (元/小时)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempRates.overtime2 || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleRateChange('overtime2', value);
                  }}
                  placeholder="加班2费率"
                  variant="pink"
                />
              </div>
              <ClayInput
                label="加班3费率 (元/小时)"
                type="number"
                step="0.01"
                min="0"
                value={tempRates.overtime3 || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleRateChange('overtime3', value);
                }}
                placeholder="加班3费率"
                variant="pink"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <ClayButton
                  variant="primary"
                  onClick={handleSaveRates}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  保存设置
                </ClayButton>
                <ClayButton
                  variant="secondary"
                  onClick={handleResetRates}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  重置默认
                </ClayButton>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>



        {/* 数据管理 */}
        <ClayCard variant="orange" padding={isTouchDevice ? "md" : "sm"}>
          <ClayCardTitle>数据管理</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-3">
              {/* 数据统计 */}
              <div className={cn(
                "rounded-xl p-3 transition-colors duration-300",
                `bg-gradient-to-br ${colors.card.orange} border`
              )}>
                <h4 className={cn(
                  "font-medium mb-2 transition-colors duration-300",
                  colors.text.primary
                )}>数据统计</h4>
                <div className={cn(
                  "text-sm transition-colors duration-300",
                  colors.text.secondary
                )}>
                  <div className="flex justify-between mb-1">
                    <span>历史记录数量:</span>
                    <span className="font-medium">{records.length} 条</span>
                  </div>
                  {records.length > 0 && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span>最早记录:</span>
                        <span className="font-medium">
                          {new Date(records[records.length - 1].date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>最新记录:</span>
                        <span className="font-medium">
                          {new Date(records[0].date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <ClayButton
                     variant="primary"
                     onClick={handleImportData}
                     className="flex items-center justify-center gap-2 text-sm"
                   >
                    <Upload className="w-4 h-4" />
                    导入数据
                  </ClayButton>
                  <ClayButton
                    variant="success"
                    onClick={handleExportData}
                    disabled={records.length === 0}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    导出数据
                  </ClayButton>
                </div>
                
                <ClayButton
                  variant="danger"
                  onClick={handleClearAllData}
                  disabled={records.length === 0}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有数据
                </ClayButton>
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* 说明文字 */}
              <div className={cn(
                "text-xs space-y-1 transition-colors duration-300",
                colors.text.secondary
              )}>
                <p>• 支持导入CSV格式的薪资记录文件</p>
                <p>• 导出的CSV文件包含所有历史记录的详细信息</p>
                <p>• 清空数据操作不可撤销，请谨慎操作</p>
                <p>• 费率设置会影响后续的薪资计算</p>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>

        {/* 主题设置 */}
        <ClayCard variant="purple" padding={isTouchDevice ? "md" : "sm"}>
          <ClayCardTitle>主题设置</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-3">
              <div className={cn(
                "text-sm mb-3 transition-colors duration-300",
                isDark ? "text-slate-300" : "text-slate-600"
              )}>
                选择您喜欢的主题模式，自动模式将根据系统设置切换
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <ClayButton
                  variant={themeMode === 'light' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 h-auto",
                    isTouchDevice && "p-4"
                  )}
                >
                  <Sun className={cn("w-5 h-5", isTouchDevice && "w-6 h-6")} />
                  <span className={cn("text-xs", isTouchDevice && "text-sm")}>白天</span>
                </ClayButton>
                
                <ClayButton
                  variant={themeMode === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 h-auto",
                    isTouchDevice && "p-4"
                  )}
                >
                  <Moon className={cn("w-5 h-5", isTouchDevice && "w-6 h-6")} />
                  <span className={cn("text-xs", isTouchDevice && "text-sm")}>黑夜</span>
                </ClayButton>
                
                <ClayButton
                  variant={themeMode === 'auto' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('auto')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 h-auto",
                    isTouchDevice && "p-4"
                  )}
                >
                  <Monitor className={cn("w-5 h-5", isTouchDevice && "w-6 h-6")} />
                  <span className={cn("text-xs", isTouchDevice && "text-sm")}>自动</span>
                </ClayButton>
              </div>
              
              <div className={cn(
                "text-xs space-y-1 transition-colors duration-300",
                isDark ? "text-slate-300" : "text-slate-500"
              )}>
                <p>• 白天模式：使用明亮的配色方案</p>
                <p>• 黑夜模式：使用深色的配色方案，减少眼部疲劳</p>
                <p>• 自动模式：根据系统设置自动切换主题</p>
                <p>• 当前主题：{isDark ? '黑夜模式' : '白天模式'}</p>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>




      </div>


    </div>
  );
});

SalarySettings.displayName = 'SalarySettings';