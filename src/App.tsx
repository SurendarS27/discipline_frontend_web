
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import AdminDashboard from './features/admin/AdminDashboard';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import StudentDashboardPage from './features/student/StudentDashboardPage';
import CaptainDashboardPage from './features/captain/CaptainDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
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
