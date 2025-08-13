// src/store/authStore.js
import { create } from 'zustand';
import { fetchData,login as apiLogin } from '../../utility/api';
import { useInvoiceStore } from './invoiceStore'



export const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  userRole:null,
  loading:true,
  quotation:null,

  checkAuth: async () => {
    try {
      const response = await fetchData('user/profile');
      if (response.user) {
        set({
          user: response.user,
          isLoggedIn: true,
          userRole:response.user.role
        });
        const invoiceStore = useInvoiceStore.getState();
        await invoiceStore.getInvoices(); 
      } else {
        localStorage.removeItem('token');
        set({ isLoggedIn: false, user: null,userRole:null, });
      }
    } catch (error) {
      console.error('Failed to auto-login:', error);
      localStorage.removeItem('token');
      set({ isLoggedIn: false, user: null });
    }
  },
  loadQuotation: async () =>{
    try {
        const res = await fetchData('quotation');
        console.log(res)
        set({quotation:res || []})

    } catch (error) {
       console.error('Failed to Load Data:', error); 
    }
  },
  
  login: async (userData) => {
    try {
        const response = await apiLogin(userData.email, userData.password);
        console.log(response)
        if (response.token) {
          localStorage.setItem('token', response.token);
          await get().checkAuth();
          return {
              role:response.user.role,
              status:true
          };
        } else {
        set({ isLoggedIn: false, user: null,userRole:null });
          return {
              role:null,
              status:false
          };
        }
    } catch (error) {
        console.log('error',error);
        set({ isLoggedIn: false, user: null });
        return {
            role:null,
            status:false
        };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ isLoggedIn: false, user: null, });
  },
  
  initialize: async () => {

    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoggedIn: false, user: null,loading: false });
      return;
    }
    await get().checkAuth();
    await get().loadQuotation();
    set({ loading: false });
    }
}));