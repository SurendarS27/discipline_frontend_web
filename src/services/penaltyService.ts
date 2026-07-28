import apiClient from '../api/client';

export const penaltyService = {
  // Issue a penalty (deduct points)
  issuePenalty: (studentId: string | number, points: number, reason: string, subgroupId?: number) =>
    apiClient.post(`/api/v1/students/${studentId}/adjust-points`, {
      points: -Math.abs(points), // always negative for penalties
      reason,
      subgroupId,
    }),

  // Get penalty history for student
  getPenaltyHistory: (studentId: string | number) =>
    apiClient.get(`/api/v1/students/${studentId}/discipline-logs`),

  // Get all pending penalties (admin/CC view)
  getPendingPenalties: () =>
    apiClient.get('/api/penalties/cc-inbox'),
};

export default penaltyService;
