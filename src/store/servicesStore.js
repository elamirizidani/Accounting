import { create } from 'zustand';
import { fetchData } from '../../utility/api';

export const useServicesStore = create((set, get) => ({
  loadingCodes: true,
  serviceCodes: [],
  
  getServiceCodes: async () => {
    try {
      const res = await fetchData("services/serviceCodes");
      // console.log('ServiceCodes', res);
      set({
        loadingCodes: false,
        serviceCodes: res
      });
    } catch (error) {
      console.log(error);
      set({ loadingClients: false });
    }
  },
  
  // Add initialization function
  initialize: async () => {
    const { getServiceCodes } = get();
    await getServiceCodes();
  }
}));

useServicesStore.getState().initialize();