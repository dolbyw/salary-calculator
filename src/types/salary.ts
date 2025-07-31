/**
 * 薪资计算相关的类型定义
 */

// 薪资项目类型
export interface SalaryItem {
  id: string;
  name: string;
  amount: number;
  type: 'base' | 'overtime' | 'allowance';
}

// 加班费率配置
export interface OvertimeRate {
  overtime1: number; // 加班1费率 (元/小时)
  overtime2: number; // 加班2费率 (元/小时)
  overtime3: number; // 加班3费率 (元/小时)
}

// 加班时长
export interface OvertimeHours {
  overtime1: number; // 加班1时长
  overtime2: number; // 加班2时长
  overtime3: number; // 加班3时长
}

// 自定义薪资项目
export interface CustomSalaryItem {
  id: string;
  name: string;
  amount: number;
}

// 基础薪资项目
export interface BaseSalary {
  baseSalary: number;        // 本薪
  professionalAllowance: number; // 专业加给
  mealAllowance: number;     // 餐补
  nightShiftAllowance: number; // 夜班津贴
  cleanRoomAllowance: number;  // 无尘衣津贴
  customItems: CustomSalaryItem[]; // 其它加项
}

// 完整的薪资记录
export interface SalaryRecord {
  id: string;
  date: string;
  year: number;  // 年份
  month: number; // 月份
  baseSalary: BaseSalary;
  overtimeHours: OvertimeHours;
  overtimeRates: OvertimeRate;
  totalSalary: number;
  note?: string;
}

// 图表数据类型
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// 月度薪资统计
export interface MonthlySalaryStats {
  month: string;
  totalSalary: number;
  baseSalaryTotal: number;
  overtimeTotal: number;
  customItemsTotal: number;
}

// 薪资计算结果
export interface SalaryCalculation {
  baseSalaryTotal: number;
  overtime1Amount: number;
  overtime2Amount: number;
  overtime3Amount: number;
  totalOvertimeAmount: number;
  customItemsTotal: number;
  totalSalary: number;
  breakdown: {
    baseSalary: number;
    professionalAllowance: number;
    mealAllowance: number;
    nightShiftAllowance: number;
    cleanRoomAllowance: number;
    customItems: number;
    overtime1: number;
    overtime2: number;
    overtime3: number;
  };
}