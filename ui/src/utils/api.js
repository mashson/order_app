const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `Request failed: ${resp.status}`);
  }
  return resp.json();
}

export const api = {
  getHealth: () => request('/health'),
  getMenus: () => request('/menus'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  admin: {
    dashboard: () => request('/admin/dashboard'),
    inventory: () => request('/admin/inventory'),
    updateInventory: (id, stockQuantity) => request(`/admin/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ stock_quantity: stockQuantity }),
    }),
    orders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const suffix = qs ? `?${qs}` : '';
      return request(`/admin/orders${suffix}`);
    },
    updateOrderStatus: (id, status) => request(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  },
};

export default api;


