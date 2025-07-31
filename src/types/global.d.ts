/**
 * 全局类型声明文件
 * 扩展Window和Navigator接口以支持PWA相关属性
 */

// 扩展Window接口
declare global {
  interface Window {
    /**
     * Chrome浏览器特有的chrome对象
     * 用于检测是否在Chrome扩展环境中运行
     */
    chrome?: {
      runtime?: any;
      [key: string]: any;
    };
  }

  interface Navigator {
    /**
     * iOS Safari特有的standalone属性
     * 用于检测PWA是否以独立模式运行
     */
    standalone?: boolean;
  }
}

export {};