import React, { useState } from 'react';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayInput } from './ui/ClayInput';
import { ClayButton } from './ui/ClayButton';
import { MonthPickerDialog } from './ui/MonthPickerDialog';
import { useSalaryStore } from '../store/salaryStore';
import { useTheme } from '../hooks/useTheme';
import { cn, formatAmount } from '../lib/utils';
import { Calculator, Save, RotateCcw, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 薪资计算器主组件
 */
export const SalaryCalculator: React.FC = React.memo(() => {
  const {
    baseSalary,
    overtimeHours,
    overtimeRates,
    calculation,
    updateBaseSalary,
    updateOvertimeHours,
    addCustomItem,
    updateCustomItem,
    removeCustomItem,
    saveRecord,
    resetCurrentData,
  } = useSalaryStore();
  const { isDark, colors } = useTheme();

  const [note, setNote] = useState('');
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [newCustomItemAmount, setNewCustomItemAmount] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  /**
   * 处理基础薪资输入变化
   */
  const handleBaseSalaryChange = (field: keyof Omit<typeof baseSalary, 'customItems'>, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateBaseSalary(field, numValue);
  };

  /**
   * 处理加班时长输入变化
   */
  const handleOvertimeHoursChange = (field: keyof typeof overtimeHours, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateOvertimeHours(field, numValue);
  };

  /**
   * 保存当前计算结果
   */
  const handleSaveRecord = () => {
    if (!calculation || calculation.totalSalary === 0) {
      toast.error('请先输入薪资数据');
      return;
    }
    
    setShowMonthPicker(true);
  };

  const handleMonthPickerConfirm = (year: number, month: number) => {
    if (calculation) {
      saveRecord(year, month, note);
      toast.success('薪资记录已保存！');
      setNote('');
      setShowMonthPicker(false);
    }
  };

  const handleMonthPickerCancel = () => {
    setShowMonthPicker(false);
  };

  /**
   * 添加自定义项目
   */
  const handleAddCustomItem = () => {
    if (!newCustomItemName.trim()) {
      toast.error('请输入项目名称');
      return;
    }
    const amount = parseFloat(newCustomItemAmount) || 0;
    if (amount <= 0) {
      toast.error('请输入有效的金额');
      return;
    }
    addCustomItem(newCustomItemName.trim(), amount);
    setNewCustomItemName('');
    setNewCustomItemAmount('');
    toast.success('自定义项目已添加');
  };

  /**
   * 更新自定义项目
   */
  const handleUpdateCustomItem = (id: string, name: string, amount: number) => {
    updateCustomItem(id, name, amount);
  };

  /**
   * 删除自定义项目
   */
  const handleRemoveCustomItem = (id: string) => {
    removeCustomItem(id);
    toast.success('自定义项目已删除');
  };

  /**
   * 重置所有数据
   */
  const handleReset = () => {
    resetCurrentData();
    setNote('');
    setNewCustomItemName('');
    setNewCustomItemAmount('');
    toast.success('数据已重置');
  };



  return (
    <div className="space-y-2 px-1">
      <div className="space-y-2">
        {/* 基础薪资输入区 */}
        <ClayCard variant="purple" padding="sm">
          <ClayCardTitle>基础薪资</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <ClayInput
                  label="本薪 (元)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseSalary.baseSalary || ''}
                  onChange={(e) => {
                    handleBaseSalaryChange('baseSalary', e.target.value);
                  }}
                  placeholder="本薪"
                  variant="purple"
                />
                <ClayInput
                  label="专业加给 (元)"
                  type="text"
                  value={baseSalary.professionalAllowance || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      handleBaseSalaryChange('professionalAllowance', value);
                    }
                  }}
                  placeholder="专业加给"
                  variant="purple"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ClayInput
                  label="餐补 (元)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseSalary.mealAllowance || ''}
                  onChange={(e) => {
                    handleBaseSalaryChange('mealAllowance', e.target.value);
                  }}
                  placeholder="餐补"
                  variant="purple"
                />
                <ClayInput
                  label="夜班津贴 (元)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseSalary.nightShiftAllowance || ''}
                  onChange={(e) => {
                    handleBaseSalaryChange('nightShiftAllowance', e.target.value);
                  }}
                  placeholder="夜班津贴"
                  variant="purple"
                />
              </div>
              <ClayInput
                  label="无尘衣津贴 (元)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseSalary.cleanRoomAllowance || ''}
                  onChange={(e) => {
                    handleBaseSalaryChange('cleanRoomAllowance', e.target.value);
                  }}
                placeholder="无尘衣津贴"
                variant="purple"
              />
            </div>
          </ClayCardContent>
        </ClayCard>

        {/* 加班时长输入区 */}
        <ClayCard variant="green" padding="sm">
          <ClayCardTitle>加班时长</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <ClayInput
                  label={`加班1 (${overtimeRates.overtime1}元/小时)`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={overtimeHours.overtime1 || ''}
                  onChange={(e) => {
                    handleOvertimeHoursChange('overtime1', e.target.value);
                  }}
                  placeholder="加班1时长"
                  variant="green"
                />
                <ClayInput
                  label={`加班2 (${overtimeRates.overtime2}元/小时)`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={overtimeHours.overtime2 || ''}
                  onChange={(e) => {
                    handleOvertimeHoursChange('overtime2', e.target.value);
                  }}
                  placeholder="加班2时长"
                  variant="green"
                />
              </div>
              <ClayInput
                label={`加班3 (${overtimeRates.overtime3}元/小时)`}
                type="number"
                step="0.01"
                min="0"
                value={overtimeHours.overtime3 || ''}
                onChange={(e) => {
                  handleOvertimeHoursChange('overtime3', e.target.value);
                }}
                placeholder="加班3时长"
                variant="green"
              />
            </div>
          </ClayCardContent>
        </ClayCard>

        {/* 其它加项输入区 */}
        <ClayCard variant="pink" padding="sm">
          <ClayCardTitle>其它加项</ClayCardTitle>
          <ClayCardContent>
            <div className="space-y-2">
              {/* 现有自定义项目 */}
              {baseSalary.customItems.map((item) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <ClayInput
                      label="项目名称"
                      value={item.name}
                      onChange={(e) => handleUpdateCustomItem(item.id, e.target.value, item.amount)}
                      placeholder="请输入项目名称"
                      variant="pink"
                    />
                  </div>
                  <div className="flex-1">
                    <ClayInput
                      label="金额 (元)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount || ''}
                      onChange={(e) => {
                        handleUpdateCustomItem(item.id, item.name, parseFloat(e.target.value) || 0);
                      }}
                      placeholder="请输入金额"
                      variant="pink"
                    />
                  </div>
                  <ClayButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveCustomItem(item.id)}
                    className="mb-1"
                  >
                    <X className="w-4 h-4" />
                  </ClayButton>
                </div>
              ))}
              
              {/* 添加新项目 */}
              <div className="border-t pt-2 space-y-1.5">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <ClayInput
                      label="新项目名称"
                      value={newCustomItemName}
                      onChange={(e) => setNewCustomItemName(e.target.value)}
                      placeholder="请输入项目名称"
                      variant="pink"
                    />
                  </div>
                  <div className="flex-1">
                    <ClayInput
                    label="金额 (元)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCustomItemAmount}
                    onChange={(e) => {
                      setNewCustomItemAmount(e.target.value);
                    }}
                    placeholder="请输入金额"
                    variant="pink"
                  />
                  </div>
                  <ClayButton
                    variant="primary"
                    size="sm"
                    onClick={handleAddCustomItem}
                    className="mb-1"
                  >
                    <Plus className="w-4 h-4" />
                  </ClayButton>
                </div>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>
      </div>

      {/* 计算结果显示区 - 简洁卡片式布局 */}
      {calculation && (
        <ClayCard variant="default" padding="sm">
          <ClayCardContent>
            {/* 薪资概览卡片 */}
            <div className={cn(
              "rounded-xl p-3 text-center mb-3 transition-colors duration-300",
              colors.calculator.totalSalary.background
            )}>
              <div className={cn(
                "text-sm font-medium mb-1 transition-colors duration-300",
                colors.calculator.totalSalary.text
              )}>总薪资</div>
              <div className={cn(
                "text-2xl font-bold transition-colors duration-300",
                colors.calculator.totalSalary.amount
              )}>
                ¥{formatAmount(calculation.totalSalary)}
              </div>
            </div>

            {/* 薪资构成 - 简洁网格布局 */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {/* 基础薪资卡片 */}
              {calculation.baseSalaryTotal > 0 && (
                <div className={cn(
                  "rounded-lg p-2 text-center transition-colors duration-300",
                  colors.calculator.baseSalary.background
                )}>
                  <div className={cn(
                    "text-xs mb-1 transition-colors duration-300",
                    colors.calculator.baseSalary.text
                  )}>基础薪资</div>
                  <div className={cn(
                    "text-lg font-bold transition-colors duration-300",
                    colors.calculator.baseSalary.amount
                  )}>
                    ¥{formatAmount(calculation.baseSalaryTotal)}
                  </div>
                </div>
              )}
              
              {/* 加班费卡片 */}
              {calculation.totalOvertimeAmount > 0 && (
                <div className={cn(
                  "rounded-lg p-2 text-center transition-colors duration-300",
                  colors.calculator.overtime.background
                )}>
                  <div className={cn(
                    "text-xs mb-1 transition-colors duration-300",
                    colors.calculator.overtime.text
                  )}>加班费</div>
                  <div className={cn(
                    "text-lg font-bold transition-colors duration-300",
                    colors.calculator.overtime.amount
                  )}>
                    ¥{formatAmount(calculation.totalOvertimeAmount)}
                  </div>
                </div>
              )}
              
              {/* 其它加项卡片 */}
              {calculation.customItemsTotal > 0 && (
                <div className={cn(
                  "rounded-lg p-2 text-center transition-colors duration-300",
                  colors.calculator.customItems.background
                )}>
                  <div className={cn(
                    "text-xs mb-1 transition-colors duration-300",
                    colors.calculator.customItems.text
                  )}>其它加项</div>
                  <div className={cn(
                    "text-lg font-bold transition-colors duration-300",
                    colors.calculator.customItems.amount
                  )}>
                    ¥{formatAmount(calculation.customItemsTotal)}
                  </div>
                </div>
              )}
            </div>

            {/* 详细明细 - 可折叠 */}
            <details className="group mb-3">
              <summary className={cn(
                "cursor-pointer text-sm font-medium transition-colors",
                colors.calculator.details.label,
                isDark ? "hover:text-slate-100" : "hover:text-slate-800"
              )}>
                <span className="inline-flex items-center gap-1">
                  查看详细明细
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                {/* 基础薪资详情 */}
                {calculation.baseSalaryTotal > 0 && (
                  <div className={cn(
                    "rounded-lg p-2 transition-colors duration-300",
                    colors.calculator.details.background
                  )}>
                    <div className={cn(
                      "font-medium mb-2 transition-colors duration-300",
                      colors.calculator.details.label
                    )}>基础薪资明细</div>
                    <div className={cn(
                      "space-y-1 transition-colors duration-300",
                      colors.calculator.details.text
                    )}>
                      {calculation.breakdown.baseSalary > 0 && (
                        <div className="flex justify-between">
                          <span>本薪</span>
                          <span>¥{formatAmount(calculation.breakdown.baseSalary)}</span>
                        </div>
                      )}
                      {calculation.breakdown.professionalAllowance > 0 && (
                        <div className="flex justify-between">
                          <span>专业加给</span>
                          <span>¥{formatAmount(calculation.breakdown.professionalAllowance)}</span>
                        </div>
                      )}
                      {calculation.breakdown.mealAllowance > 0 && (
                        <div className="flex justify-between">
                          <span>餐补</span>
                          <span>¥{formatAmount(calculation.breakdown.mealAllowance)}</span>
                        </div>
                      )}
                      {calculation.breakdown.nightShiftAllowance > 0 && (
                        <div className="flex justify-between">
                          <span>夜班津贴</span>
                          <span>¥{formatAmount(calculation.breakdown.nightShiftAllowance)}</span>
                        </div>
                      )}
                      {calculation.breakdown.cleanRoomAllowance > 0 && (
                        <div className="flex justify-between">
                          <span>无尘衣津贴</span>
                          <span>¥{formatAmount(calculation.breakdown.cleanRoomAllowance)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 加班费详情 */}
                {calculation.totalOvertimeAmount > 0 && (
                  <div className={cn(
                    "rounded-lg p-3 transition-colors duration-300",
                    colors.calculator.details.background
                  )}>
                    <div className={cn(
                      "font-medium mb-2 transition-colors duration-300",
                      colors.calculator.details.label
                    )}>加班费明细</div>
                    <div className={cn(
                      "space-y-1 transition-colors duration-300",
                      colors.calculator.details.text
                    )}>
                      {calculation.breakdown.overtime1 > 0 && (
                        <div className="flex justify-between">
                          <span>加班1</span>
                          <span>¥{formatAmount(calculation.breakdown.overtime1)}</span>
                        </div>
                      )}
                      {calculation.breakdown.overtime2 > 0 && (
                        <div className="flex justify-between">
                          <span>加班2</span>
                          <span>¥{formatAmount(calculation.breakdown.overtime2)}</span>
                        </div>
                      )}
                      {calculation.breakdown.overtime3 > 0 && (
                        <div className="flex justify-between">
                          <span>加班3</span>
                          <span>¥{formatAmount(calculation.breakdown.overtime3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 其它加项详情 */}
                {calculation.customItemsTotal > 0 && (
                  <div className={cn(
                    "rounded-lg p-3 transition-colors duration-300",
                    colors.calculator.details.background
                  )}>
                    <div className={cn(
                      "font-medium mb-2 transition-colors duration-300",
                      colors.calculator.details.label
                    )}>其它加项明细</div>
                    <div className={cn(
                      "space-y-1 transition-colors duration-300",
                      colors.calculator.details.text
                    )}>
                      {baseSalary.customItems.filter(item => item.amount > 0).map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>¥{formatAmount(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* 备注和操作按钮 - 移动端优化 */}
            <div className="space-y-1.5">
              <ClayInput
                label="备注 (可选)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注信息..."
              />
              <div className="grid grid-cols-2 gap-2">
                <ClayButton
                  variant="primary"
                  onClick={handleSaveRecord}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  保存记录
                </ClayButton>
                <ClayButton
                  variant="secondary"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置数据
                </ClayButton>
              </div>
            </div>
          </ClayCardContent>
        </ClayCard>
      )}

      {/* 月份选择对话框 */}
       <MonthPickerDialog
         isOpen={showMonthPicker}
         onConfirm={handleMonthPickerConfirm}
         onClose={handleMonthPickerCancel}
       />
    </div>
  );
});

SalaryCalculator.displayName = 'SalaryCalculator';