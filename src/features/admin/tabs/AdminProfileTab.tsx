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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      <div className="bg-[#1E293B] text-white px-6 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Admin Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-28 h-28 rounded-full bg-[#FCE8E8] shadow-sm flex items-center justify-center mb-6 relative">
          <Shield className="w-12 h-12 text-[#EA4335] fill-current" />
          <div className="absolute bottom-6 right-6 bg-white rounded-full p-0.5 shadow-sm">
             <div className="bg-[#EA4335] text-white rounded-full w-6 h-6 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
             </div>
          </div>
        </div>

        <h2 className="text-[22px] font-bold text-[#1E293B]">{profileData.name}</h2>
        <p className="text-[15px] text-[#94A3B8] mt-1 mb-8">{profileData.email}</p>

        <div className="w-full max-w-md">
          <div className="bg-[#F8FAFC] rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-[#64748B]">Role</span>
              <span className="text-[15px] font-bold text-[#1E293B]">
                {profileData.role.replace("ROLE_", "")}
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-[#64748B]">Access Level</span>
              <span className="text-[15px] font-bold text-[#1E293B]">Full System Access</span>
            </div>
            <div className="h-px bg-slate-200" />
            
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-[#64748B]">System</span>
              <span className="text-[15px] font-bold text-[#1E293B]">Discipline Monitor (SPDMS)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-md">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#EA4335] hover:bg-[#D93025] text-white font-bold py-4 rounded-xl transition-colors shadow-sm text-[16px]"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
