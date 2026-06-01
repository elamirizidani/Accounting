import { create } from 'zustand';
import { fetchData } from '../../utility/api';

export const useClientsStore = create((set, get) => ({
  loadingClients: true,
  clients: [],
  
  getInvoices: async () => {
    try {
      const res = await fetchData("customers/withDetails");
      set({
        loadingClients: false,
        clients: res?.data || []
      });
    } catch (error) {
      console.error('Failed to load clients:', error);
      set({ loadingClients: false, clients: [] });
    }
  },
  
  // Add initialization function
  initialize: async () => {
    const { getInvoices } = get();
    await getInvoices();
  }
}));

useClientsStore.getState().initialize();
