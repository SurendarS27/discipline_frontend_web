import { useState, useEffect } from 'react';
import { useAuth } from '../../store/authContext';
import apiClient from '../../services/apiClient';
import PerformanceActivitiesTab from './tabs/PerformanceActivitiesTab';
import ActivityTab from './tabs/ActivityTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import RemovalRequestsTab from './tabs/RemovalRequestsTab';
import TeacherGroupManagementTab from './tabs/TeacherGroupManagementTab';
import HodPerformanceTab from './tabs/HodPerformanceTab';
import ProfileTab from './tabs/ProfileTab';
import { Activity, Trophy, AlertCircle, Users, BarChart3, User, CalendarDays } from 'lucide-react';

export default function TeacherDashboard() {
  const { subRoles, setSubRoles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/api/v1/auth/me');
        if (res.data.success) {
          const subs = res.data.data.subRoles || [];
          setSubRoles(subs.map((s: string) => s.toString()));
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setSubRoles]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Teacher Profile...</div>;
  }

  const isCC = subRoles.some(r => r.toUpperCase() === 'CC');
  const isHOD = subRoles.includes('HOD');

  const availableTabs = [
    { 
      name: isCC ? 'Dashboard' : 'Events', 
      icon: CalendarDays, 
      component: <PerformanceActivitiesTab /> 
    }
  ];

  if (isCC) {
    availableTabs.push({ name: 'Activities', icon: Activity, component: <ActivityTab /> });
  }

  availableTabs.push(
    { name: 'Leaderboard', icon: Trophy, component: <LeaderboardTab /> },
    { name: 'Requests', icon: AlertCircle, component: <RemovalRequestsTab /> },
    { name: 'Groups', icon: Users, component: <TeacherGroupManagementTab /> }
  );

  if (isHOD) {
    availableTabs.push({ name: 'HOD Report', icon: BarChart3, component: <HodPerformanceTab /> });
  }

  availableTabs.push({ name: 'Profile', icon: User, component: <ProfileTab /> });

  // Ensure activeTab is within bounds (e.g. if roles change)
  const currentTabComponent = availableTabs[activeTab]?.component || availableTabs[0].component;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 overflow-y-auto pb-20">
        {currentTabComponent}
      </div>
      
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {availableTabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeTab === idx ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === idx ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
