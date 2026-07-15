import { useState } from 'react';
import OverviewTab from './tabs/OverviewTab';
import ActivityTab from './tabs/ActivityTab';
import TeacherGroupManagementTab from '../teacher/tabs/TeacherGroupManagementTab';
import RemovalRequestsTab from '../teacher/tabs/RemovalRequestsTab';
import AdminProfileTab from './tabs/AdminProfileTab';
import StudentsTab from './tabs/StudentsTab';
import TeachersTab from './tabs/TeachersTab';
import DepartmentsTab from './tabs/DepartmentsTab';
import CreateStagePage from './pages/CreateStagePage';
import EditStagePage from './pages/EditStagePage';
import StageDetailsPage from './pages/StageDetailsPage';
import ActivityListPage from './activity/pages/ActivityListPage';
import CreateActivityPage from './activity/pages/CreateActivityPage';
import EditActivityPage from './activity/pages/EditActivityPage';
import { LayoutDashboard, Activity, Users, AlertCircle, User } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [viewStack, setViewStack] = useState<{name: string, props?: any}[]>([]);

  const pushView = (name: string, props?: any) => {
    setViewStack([...viewStack, { name, props }]);
  };

  const popView = () => {
    setViewStack(viewStack.slice(0, -1));
  };

  const handleTabClick = (idx: number) => {
    if (idx !== activeTab) {
      setActiveTab(idx);
      setViewStack([]);
    } else {
      setViewStack([]); // clicking same tab resets to root
    }
  };

  const tabs = [
    { name: 'Overview', icon: LayoutDashboard, component: <OverviewTab onPushView={pushView} /> },
    { name: 'Activity', icon: Activity, component: <ActivityTab onPushView={pushView} /> },
    { name: 'Groups', icon: Users, component: <TeacherGroupManagementTab /> },
    { name: 'Requests', icon: AlertCircle, component: <RemovalRequestsTab /> },
    { name: 'Profile', icon: User, component: <AdminProfileTab /> }
  ];

  const renderCurrentView = () => {
    if (viewStack.length === 0) {
      return tabs[activeTab].component;
    }
    const currentView = viewStack[viewStack.length - 1];
    switch (currentView.name) {
      case 'students':
        return <StudentsTab onBack={popView} />;
      case 'teachers':
        return <TeachersTab onBack={popView} />;
      case 'departments':
        return <DepartmentsTab onBack={popView} />;
      case 'create_stage':
        return <CreateStagePage onBack={popView} />;
      case 'edit_stage':
        return <EditStagePage onBack={popView} stage={currentView.props?.stage} />;
      case 'stage_details':
        return <StageDetailsPage onBack={popView} stageId={currentView.props?.stageId} stageName={currentView.props?.stageName} stageDescription={currentView.props?.stageDescription} teachersList={currentView.props?.teachersList} onPushView={pushView} />;
      case 'activity_list':
        return <ActivityListPage onBack={popView} subgroup={currentView.props?.subgroup} onPushView={pushView} />;
      case 'create_activity':
        return <CreateActivityPage onBack={popView} subgroupId={currentView.props?.subgroupId} />;
      case 'edit_activity':
        return <EditActivityPage onBack={popView} activity={currentView.props?.activity} />;
      default:
        return tabs[activeTab].component;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Discipline Monitor</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === idx 
                  ? 'bg-red-600 text-white border-l-4 border-red-400' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-3 ${activeTab === idx ? 'text-red-200' : 'text-slate-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto md:pb-0 pb-20">
          {renderCurrentView()}
        </div>
        
        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  activeTab === idx ? 'text-red-500' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === idx ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
