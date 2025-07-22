// This is a dummy file to resolve imports in components that have not been fully integrated.
// In a real application, this would contain the API client for your backend.

export const customerAPI = {
  getAll: async () => ({ data: [] }),
  create: async (data: any) => ({ data }),
  update: async (id: string, data: any) => ({ data }),
  delete: async (id: string) => ({}),
};

export const authAPI = {
    login: async (credentials: any) => ({ data: { token: 'mock-token', user: { id: '1', firstName: 'Test', lastName: 'User', email: credentials.email, role: credentials.role, createdAt: new Date(), updatedAt: new Date() } } }),
    logout: async () => ({}),
    refreshToken: async () => ({ data: { token: 'mock-refreshed-token', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'employee', createdAt: new Date(), updatedAt: new Date() } } }),
};
