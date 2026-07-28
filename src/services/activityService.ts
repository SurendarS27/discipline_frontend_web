import apiClient from '../api/client';

export const activityService = {
  // Get all activity stages
  getStages: () => apiClient.get('/api/v1/admin/stages'),

  // Log an activity for student
  logActivity: (studentId: string | number, activityData: { points: number; reason: string; subgroupId?: number }) =>
    apiClient.post(`/api/v1/students/${studentId}/adjust-points`, activityData),

  // Get activity logs for student
  getActivityLogs: (studentId: string | number) =>
    apiClient.get(`/api/v1/students/${studentId}/discipline-logs`),
};

export default activityService;
