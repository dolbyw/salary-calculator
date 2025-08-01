import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

/**
 * 离线状态指示器组件
 * 显示应用的在线/离线状态
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      // 离线状态：显示3秒后自动隐藏
      setShowOfflineMessage(true);
      setWasOffline(true);
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (wasOffline && isOnline) {
      // 从离线恢复到在线状态：显示3秒后隐藏
      setShowOfflineMessage(true);
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
        setWasOffline(false); // 重置离线状态标记
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300
        ${isOnline 
          ? 'bg-green-50/90 border-green-200 text-green-800' 
          : 'bg-red-50/90 border-red-200 text-red-800'
        }
      `}>
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {isOnline ? '网络已恢复' : '离线模式'}
            </span>
            
            {!isOnline && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        
        <p className="text-xs mt-1 opacity-80">
          {isOnline 
            ? '所有功能已恢复正常' 
            : '部分功能可能受限，数据将在恢复网络后同步'
          }
        </p>
      </div>
    </div>
  );
};

/**
 * 网络状态徽章组件
 * 在页面角落显示简洁的网络状态
 */
export const NetworkStatusBadge: React.FC = () => {
  const { isOnline } = usePWA();
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`
        w-3 h-3 rounded-full transition-all duration-300
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
      `} />
    </div>
  );
};