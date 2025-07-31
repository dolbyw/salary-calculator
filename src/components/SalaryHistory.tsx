import React, { useState } from 'react';
import { ClayCard, ClayCardTitle, ClayCardContent } from './ui/ClayCard';
import { ClayButton } from './ui/ClayButton';
import { useSalaryStore } from '../store/salaryStore';
import { SalaryCharts } from './SalaryCharts';
import { History, Trash2, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { SalaryRecord } from '../types/salary';

/**
 * 历史记录页面组件
 */
export const SalaryHistory: React.FC = () => {
  const { records, deleteRecord, clearAllRecords } = useSalaryStore();
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);

  /**
   * 删除单条记录
   */
  const handleDeleteRecord = (id: string) => {
    deleteRecord(id);
    toast.success('记录已删除');
  };

  /**
   * 清空所有记录
   */
  const handleClearAll = () => {
    if (records.length === 0) {
      toast.error('没有记录可清空');
      return;
    }
    
    if (window.confirm('确定要清空所有记录吗？此操作不可撤销。')) {
      clearAllRecords();
      toast.success('所有记录已清空');
    }
  };

  /**
   * 切换记录详情显示
   */
  const toggleRecordDetails = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  /**
   * 格式化金额显示
   */
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  };

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
        <div className="text-sm text-slate-600">
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
            <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">暂无记录</h3>
            <p className="text-slate-500">您还没有保存任何薪资计算记录</p>
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
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <span className="font-semibold">¥{formatAmount(record.totalSalary)}</span>
                      </div>
                    </div>
                    {record.note && (
                      <div className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full inline-block">
                        {record.note}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
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
                          <h4 className="font-medium text-slate-700 mb-2">基础薪资</h4>
                          <div className="space-y-2 text-sm">
                            {record.baseSalary.baseSalary > 0 && (
                              <div className="flex justify-between">
                                <span>本薪:</span>
                                <span>¥{formatAmount(record.baseSalary.baseSalary)}</span>
                              </div>
                            )}
                            {record.baseSalary.professionalAllowance > 0 && (
                              <div className="flex justify-between">
                                <span>专业加给:</span>
                                <span>¥{formatAmount(record.baseSalary.professionalAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.mealAllowance > 0 && (
                              <div className="flex justify-between">
                                <span>餐补:</span>
                                <span>¥{formatAmount(record.baseSalary.mealAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.nightShiftAllowance > 0 && (
                              <div className="flex justify-between">
                                <span>夜班津贴:</span>
                                <span>¥{formatAmount(record.baseSalary.nightShiftAllowance)}</span>
                              </div>
                            )}
                            {record.baseSalary.cleanRoomAllowance > 0 && (
                              <div className="flex justify-between">
                                <span>无尘衣津贴:</span>
                                <span>¥{formatAmount(record.baseSalary.cleanRoomAllowance)}</span>
                              </div>
                            )}
                            {details.baseSalaryTotal > 0 && (
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>小计:</span>
                                <span>¥{formatAmount(details.baseSalaryTotal)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 加班详情 */}
                        {details.totalOvertimeAmount > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">加班费</h4>
                            <div className="space-y-2 text-sm">
                              {details.overtime1Amount > 0 && (
                                <div className="flex justify-between">
                                  <span>加班1 ({record.overtimeHours.overtime1}h × ¥{record.overtimeRates.overtime1}):</span>
                                  <span>¥{formatAmount(details.overtime1Amount)}</span>
                                </div>
                              )}
                              {details.overtime2Amount > 0 && (
                                <div className="flex justify-between">
                                  <span>加班2 ({record.overtimeHours.overtime2}h × ¥{record.overtimeRates.overtime2}):</span>
                                  <span>¥{formatAmount(details.overtime2Amount)}</span>
                                </div>
                              )}
                              {details.overtime3Amount > 0 && (
                                <div className="flex justify-between">
                                  <span>加班3 ({record.overtimeHours.overtime3}h × ¥{record.overtimeRates.overtime3}):</span>
                                  <span>¥{formatAmount(details.overtime3Amount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>小计:</span>
                                <span>¥{formatAmount(details.totalOvertimeAmount)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 其它加项详情 */}
                        {record.baseSalary.customItems && record.baseSalary.customItems.filter(item => item.amount > 0).length > 0 && (
                          <div className="border-t border-slate-400 pt-3">
                            <h4 className="font-medium text-slate-700 mb-2">其它加项</h4>
                            <div className="space-y-2 text-sm">
                              {record.baseSalary.customItems.filter(item => item.amount > 0).map((item) => (
                                <div key={item.id} className="flex justify-between">
                                  <span>{item.name}:</span>
                                  <span>¥{formatAmount(item.amount)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>小计:</span>
                                <span>¥{formatAmount(record.baseSalary.customItems.reduce((sum, item) => sum + (item.amount || 0), 0))}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 总计 - 移动端优化 */}
                        <div>
                          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-2 text-center">
                            <div className="text-sm text-purple-700 mb-1">总薪资</div>
                            <div className="text-xl font-bold text-purple-900">
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
    </div>
  );
};