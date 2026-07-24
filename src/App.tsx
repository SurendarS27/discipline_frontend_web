
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import AdminDashboard from './features/admin/AdminDashboard';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import StudentDashboardPage from './features/student/StudentDashboardPage';
import CaptainDashboardPage from './features/captain/CaptainDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

import GroupActivityYearPage from './features/admin/activity/pages/GroupActivityYearPage';
import GroupActivityExecutionPage from './features/admin/activity/pages/GroupActivityExecutionPage';
import ActivityExecutionPageV2 from './features/admin/activity/pages/ActivityExecutionPageV2';
import StudentsDirectoryPage from './features/teacher/pages/StudentsDirectoryPage';
import StudentListPage from './features/student/pages/StudentListPage';
import StudentDetailsPage from './features/student/pages/StudentDetailsPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Shared Routes */}
        <Route 
          path="/students" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <StudentListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
              <StudentDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher/*" 
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* CC Students Directory */}
        <Route 
          path="/teacher/students-directory" 
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <StudentsDirectoryPage />
            </ProtectedRoute>
          } 
        />

        {/* --- Phase 3: Execution Pages --- */}
        <Route 
          path="/teacher/group-activity/:activityId/year" 
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <GroupActivityYearPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/group-activity/:activityId/execution" 
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <GroupActivityExecutionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/activity/:activityId/execution" 
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <ActivityExecutionPageV2 />
            </ProtectedRoute>
          } 
        />
        {/* ---------------------------------- */}
        
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'CAPTAIN']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/captain/*" 
          element={
            <ProtectedRoute allowedRoles={['CAPTAIN']}>
              <CaptainDashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
