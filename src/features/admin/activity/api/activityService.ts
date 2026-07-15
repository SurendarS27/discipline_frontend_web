import apiClient from '../../../../services/apiClient';
import type {
  ActivityModel,
  MyActivityStudentsResponseModel
} from '../types/ActivityTypes';

export const activityService = {
  fetchActivities: async (subgroupId: number): Promise<ActivityModel[]> => {
    const response = await apiClient.get(`/api/v1/admin/subgroups/${subgroupId}/activities`);
    return response.data.data;
  },

  fetchDepartments: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/departments');
    return response.data.data;
  },

  fetchUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/users');
    return response.data.data;
  },

  fetchClassCoordinators: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/departments/class-coordinators');
    return response.data.data;
  },

  fetchCustomFrequencies: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/frequencies/custom');
    return response.data.data;
  },

  createCustomFrequency: async (body: any): Promise<any> => {
    const response = await apiClient.post('/api/v1/admin/frequencies/custom', body);
    return response.data.data;
  },

  createActivity: async (subgroupId: number, body: Partial<ActivityModel>): Promise<any> => {
    const response = await apiClient.post(`/api/v1/admin/subgroups/${subgroupId}/activities`, body);
    return response.data;
  },

  updateActivity: async (activityId: number, body: Partial<ActivityModel>): Promise<any> => {
    const response = await apiClient.put(`/api/v1/admin/activities/${activityId}`, body);
    return response.data;
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/activities/${activityId}`);
  },

  fetchSections: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/sections');
    return response.data.data;
  },

  assignActivity: async (activityId: number, sectionId: number | null, teacherId: number): Promise<any> => {
    const response = await apiClient.post(`/api/v1/admin/activities/${activityId}/assign`, {
      sectionId,
      teacherId,
    });
    return response.data;
  },

  saveAssignments: async (
    activityId: number,
    globalEnabled: boolean,
    assignments: any[],
    ccEnabled: boolean = false
  ): Promise<void> => {
    await apiClient.post(`/api/v1/admin/activities/${activityId}/assign`, {
      globalEnabled,
      ccEnabled,
      assignments,
    });
  },

  fetchMyActivities: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/admin/my-activities');
    return response.data.data;
  },

  fetchExecutionStudents: async (
    activityId: number,
    year?: string,
    departmentId?: number,
    sectionId?: number
  ): Promise<MyActivityStudentsResponseModel> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (departmentId) params.append('departmentId', departmentId.toString());
    if (sectionId) params.append('sectionId', sectionId.toString());

    const response = await apiClient.get(`/api/v1/my-activities/${activityId}/students`, { params });
    return response.data.data;
  },

  awardXp: async (
    studentId: number,
    activityId: number,
    assignmentId: number,
    xp: number,
    remarks: string,
    result: string = 'PASS'
  ): Promise<void> => {
    await apiClient.post('/api/v1/student-xp/award', {
      studentId,
      activityId,
      assignmentId,
      xp,
      remarks,
      result,
    });
  }
};
