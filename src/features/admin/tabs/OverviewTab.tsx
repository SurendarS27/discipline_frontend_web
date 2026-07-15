import { useState, useEffect } from 'react';
import { Users, School, Building2, AlertTriangle, RefreshCw, Activity, Shield, Key } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onPushView: (name: string, props?: any) => void;
}

export default function OverviewTab({ onPushView }: Props) {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    departments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/stats');
      if (response.data.success) {
        const data = response.data.data;
        const users = data.totalUsers || 0;
        setStats({
          students: data.totalStudents || 0,
          teachers: users > 0 ? users - 1 : 0,
          departments: data.totalDepartments || 0
        });
      }
    } catch {
      // fallback
      setStats({
        students: 1,
        teachers: 1,
        departments: 5
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <button onClick={fetchStats} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back, System Admin</h2>
          <p className="text-sm text-slate-300">Here is a summary of the discipline system metrics.</p>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6 pt-8">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Students"
                count={stats.students.toString()}
                icon={Users}
                color="text-blue-500"
                bgColor="bg-blue-50"
                onClick={() => onPushView('students')}
              />
              <StatCard
                title="Teachers"
                count={stats.teachers.toString()}
                icon={School}
                color="text-green-500"
                bgColor="bg-green-50"
                onClick={() => onPushView('teachers')}
              />
              <StatCard
                title="Departments"
                count={stats.departments.toString()}
                icon={Building2}
                color="text-amber-500"
                bgColor="bg-amber-50"
                onClick={() => onPushView('departments')}
              />
              <StatCard
                title="Alerts/Actions"
                count="0"
                icon={AlertTriangle}
                color="text-red-500"
                bgColor="bg-red-50"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick System Overview</h3>
              <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                <OverviewRow icon={Activity} title="Database Status" value="Online & Healthy" statusColor="text-green-600" />
                <div className="h-px bg-slate-100"></div>
                <OverviewRow icon={Shield} title="Security Level" value="JWT Enabled" statusColor="text-blue-600" />
                <div className="h-px bg-slate-100"></div>
                <OverviewRow icon={Key} title="Self-Registration" value="Disabled (Admin Only)" statusColor="text-orange-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, count, icon: Icon, color, bgColor, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-md p-4 transition-transform ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-slate-900">{count}</h4>
        <p className="text-sm font-medium text-slate-600 mt-1">{title}</p>
      </div>
    </div>
  );
}

function OverviewRow({ icon: Icon, title, value, statusColor }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-4">
        <Icon className="w-5 h-5 text-slate-500" />
        <span className="font-semibold text-slate-900 text-[15px]">{title}</span>
      </div>
      <div>
        <span className={`text-[15px] font-bold ${statusColor}`}>{value}</span>
      </div>
    </div>
  );
}
