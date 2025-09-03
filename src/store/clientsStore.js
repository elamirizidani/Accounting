import { create } from 'zustand';
import { fetchData } from '../../utility/api';

export const useClientsStore = create((set, get) => ({
  loadingClients: true,
  clients: [],
  
  getInvoices: async () => {
    try {
      const res = await fetchData("customers/withDetails");
      console.log('Clients', res?.data);
      set({
        loadingClients: false,
        clients: res?.data
      });
    } catch (error) {
      console.log(error);
      set({ loadingClients: false });
    }
  },
  
  // Add initialization function
  initialize: async () => {
    const { getInvoices } = get();
    await getInvoices();
  }
}));

useClientsStore.getState().initialize();