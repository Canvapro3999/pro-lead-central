
const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  // Leads
  getLeads: async (filters?: { industry?: string; region?: string }) => {
    const params = new URLSearchParams();
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.region) params.append('region', filters.region);
    
    const response = await fetch(`${API_BASE_URL}/leads?${params}`);
    return response.json();
  },

  getLeadSample: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}/sample`);
    return response.json();
  },

  // Purchases
  createPurchase: async (leadBundleId: number, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leadBundleId, quantity }),
    });
    return response.json();
  },

  getPurchaseHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/purchases/history`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  downloadPurchase: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}/download`, {
      headers: getAuthHeaders(),
    });
    return response.blob();
  },

  // Custom Leads
  createCustomLead: async (data: {
    industry: string;
    location: string;
    quantity: number;
    additionalNotes: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/custom-leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getCustomLeads: async () => {
    const response = await fetch(`${API_BASE_URL}/custom-leads`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getCustomLeadSample: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/custom-leads/${id}/sample`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  confirmCustomLead: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/custom-leads/${id}/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  downloadCustomLead: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/custom-leads/${id}/download`, {
      headers: getAuthHeaders(),
    });
    return response.blob();
  },

  // Refunds
  createRefund: async (data: {
    purchaseId: number;
    reason: string;
    sampleData: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/refunds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getRefunds: async () => {
    const response = await fetch(`${API_BASE_URL}/refunds`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
