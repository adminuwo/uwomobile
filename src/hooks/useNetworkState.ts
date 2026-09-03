import { useState, useEffect } from 'react';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  status: 'online' | 'offline' | 'reconnecting';
}

export const useNetworkState = (): NetworkState => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isReachable, setIsReachable] = useState<boolean | null>(true);

  useEffect(() => {
    // Basic network detection foundation for Phase 1
    // (Can be enhanced with @react-native-community/netinfo in future phase)
    const checkStatus = () => {
      setIsConnected(true);
      setIsReachable(true);
    };

    checkStatus();
  }, []);

  return {
    isConnected,
    isInternetReachable: isReachable,
    status: isConnected ? 'online' : 'offline',
  };
};
