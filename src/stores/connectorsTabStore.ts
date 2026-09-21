import { create } from 'zustand';

export type ConnectorsTargetTab = 'ALL' | 'CHANNELS' | 'CONNECTORS' | 'FEATURES';

interface ConnectorsTabState {
  targetTab: ConnectorsTargetTab;
  setTargetTab: (tab: ConnectorsTargetTab) => void;
}

export const useConnectorsTabStore = create<ConnectorsTabState>((set) => ({
  targetTab: 'ALL',
  setTargetTab: (tab) => set({ targetTab: tab }),
}));
