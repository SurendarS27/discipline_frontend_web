import apiClient from '../api/client';

export const xpService = {
  // Get student XP streak + info
  getXpInfo: (studentId: string | number) =>
    apiClient.get(`/api/v1/xp/${studentId}/streaks`),

  // Get XP history (discipline logs)
  getXpHistory: (studentId: string | number) =>
    apiClient.get(`/api/v1/xp/${studentId}/history`),

  // Get XP Summary
  getXpSummary: (studentId: string | number) =>
    apiClient.get(`/api/v1/xp/${studentId}/summary`),
};

export default xpService;
