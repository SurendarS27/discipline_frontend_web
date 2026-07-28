import apiClient from '../api/client';

export const attendanceService = {
  // Mark attendance for a student
  markAttendance: (studentId: string | number, status: string, date: string, subjectId?: string | number) =>
    apiClient.post('/api/v1/admin/attendance', {
      studentId,
      status,
      date,
      subjectId,
    }),

  // Get attendance for a student
  getStudentAttendance: (studentId: string | number) =>
    apiClient.get(`/api/v1/students/${studentId}/attendance`),

  // Get attendance by date range
  getAttendanceReport: (startDate: string, endDate: string, departmentId?: string | number) =>
    apiClient.get('/api/v1/attendance/report', {
      params: { startDate, endDate, departmentId },
    }),
};

export default attendanceService;
