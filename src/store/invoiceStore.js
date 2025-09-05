import { create } from 'zustand';
import { fetchData } from '../../utility/api';

export const useInvoiceStore = create((set,get)=>({
    loadingInvoice:true,
    invoices:[],
    paidInvoice: null,
    overdueInvoice: null,
    partiallyPaidInvoice: null,
    unpaidInvoice: null,
    sentInvoice: null,
    draftInvoice:null,
    totalInvoice:null,
    totalPaidAmount:null,
    totalAmountExceptDraft:null,
    allInvoiceData:{},

    getInvoices:async()=>{
        try {
            const res = await fetchData("invoice");
            console.log('invoice',res)
                set({
                    loadingInvoice:false,
                    allInvoiceData:res,
                    invoices:Array.isArray(res?.invoices) ? res?.invoices : [],
                    paidInvoice: res?.statusCounts?.paid || null,
                    overdueInvoice: res?.statusCounts?.overdue || null,
                    partiallyPaidInvoice: res?.statusCounts?.partiallyPaid || null,
                    unpaidInvoice: res?.statusCounts?.unpaid || null,
                    sentInvoice: res?.statusCounts?.sent || null,
                    draftInvoice: res?.statusCounts?.draft || null,
                    totalInvoice: Number(res?.statusCounts?.paid || 0) + Number(res?.statusCounts?.overdue || 0) + Number(res?.statusCounts?.partiallyPaid || 0) + Number(res?.statusCounts?.unpaid || 0) + Number(res?.statusCounts?.sent || 0) + Number(res?.statusCounts?.draft || 0),
                    totalPaidAmount:res.totalPaidAmount,
                    totalAmountExceptDraft:res.totalAmountExceptDraft
                })
        } catch (error) {
            console.log(error)
        }
    },
}))