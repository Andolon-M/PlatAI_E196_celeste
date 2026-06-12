import { axiosInstance } from '@/shared/api';

export interface Account {
  id: number;
  usuario_id: string;
  nombre_cuenta: string;
  tipo_cuenta: 'banco' | 'efectivo' | 'tarjeta_credito' | 'inversion';
  saldo_actual: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const accountsService = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await axiosInstance.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data;
  }
};
