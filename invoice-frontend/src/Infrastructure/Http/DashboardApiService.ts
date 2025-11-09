import { apiClient } from './apiClient';
import type { DashboardStatisticsDTO } from '../../Application/DTOs/DashboardStatisticsDTO';

export class DashboardApiService {
  private static readonly BASE_URL = '/api/v1/dashboard';
  
  // QUERIES (reads)
  static async getStatistics(): Promise<DashboardStatisticsDTO> {
    const response = await apiClient.get(`${this.BASE_URL}/statistics`);
    return response.data.data;
  }
}

