import { useState } from 'react';
import DashboardTab from './tabs/DashboardTab';
import PointReviewTab from './tabs/PointReviewTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import ActivitiesTab from './tabs/ActivitiesTab';
import LevelsBadgesTab from './tabs/LevelsBadgesTab';
import ProfileTab from './tabs/ProfileTab';
import { LayoutDashboard, History, Trophy, Ticket, Medal, User } from 'lucide-react';

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard, component: <DashboardTab /> },
    { name: 'Point Review', icon: History, component: <PointReviewTab /> },
    { name: 'Leaderboard', icon: Trophy, component: <LeaderboardTab /> },
    { name: 'Activities', icon: Ticket, component: <ActivitiesTab /> },
    { name: 'Levels & Badges', icon: Medal, component: <LevelsBadgesTab /> },
    { name: 'Profile', icon: User, component: <ProfileTab /> }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 overflow-y-auto pb-20">
        {tabs[activeTab].component}
      </div>
      
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeTab === idx ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
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
