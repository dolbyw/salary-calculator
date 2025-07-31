import React, { useState } from 'react';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayInput } from './ui/ClayInput';
import { ClayButton } from './ui/ClayButton';
import { useSalaryStore } from '../store/salaryStore';
import { Settings, Save, Download, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeRate } from '../types/salary';
import { useRef } from 'react';

/**
 * 设置页面组件
 */
export const SalarySettings: React.FC = () => {
  const { overtimeRates, records, updateOvertimeRates, clearAllRecords, exportRecords, importRecords } = useSalaryStore();
  
  const [tempRates, setTempRates] = useState<OvertimeRate>(overtimeRates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理费率输入变化
   */
  const handleRateChange = (field: keyof OvertimeRate, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTempRates(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  /**
   * 保存费率设置
   */
  const handleSaveRates = () => {
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
  };

  /**
   * 重置费率为默认值
   */
  const handleResetRates = () => {
    const defaultRates: OvertimeRate = {
      overtime1: 21,
      overtime2: 28,
      overtime3: 42,
    };
    setTempRates(defaultRates);
    updateOvertimeRates(defaultRates);
    toast.success('费率已重置为默认值');
  };

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
    <div className="space-y-2 px-1">
      <div className="space-y-2">
        {/* 加班费率设置 */}
        <ClayCard variant="pink" padding="sm">
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
        <ClayCard variant="orange" padding="sm">
          <ClayCardTitle>数据管理</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-3">
              {/* 数据统计 */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-3">
                <h4 className="font-medium text-orange-800 mb-2">数据统计</h4>
                <div className="text-sm text-orange-700">
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
              <div className="text-xs text-slate-500 space-y-1">
                <p>• 支持导入CSV格式的薪资记录文件</p>
                <p>• 导出的CSV文件包含所有历史记录的详细信息</p>
                <p>• 清空数据操作不可撤销，请谨慎操作</p>
                <p>• 费率设置会影响后续的薪资计算</p>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>
      </div>


    </div>
  );
};