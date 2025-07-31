import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SalaryRecord, BaseSalary, OvertimeHours, OvertimeRate, SalaryCalculation, CustomSalaryItem, ChartData, MonthlySalaryStats } from '../types/salary';

interface SalaryState {
  // 当前输入的薪资数据
  baseSalary: BaseSalary;
  overtimeHours: OvertimeHours;
  overtimeRates: OvertimeRate;
  
  // 历史记录
  records: SalaryRecord[];
  
  // 计算结果
  calculation: SalaryCalculation | null;
  
  // Actions
  updateBaseSalary: (field: keyof Omit<BaseSalary, 'customItems'>, value: number) => void;
  updateOvertimeHours: (field: keyof OvertimeHours, value: number) => void;
  updateOvertimeRates: (rates: OvertimeRate) => void;
  addCustomItem: (name: string, amount: number) => void;
  updateCustomItem: (id: string, name: string, amount: number) => void;
  removeCustomItem: (id: string) => void;
  calculateSalary: () => void;
  saveRecord: (year: number, month: number, note?: string) => void;
  deleteRecord: (id: string) => void;
  clearAllRecords: () => void;
  exportRecords: () => string;
  importRecords: (csvContent: string) => { success: boolean; message: string; importedCount?: number };
  resetCurrentData: () => void;
  getChartData: (recordId?: string) => ChartData[];
  getMonthlySalaryStats: () => MonthlySalaryStats[];
  getAvailableMonths: () => string[];
  getFilteredMonthlySalaryStats: (startMonth?: string, endMonth?: string) => MonthlySalaryStats[];
  getMonthlyChartData: (month: string) => ChartData[];
}

/**
 * 计算薪资总额和明细
 */
export const calculateSalaryDetails = (
  baseSalary: BaseSalary,
  overtimeHours: OvertimeHours,
  overtimeRates: OvertimeRate
): SalaryCalculation => {
  // 基础薪资总额（不包含自定义项目）
  const baseSalaryTotal = 
    baseSalary.baseSalary +
    baseSalary.professionalAllowance +
    baseSalary.mealAllowance +
    baseSalary.nightShiftAllowance +
    baseSalary.cleanRoomAllowance;

  // 自定义项目总额
  const customItemsTotal = baseSalary.customItems?.reduce((sum, item) => sum + item.amount, 0) || 0;

  // 加班费计算
  const overtime1Amount = overtimeHours.overtime1 * overtimeRates.overtime1;
  const overtime2Amount = overtimeHours.overtime2 * overtimeRates.overtime2;
  const overtime3Amount = overtimeHours.overtime3 * overtimeRates.overtime3;
  const totalOvertimeAmount = overtime1Amount + overtime2Amount + overtime3Amount;

  // 总薪资
  const totalSalary = baseSalaryTotal + customItemsTotal + totalOvertimeAmount;

  return {
    baseSalaryTotal,
    overtime1Amount,
    overtime2Amount,
    overtime3Amount,
    totalOvertimeAmount,
    customItemsTotal,
    totalSalary,
    breakdown: {
      baseSalary: baseSalary.baseSalary,
      professionalAllowance: baseSalary.professionalAllowance,
      mealAllowance: baseSalary.mealAllowance,
      nightShiftAllowance: baseSalary.nightShiftAllowance,
      cleanRoomAllowance: baseSalary.cleanRoomAllowance,
      customItems: customItemsTotal,
      overtime1: overtime1Amount,
      overtime2: overtime2Amount,
      overtime3: overtime3Amount,
    },
  };
};

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};



