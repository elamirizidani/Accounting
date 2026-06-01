import { create } from 'zustand';
import { fetchData } from '../../utility/api';

export const useServicesStore = create((set, get) => ({
  loadingCodes: true,
  serviceCodes: [],
  
  getServiceCodes: async () => {
    try {
      const res = await fetchData("services/serviceCodes");
      set({
        loadingCodes: false,
        serviceCodes: res || []
      });
    } catch (error) {
      console.error('Failed to load service codes:', error);
      set({ loadingCodes: false, serviceCodes: [] });
    }
  },
  
  // Add initialization function
  initialize: async () => {
    const { getServiceCodes } = get();
    await getServiceCodes();
  }
}));

useServicesStore.getState().initialize();
