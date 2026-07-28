import apiClient from '../api/client';

export const teamService = {
  // Get all teams
  getTeams: () => apiClient.get('/api/v1/teams'),

  // Create new team
  createTeam: (name: string, size: number, captainStudentId: number | string, memberIds: (number | string)[]) =>
    apiClient.post('/api/v1/teams', {
      name,
      size,
      captainStudentId,
      memberStudentIds: memberIds,
    }),

  // Get team details
  getTeam: (id: string | number) => apiClient.get(`/api/v1/teams/${id}`),

  // Get team aggregate score
  getTeamScore: (id: string | number) => apiClient.get(`/api/v1/teams/${id}/score`),
};

export default teamService;
