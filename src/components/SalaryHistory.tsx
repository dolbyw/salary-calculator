import React, { useState, useCallback } from 'react';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayButton } from './ui/ClayButton';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useSalaryStore } from '../store/salaryStore';
import { SalaryCharts } from './SalaryCharts';
import { useTheme } from '../hooks/useTheme';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { cn, formatAmount, formatDate } from '../lib/utils';
import { History, Trash2, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { SalaryRecord } from '../types/salary';

/**
 * 历史记录页面组件
 */
export const SalaryHistory: React.FC = React.memo(() => {
  const { records, deleteRecord, clearAllRecords } = useSalaryStore();
  const { isDark, colors } = useTheme();
  const { showConfirm, dialogState, closeDialog } = useConfirmDialog();
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);

  /**
   * 删除单条记录 - 使用useCallback优化
   */
  const handleDeleteRecord = useCallback((id: string) => {
    deleteRecord(id);
    toast.success('记录已删除');
  }, [deleteRecord]);

  /**
   * 清空所有记录 - 使用useCallback优化
   */
  const handleClearAll = useCallback(async () => {
    if (records.length === 0) {
      toast.error('没有记录可清空');
      return;
    }
    
    const confirmed = await showConfirm({
      title: '清空所有记录',
      message: '确定要清空所有记录吗？此操作不可撤销。',
      confirmText: '清空',
      cancelText: '取消',
      variant: 'danger'
    });
    
    if (confirmed) {
      clearAllRecords();
      toast.success('所有记录已清空');
    }
  }, [records.length, clearAllRecords, showConfirm]);

  /**
   * 切换记录详情显示 - 使用useCallback优化
   */
  const toggleRecordDetails = useCallback((id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  }, [expandedRecord]);

  /**
   * 计算记录的详细信息
   */
  const calculateRecordDetails = (record: SalaryRecord) => {
    const baseSalaryTotal = 
      record.baseSalary.baseSalary +
      record.baseSalary.professionalAllowance +
      record.baseSalary.mealAllowance +
      record.baseSalary.nightShiftAllowance +
      record.baseSalary.cleanRoomAllowance;

    const overtime1Amount = record.overtimeHours.overtime1 * record.overtimeRates.overtime1;
    const overtime2Amount = record.overtimeHours.overtime2 * record.overtimeRates.overtime2;
    const overtime3Amount = record.overtimeHours.overtime3 * record.overtimeRates.overtime3;
    const totalOvertimeAmount = overtime1Amount + overtime2Amount + overtime3Amount;

    return {
      baseSalaryTotal,
      overtime1Amount,
      overtime2Amount,
      overtime3Amount,
      totalOvertimeAmount,
    };
  };

  return (
    <div className="space-y-2 px-1">
      {/* 图表区域 */}
      {showCharts && records.length > 0 && (
        <div className="mb-3">
          <SalaryCharts />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className={cn(
          "text-sm transition-colors duration-300",
          colors.text.secondary
        )}>
          共 {records.length} 条记录
        </div>
        {records.length > 0 && (
          <ClayButton
            variant="danger"
            size="sm"
            onClick={handleClearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            清空所有记录
          </ClayButton>
        )}
      </div>

      {/* 记录列表 */}
      {records.length === 0 ? (
        <ClayCard variant="default" padding="sm" className="text-center py-8">
          <ClayCardContent>
            <History className={cn(
              "w-16 h-16 mx-auto mb-4 transition-colors duration-300",
              colors.text.tertiary
            )} />
            <h3 className={cn(
              "text-lg font-medium mb-2 transition-colors duration-300",
              colors.text.secondary
            )}>暂无记录</h3>
            <p className={cn(
              "transition-colors duration-300",
              colors.text.tertiary
            )}>您还没有保存任何薪资计算记录</p>
          </ClayCardContent>
        </ClayCard>
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const details = calculateRecordDetails(record);
            const isExpanded = expandedRecord === record.id;

            return (
              <ClayCard
                key={record.id}
                variant="default"
                hover
                className="transition-all duration-300"
              >
                <ClayCardContent>
                  {/* 记录概要 - 移动端优化 */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "flex items-center gap-2 transition-colors duration-300",
                        colors.history.item.text
                      )}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(record.date)}</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 transition-colors duration-300",
                        colors.history.item.amount
                      )}>
                        <span className="font-semibold">¥{formatAmount(record.totalSalary)}</span>
                      </div>
                    </div>
                    {record.note && (
                      <div className={cn(
                        "text-xs px-2 py-1 rounded-full inline-block transition-colors duration-300",
                        colors.history.details.background,
                        colors.history.details.text
                      )}>
                        {record.note}
                      </div>
                    )}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      <ClayButton
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleRecordDetails(record.id)}
                        className="flex items-center justify-center gap-1 text-xs"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            收起
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            详情
                          </>
                        )}
                      </ClayButton>
                      <ClayButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="flex items-center justify-center gap-1 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </ClayButton>
                    </div>
                  </div>

                  {/* 记录详情 - 移动端优化 */}
                  {isExpanded && (
                    <div className="border-t pt-3 mt-3">
                      <div className="space-y-3">
                        {/* 基础薪资详情 */}
                        <div>
                          <h4 className={cn(
                            "font-medium mb-2 transition-colors duration-300",
                            colors.history.details.label
                          )}>基础薪资</h4>
                          <div className="space-y-2 text-sm">
                            {record.baseSalary.baseSalary > 0 && (
                              <div className={cn(
                                "flex justify-between transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>本薪:</span>
                                <span>¥{formatAmount(record.baseSalary.baseSalary)}</span>
                              </div>
                            )}
                            {record.baseSalary.professionalAllowance > 0 && (
                              <div className={cn(
                                "flex justify-between transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>专业加给:</span>
                                <span>¥{formatAmount(record.baseSalary.professionalAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.mealAllowance > 0 && (
                              <div className={cn(
                                "flex justify-between transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>餐补:</span>
                                <span>¥{formatAmount(record.baseSalary.mealAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.nightShiftAllowance > 0 && (
                              <div className={cn(
                                "flex justify-between transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>夜班津贴:</span>
                                <span>¥{formatAmount(record.baseSalary.nightShiftAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.cleanRoomAllowance > 0 && (
                              <div className={cn(
                                "flex justify-between transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>无尘衣津贴:</span>
                                <span>¥{formatAmount(record.baseSalary.cleanRoomAllowance)}</span>
                              </div>
                            )}
                            {details.baseSalaryTotal > 0 && (
                              <div className={cn(
                                "flex justify-between font-medium pt-2 border-t transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>小计:</span>
                                <span>¥{formatAmount(details.baseSalaryTotal)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 加班详情 */}
                        {details.totalOvertimeAmount > 0 && (
                          <div>
                            <h4 className={cn(
                              "font-medium mb-2 transition-colors duration-300",
                              colors.history.details.label
                            )}>加班费</h4>
                            <div className="space-y-2 text-sm">
                              {details.overtime1Amount > 0 && (
                                <div className={cn(
                                  "flex justify-between transition-colors duration-300",
                                  colors.history.details.text
                                )}>
                                  <span>加班1 ({record.overtimeHours.overtime1}h × ¥{record.overtimeRates.overtime1}):</span>
                                  <span>¥{formatAmount(details.overtime1Amount)}</span>
                                </div>
                              )}
                              {details.overtime2Amount > 0 && (
                                <div className={cn(
                                  "flex justify-between transition-colors duration-300",
                                  colors.history.details.text
                                )}>
                                  <span>加班2 ({record.overtimeHours.overtime2}h × ¥{record.overtimeRates.overtime2}):</span>
                                  <span>¥{formatAmount(details.overtime2Amount)}</span>
                                </div>
                              )}
                              {details.overtime3Amount > 0 && (
                                <div className={cn(
                                  "flex justify-between transition-colors duration-300",
                                  colors.history.details.text
                                )}>
                                  <span>加班3 ({record.overtimeHours.overtime3}h × ¥{record.overtimeRates.overtime3}):</span>
                                  <span>¥{formatAmount(details.overtime3Amount)}</span>
                                </div>
                              )}
                              <div className={cn(
                                "flex justify-between font-medium pt-2 border-t transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>小计:</span>
                                <span>¥{formatAmount(details.totalOvertimeAmount)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 其它加项详情 */}
                        {record.baseSalary.customItems && record.baseSalary.customItems.filter(item => item.amount > 0).length > 0 && (
                          <div>
                            <h4 className={cn(
                              "font-medium mb-2 transition-colors duration-300",
                              colors.history.details.label
                            )}>其它加项</h4>
                            <div className="space-y-2 text-sm">
                              {record.baseSalary.customItems.filter(item => item.amount > 0).map((item) => (
                                <div key={item.id} className={cn(
                                  "flex justify-between transition-colors duration-300",
                                  colors.history.details.text
                                )}>
                                  <span>{item.name}:</span>
                                  <span>¥{formatAmount(item.amount)}</span>
                                </div>
                              ))}
                              <div className={cn(
                                "flex justify-between font-medium pt-2 border-t transition-colors duration-300",
                                colors.history.details.text
                              )}>
                                <span>小计:</span>
                                <span>¥{formatAmount(record.baseSalary.customItems.reduce((sum, item) => sum + (item.amount || 0), 0))}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 总计 - 移动端优化 */}
                        <div>
                          <div className={cn(
                            "rounded-xl p-2 text-center transition-colors duration-300",
                            colors.history.summary.background,
                            colors.history.summary.border
                          )}>
                            <div className={cn(
                              "text-sm mb-1 transition-colors duration-300",
                              colors.history.summary.text
                            )}>总薪资</div>
                            <div className={cn(
                              "text-xl font-bold transition-colors duration-300",
                              colors.history.summary.text
                            )}>
                              ¥{formatAmount(record.totalSalary)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ClayCardContent>
              </ClayCard>
            );
          })}
        </div>
      )}
      
      {/* 确认对话框 */}
      <ConfirmDialog 
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onClose={dialogState.onCancel || closeDialog}
      />
    </div>
  );
});