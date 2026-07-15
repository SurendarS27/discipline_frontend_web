import { useState, useEffect } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../../store/authContext';
import apiClient from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';

export default function AdminProfileTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "System Administrator",
    email: "admin@spdms.com",
    role: "ADMIN"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/me');
        if (response.data.success) {
          const d = response.data.data;
          setProfileData({
            name: d.fullName || d.username || "System Administrator",
            email: d.email || "admin@spdms.com",
            role: d.role || "ADMIN"
          });
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9]">
      <div className="bg-slate-900 text-white px-4 py-4 shadow-sm z-10 flex items-center">
        <h1 className="text-xl font-bold">Admin Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-10 pb-6 px-6">
        <div className="w-[120px] h-[120px] rounded-full bg-[#EA4335]/10 shadow-md flex items-center justify-center mb-5">
          <Shield className="w-16 h-16 text-[#EA4335] fill-current" />
        </div>

        <h2 className="text-[22px] font-bold text-[#1E293B]">{profileData.name}</h2>
        <p className="text-[15px] text-gray-500 mt-1 mb-8">{profileData.email}</p>

        <div className="w-full max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm px-5 py-5 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-gray-500">Role</span>
              <span className="text-[15px] font-bold text-[#1E293B]">
                {profileData.role.replace("ROLE_", "")}
              </span>
            </div>
            <div className="h-px bg-slate-100" />
            
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-gray-500">Access Level</span>
              <span className="text-[15px] font-bold text-[#1E293B]">Full System Access</span>
            </div>
            <div className="h-px bg-slate-100" />
            
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-gray-500">System</span>
              <span className="text-[15px] font-bold text-[#1E293B]">Discipline Monitor (SPDMS)</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 w-full max-w-md pb-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#EA4335] hover:bg-red-600 text-white font-bold h-[52px] rounded-full shadow-sm text-[16px] transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
