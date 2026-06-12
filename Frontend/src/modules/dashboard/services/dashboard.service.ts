import { axiosInstance } from '@/shared/api';
import type { DashboardSummary, DashboardFilters } from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const dashboardService = {
  getSummary: async (filters?: DashboardFilters): Promise<DashboardSummary> => {
    let url = '/dashboard';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
      
      const queryStr = params.toString();
      if (queryStr) {
        url += `?${queryStr}`;
      }
    }

    const response = await axiosInstance.get<ApiResponse<DashboardSummary>>(url);
    return response.data.data;
  }
};
