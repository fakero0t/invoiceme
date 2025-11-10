import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createInvoice as apiCreateInvoice,
  getInvoice as apiGetInvoice,
  updateInvoice as apiUpdateInvoice,
  deleteInvoice as apiDeleteInvoice,
  listInvoices as apiListInvoices,
  addLineItem as apiAddLineItem,
  updateLineItem as apiUpdateLineItem,
  removeLineItem as apiRemoveLineItem,
  markInvoiceAsSent as apiMarkInvoiceAsSent,
  downloadInvoicePDF as apiDownloadInvoicePDF,
  type Invoice,
  type CreateInvoiceData,
  type CreateLineItemData,
  type PagedResult,
} from '../shared/api/invoices';

export const useInvoiceStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(25);
  const totalPages = ref(0);

  // Getters
  const hasInvoices = computed(() => invoices.value && invoices.value.length > 0);

  // Actions
  const fetchInvoices = async (page: number = 1, status?: string, search?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result: PagedResult<Invoice> = await apiListInvoices(page, pageSize.value, status, search);
      invoices.value = result.items || [];
      totalCount.value = result.totalCount || 0;
      currentPage.value = result.page || page;
      pageSize.value = result.pageSize || pageSize.value;
      totalPages.value = result.totalPages || 0;
      return result;
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      error.value = err.response?.data?.message || err.message || 'Failed to fetch invoices';
      invoices.value = []; // Clear invoices on error
      totalCount.value = 0;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchInvoice = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await apiGetInvoice(id);
      currentInvoice.value = invoice;
      return invoice;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createInvoice = async (data: CreateInvoiceData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await apiCreateInvoice(data);
      if (currentPage.value === 1) {
        invoices.value.unshift(invoice);
      }
      return invoice;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateInvoice = async (id: string, data: { notes?: string; terms?: string; dueDate?: string }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await apiUpdateInvoice(id, data);
      const index = invoices.value.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        invoices.value[index] = invoice;
      }
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = invoice;
      }
      return invoice;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteInvoice = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiDeleteInvoice(id);
      invoices.value = invoices.value.filter((inv) => inv.id !== id);
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = null;
      }
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addLineItem = async (invoiceId: string, data: CreateLineItemData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const lineItem = await apiAddLineItem(invoiceId, data);
      // Refresh the current invoice to get updated totals
      if (currentInvoice.value?.id === invoiceId) {
        await fetchInvoice(invoiceId);
      }
      return lineItem;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateLineItem = async (
    invoiceId: string,
    lineItemId: string,
    data: CreateLineItemData
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiUpdateLineItem(invoiceId, lineItemId, data);
      // Refresh the current invoice to get updated totals
      if (currentInvoice.value?.id === invoiceId) {
        await fetchInvoice(invoiceId);
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeLineItem = async (invoiceId: string, lineItemId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiRemoveLineItem(invoiceId, lineItemId);
      // Refresh the current invoice to get updated totals
      if (currentInvoice.value?.id === invoiceId) {
        await fetchInvoice(invoiceId);
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove line item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const markAsSent = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await apiMarkInvoiceAsSent(id);
      const index = invoices.value.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        invoices.value[index] = invoice;
      }
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = invoice;
      }
      return invoice;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to mark invoice as sent';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const downloadPDF = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const url = await apiDownloadInvoicePDF(id);
      // Open PDF in new tab
      window.open(url, '_blank');
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to download PDF';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentInvoice = () => {
    currentInvoice.value = null;
  };

  return {
    // State
    invoices,
    currentInvoice,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    // Getters
    hasInvoices,
    // Actions
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    addLineItem,
    updateLineItem,
    removeLineItem,
    markAsSent,
    downloadPDF,
    clearError,
    clearCurrentInvoice,
  };
});