export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      // 初始状态
      baseSalary: {
        baseSalary: 0,
        professionalAllowance: 0,
        mealAllowance: 0,
        nightShiftAllowance: 0,
        cleanRoomAllowance: 0,
        customItems: [],
      },
      overtimeHours: {
        overtime1: 0,
        overtime2: 0,
        overtime3: 0,
      },
      overtimeRates: {
        overtime1: 21, // 默认费率
        overtime2: 28,
        overtime3: 42,
      },
      records: [],
      calculation: null,

      // 更新基础薪资
      updateBaseSalary: (field, value) => {
        set((state) => ({
          baseSalary: {
            ...state.baseSalary,
            [field]: value,
          },
        }));
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 更新加班时长
      updateOvertimeHours: (field, value) => {
        set((state) => ({
          overtimeHours: {
            ...state.overtimeHours,
            [field]: value,
          },
        }));
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 更新加班费率
      updateOvertimeRates: (rates) => {
        set({ overtimeRates: rates });
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 添加自定义项目
      addCustomItem: (name, amount) => {
        const newItem: CustomSalaryItem = {
          id: generateId(),
          name,
          amount,
        };
        set((state) => ({
          baseSalary: {
            ...state.baseSalary,
            customItems: [...state.baseSalary.customItems, newItem],
          },
        }));
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 更新自定义项目
      updateCustomItem: (id, name, amount) => {
        set((state) => ({
          baseSalary: {
            ...state.baseSalary,
            customItems: state.baseSalary.customItems.map((item) =>
              item.id === id ? { ...item, name, amount } : item
            ),
          },
        }));
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 删除自定义项目
      removeCustomItem: (id) => {
        set((state) => ({
          baseSalary: {
            ...state.baseSalary,
            customItems: state.baseSalary.customItems.filter((item) => item.id !== id),
          },
        }));
        // 自动重新计算
        setTimeout(() => get().calculateSalary(), 0);
      },

      // 计算薪资
      calculateSalary: () => {
        const { baseSalary, overtimeHours, overtimeRates } = get();
        const calculation = calculateSalaryDetails(baseSalary, overtimeHours, overtimeRates);
        set({ calculation });
      },

      // 保存记录
      saveRecord: (year, month, note) => {
        const { baseSalary, overtimeHours, overtimeRates, calculation } = get();
        if (!calculation) return;

        const record: SalaryRecord = {
          id: generateId(),
          date: `${year}-${String(month).padStart(2, '0')}-01`,
          year,
          month,
          baseSalary,
          overtimeHours,
          overtimeRates,
          totalSalary: calculation.totalSalary,
          note,
        };

        set((state) => ({
          records: [record, ...state.records],
        }));
      },

      // 删除记录
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        }));
      },

      // 清空所有记录
      clearAllRecords: () => {
        set({ records: [] });
      },

      // 导出记录为CSV - 增强可靠性
      exportRecords: () => {
        try {
          const { records } = get();
          if (!records || records.length === 0) {
            throw new Error('没有数据可导出');
          }

          const headers = [
            '日期',
            '年份',
            '月份',
            '本薪',
            '专业加给', 
            '餐补',
            '夜班津贴',
            '无尘衣津贴',
            '自定义项目',
            '加班1时长',
            '加班1费率',
            '加班2时长', 
            '加班2费率',
            '加班3时长',
            '加班3费率',
            '总薪资',
            '备注',
          ];

          // 转义CSV字段中的特殊字符
          const escapeCSVField = (field: any): string => {
            const str = String(field || '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          };

          const csvContent = [
            headers.map(escapeCSVField).join(','),
            ...records.map((record) => {
              // 序列化自定义项目
              const customItemsStr = record.baseSalary.customItems?.map(item => 
                `${item.name}:${item.amount}`
              ).join(';') || '';
              
              return [
                escapeCSVField(record.date),
                escapeCSVField(record.year || new Date(record.date).getFullYear()),
                escapeCSVField(record.month || new Date(record.date).getMonth() + 1),
                escapeCSVField(record.baseSalary.baseSalary),
                escapeCSVField(record.baseSalary.professionalAllowance),
                escapeCSVField(record.baseSalary.mealAllowance),
                escapeCSVField(record.baseSalary.nightShiftAllowance),
                escapeCSVField(record.baseSalary.cleanRoomAllowance),
                escapeCSVField(customItemsStr),
                escapeCSVField(record.overtimeHours.overtime1),
                escapeCSVField(record.overtimeRates.overtime1),
                escapeCSVField(record.overtimeHours.overtime2),
                escapeCSVField(record.overtimeRates.overtime2),
                escapeCSVField(record.overtimeHours.overtime3),
                escapeCSVField(record.overtimeRates.overtime3),
                escapeCSVField(record.totalSalary),
                escapeCSVField(record.note || ''),
              ].join(',');
            }),
          ].join('\n');

          // 添加BOM以支持中文字符
          return '\uFEFF' + csvContent;
        } catch (error) {
          console.error('导出数据失败:', error);
          throw error;
        }
      },

      // 导入记录从CSV - 增强可靠性
      importRecords: (csvContent: string) => {
        try {
          if (!csvContent || csvContent.trim() === '') {
            return { success: false, message: 'CSV内容为空' };
          }

          // 移除BOM字符
          const cleanContent = csvContent.replace(/^\uFEFF/, '');
          const lines = cleanContent.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length < 2) {
            return { success: false, message: 'CSV文件格式不正确，至少需要标题行和一行数据' };
          }

          // 解析CSV行，处理引号包围的字段
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            let i = 0;
            
            while (i < line.length) {
              const char = line[i];
              
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i += 2;
                } else {
                  inQuotes = !inQuotes;
                  i++;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
                i++;
              } else {
                current += char;
                i++;
              }
            }
            
            result.push(current);
            return result;
          };

          const headers = parseCSVLine(lines[0]);
          const dataLines = lines.slice(1);
          
          // 验证标题格式
          const expectedHeaders = [
            '日期', '年份', '月份', '本薪', '专业加给', '餐补', '夜班津贴', '无尘衣津贴', '自定义项目',
            '加班1时长', '加班1费率', '加班2时长', '加班2费率', '加班3时长', '加班3费率',
            '总薪资', '备注'
          ];
          
          if (headers.length < 14) {
            return { success: false, message: 'CSV文件格式不正确，缺少必要的列' };
          }

          const importedRecords: SalaryRecord[] = [];
          const errors: string[] = [];

          for (let i = 0; i < dataLines.length; i++) {
            try {
              const fields = parseCSVLine(dataLines[i]);
              
              if (fields.length < 14) {
                errors.push(`第${i + 2}行：数据列数不足`);
                continue;
              }

              // 数据验证和转换工具函数
              const parseNumber = (value: string, fieldName: string): number => {
                const num = parseFloat(value || '0');
                if (isNaN(num) || num < 0) throw new Error(`${fieldName}必须是非负数字`);
                return num;
              };

              const validateDate = (dateStr: string): string => {
                if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                  throw new Error('日期格式必须为YYYY-MM-DD');
                }
                return dateStr;
              };

              const parseYear = (value: string): number => {
                const year = parseInt(value || '0');
                if (isNaN(year) || year < 1900 || year > 2100) {
                  throw new Error('年份必须是有效的年份');
                }
                return year;
              };

              const parseMonth = (value: string): number => {
                const month = parseInt(value || '0');
                if (isNaN(month) || month < 1 || month > 12) {
                  throw new Error('月份必须是1-12之间的数字');
                }
                return month;
              };

              // 解析自定义项目
              const parseCustomItems = (customItemsStr: string): CustomSalaryItem[] => {
                if (!customItemsStr || customItemsStr.trim() === '') return [];
                
                try {
                  return customItemsStr.split(';').map(item => {
                    const [name, amountStr] = item.split(':');
                    if (!name || !amountStr) throw new Error('自定义项目格式错误');
                    
                    return {
                      id: generateId(),
                      name: name.trim(),
                      amount: parseNumber(amountStr, '自定义项目金额'),
                    };
                  });
                } catch (error) {
                  throw new Error('自定义项目格式错误，应为"名称:金额;名称:金额"');
                }
              };

              const record: SalaryRecord = {
                id: generateId(),
                date: validateDate(fields[0]),
                year: parseYear(fields[1]),
                month: parseMonth(fields[2]),
                baseSalary: {
                  baseSalary: parseNumber(fields[3], '本薪'),
                  professionalAllowance: parseNumber(fields[4], '专业加给'),
                  mealAllowance: parseNumber(fields[5], '餐补'),
                  nightShiftAllowance: parseNumber(fields[6], '夜班津贴'),
                  cleanRoomAllowance: parseNumber(fields[7], '无尘衣津贴'),
                  customItems: parseCustomItems(fields[8]),
                },
                overtimeHours: {
                  overtime1: parseNumber(fields[9], '加班1时长'),
                  overtime2: parseNumber(fields[11], '加班2时长'),
                  overtime3: parseNumber(fields[13], '加班3时长'),
                },
                overtimeRates: {
                  overtime1: fields[10] ? parseNumber(fields[10], '加班1费率') : get().overtimeRates.overtime1,
                  overtime2: fields[12] ? parseNumber(fields[12], '加班2费率') : get().overtimeRates.overtime2,
                  overtime3: fields[14] ? parseNumber(fields[14], '加班3费率') : get().overtimeRates.overtime3,
                },
                totalSalary: fields[15] ? parseNumber(fields[15], '总薪资') : 0,
                note: fields[16] || '',
              };

              // 重新计算总薪资以确保数据一致性
              const calculation = calculateSalaryDetails(
                record.baseSalary,
                record.overtimeHours,
                record.overtimeRates
              );
              record.totalSalary = calculation.totalSalary;

              importedRecords.push(record);
            } catch (error) {
              errors.push(`第${i + 2}行：${error instanceof Error ? error.message : '数据格式错误'}`);
            }
          }

          if (importedRecords.length === 0) {
            return {
              success: false,
              message: `导入失败：${errors.join('; ')}`
            };
          }

          // 合并导入的记录到现有记录中
          set((state) => ({
            records: [...importedRecords, ...state.records],
          }));

          const message = errors.length > 0 
            ? `成功导入${importedRecords.length}条记录，${errors.length}条记录有错误被跳过`
            : `成功导入${importedRecords.length}条记录`;

          return {
            success: true,
            message,
            importedCount: importedRecords.length
          };
        } catch (error) {
          console.error('导入数据失败:', error);
          return {
            success: false,
            message: `导入失败：${error instanceof Error ? error.message : '未知错误'}`
          };
        }
      },

      // 重置当前数据
      resetCurrentData: () => {
        set({
          baseSalary: {
            baseSalary: 0,
            professionalAllowance: 0,
            mealAllowance: 0,
            nightShiftAllowance: 0,
            cleanRoomAllowance: 0,
            customItems: [],
          },
          overtimeHours: {
            overtime1: 0,
            overtime2: 0,
            overtime3: 0,
          },
          calculation: null,
        });
      },

      // 获取图表数据
      getChartData: (recordId) => {
        const { records, calculation } = get();
        let targetRecord: SalaryRecord | null = null;
        let targetCalculation: SalaryCalculation | null = null;

        if (recordId) {
          targetRecord = records.find(r => r.id === recordId) || null;
          if (targetRecord) {
            targetCalculation = calculateSalaryDetails(
              targetRecord.baseSalary,
              targetRecord.overtimeHours,
              targetRecord.overtimeRates
            );
          }
        } else {
          targetCalculation = calculation;
        }

        if (!targetCalculation) return [];

        const chartData: ChartData[] = [];
        
        // 基础薪资项目
        if (targetCalculation.breakdown.baseSalary > 0) {
          chartData.push({ name: '本薪', value: targetCalculation.breakdown.baseSalary, color: '#8b5cf6' });
        }
        if (targetCalculation.breakdown.professionalAllowance > 0) {
          chartData.push({ name: '专业加给', value: targetCalculation.breakdown.professionalAllowance, color: '#a78bfa' });
        }
        if (targetCalculation.breakdown.mealAllowance > 0) {
          chartData.push({ name: '餐补', value: targetCalculation.breakdown.mealAllowance, color: '#c4b5fd' });
        }
        if (targetCalculation.breakdown.nightShiftAllowance > 0) {
          chartData.push({ name: '夜班津贴', value: targetCalculation.breakdown.nightShiftAllowance, color: '#ddd6fe' });
        }
        if (targetCalculation.breakdown.cleanRoomAllowance > 0) {
          chartData.push({ name: '无尘衣津贴', value: targetCalculation.breakdown.cleanRoomAllowance, color: '#ede9fe' });
        }
        
        // 自定义项目
        if (targetCalculation.breakdown.customItems > 0) {
          chartData.push({ name: '其它加项', value: targetCalculation.breakdown.customItems, color: '#f3e8ff' });
        }
        
        // 加班费
        if (targetCalculation.breakdown.overtime1 > 0) {
          chartData.push({ name: '加班1', value: targetCalculation.breakdown.overtime1, color: '#10b981' });
        }
        if (targetCalculation.breakdown.overtime2 > 0) {
          chartData.push({ name: '加班2', value: targetCalculation.breakdown.overtime2, color: '#34d399' });
        }
        if (targetCalculation.breakdown.overtime3 > 0) {
          chartData.push({ name: '加班3', value: targetCalculation.breakdown.overtime3, color: '#6ee7b7' });
        }

        return chartData;
      },

      // 获取月度薪资统计
      getMonthlySalaryStats: () => {
        const { records } = get();
        const monthlyStats = new Map<string, MonthlySalaryStats>();

        records.forEach((record) => {
          const month = record.date.substring(0, 7); // YYYY-MM
          const calculation = calculateSalaryDetails(
            record.baseSalary,
            record.overtimeHours,
            record.overtimeRates
          );

          if (monthlyStats.has(month)) {
            const existing = monthlyStats.get(month)!;
            existing.totalSalary += calculation.totalSalary;
            existing.baseSalaryTotal += calculation.baseSalaryTotal;
            existing.overtimeTotal += calculation.totalOvertimeAmount;
            existing.customItemsTotal += calculation.customItemsTotal;
          } else {
            monthlyStats.set(month, {
              month,
              totalSalary: calculation.totalSalary,
              baseSalaryTotal: calculation.baseSalaryTotal,
              overtimeTotal: calculation.totalOvertimeAmount,
              customItemsTotal: calculation.customItemsTotal,
            });
          }
        });

        return Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month));
      },

      // 获取可用月份列表
      getAvailableMonths: () => {
        const { records } = get();
        const months = new Set<string>();
        
        records.forEach((record) => {
          const monthKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
          months.add(monthKey);
        });
        
        return Array.from(months).sort((a, b) => b.localeCompare(a)); // 降序排列，最新的在前
      },

      // 获取过滤后的月度薪资统计
      getFilteredMonthlySalaryStats: (startMonth, endMonth) => {
        const { records } = get();
        const monthlyStats = new Map<string, MonthlySalaryStats>();

        records.forEach((record) => {
          const monthKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
          
          // 应用月份过滤
          if (startMonth && monthKey < startMonth) return;
          if (endMonth && monthKey > endMonth) return;
          
          const calculation = calculateSalaryDetails(
            record.baseSalary,
            record.overtimeHours,
            record.overtimeRates
          );

          if (monthlyStats.has(monthKey)) {
            const existing = monthlyStats.get(monthKey)!;
            existing.totalSalary += calculation.totalSalary;
            existing.baseSalaryTotal += calculation.baseSalaryTotal;
            existing.overtimeTotal += calculation.totalOvertimeAmount;
            existing.customItemsTotal += calculation.customItemsTotal;
          } else {
            monthlyStats.set(monthKey, {
              month: monthKey,
              totalSalary: calculation.totalSalary,
              baseSalaryTotal: calculation.baseSalaryTotal,
              overtimeTotal: calculation.totalOvertimeAmount,
              customItemsTotal: calculation.customItemsTotal,
            });
          }
        });

        return Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month));
      },

      // 获取指定月份的图表数据
      getMonthlyChartData: (month) => {
        const { records } = get();
        const monthKey = month;
        
        // 找到指定月份的所有记录
        const monthRecords = records.filter(record => {
          const recordMonth = `${record.year}-${String(record.month).padStart(2, '0')}`;
          return recordMonth === monthKey;
        });
        
        if (monthRecords.length === 0) return [];
        
        // 合并该月份的所有数据
        const aggregatedData = {
          baseSalary: 0,
          professionalAllowance: 0,
          mealAllowance: 0,
          nightShiftAllowance: 0,
          cleanRoomAllowance: 0,
          customItems: 0,
          overtime1: 0,
          overtime2: 0,
          overtime3: 0,
        };
        
        monthRecords.forEach(record => {
          const calculation = calculateSalaryDetails(
            record.baseSalary,
            record.overtimeHours,
            record.overtimeRates
          );
          
          aggregatedData.baseSalary += calculation.breakdown.baseSalary;
          aggregatedData.professionalAllowance += calculation.breakdown.professionalAllowance;
          aggregatedData.mealAllowance += calculation.breakdown.mealAllowance;
          aggregatedData.nightShiftAllowance += calculation.breakdown.nightShiftAllowance;
          aggregatedData.cleanRoomAllowance += calculation.breakdown.cleanRoomAllowance;
          aggregatedData.customItems += calculation.breakdown.customItems;
          aggregatedData.overtime1 += calculation.breakdown.overtime1;
          aggregatedData.overtime2 += calculation.breakdown.overtime2;
          aggregatedData.overtime3 += calculation.breakdown.overtime3;
        });
        
        const chartData: ChartData[] = [];
        
        // 基础薪资项目
        if (aggregatedData.baseSalary > 0) {
          chartData.push({ name: '本薪', value: aggregatedData.baseSalary, color: '#8b5cf6' });
        }
        if (aggregatedData.professionalAllowance > 0) {
          chartData.push({ name: '专业加给', value: aggregatedData.professionalAllowance, color: '#a78bfa' });
        }
        if (aggregatedData.mealAllowance > 0) {
          chartData.push({ name: '餐补', value: aggregatedData.mealAllowance, color: '#c4b5fd' });
        }
        if (aggregatedData.nightShiftAllowance > 0) {
          chartData.push({ name: '夜班津贴', value: aggregatedData.nightShiftAllowance, color: '#ddd6fe' });
        }
        if (aggregatedData.cleanRoomAllowance > 0) {
          chartData.push({ name: '无尘衣津贴', value: aggregatedData.cleanRoomAllowance, color: '#ede9fe' });
        }
        
        // 自定义项目
        if (aggregatedData.customItems > 0) {
          chartData.push({ name: '其它加项', value: aggregatedData.customItems, color: '#f3e8ff' });
        }
        
        // 加班费
        if (aggregatedData.overtime1 > 0) {
          chartData.push({ name: '加班1', value: aggregatedData.overtime1, color: '#10b981' });
        }
        if (aggregatedData.overtime2 > 0) {
          chartData.push({ name: '加班2', value: aggregatedData.overtime2, color: '#34d399' });
        }
        if (aggregatedData.overtime3 > 0) {
          chartData.push({ name: '加班3', value: aggregatedData.overtime3, color: '#6ee7b7' });
        }

        return chartData;
      },
    }),
    {
      name: 'salary-storage',
      partialize: (state) => ({
        records: state.records,
        overtimeRates: state.overtimeRates,
      }),
    }
  )
);