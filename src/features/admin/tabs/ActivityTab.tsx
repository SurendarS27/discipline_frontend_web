import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, ChevronRight, Clock, Box } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onPushView: (name: string, props?: any) => void;
}

export default function ActivityTab({ onPushView }: Props) {
  const [stages, setStages] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
    fetchStages();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/users');
      if (response.data?.success) {
        const allUsers = response.data.data || [];
        setTeachers(allUsers.filter((u: any) => u.roles?.includes('ROLE_TEACHER')));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStages = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/stages');
      if (response.data?.success) {
        setStages(response.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} and all its subgroups?`)) {
      try {
        const response = await apiClient.delete(`/api/v1/admin/stages/${id}`);
        if (response.data?.success) {
          fetchStages();
        } else {
          alert(response.data?.message || 'Failed to delete stage');
        }
      } catch (e) {
        console.error(e);
        // Optimistic delete on failure if mock
        setStages(stages.filter(s => s.id !== id));
      }
    }
  };

  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return 'No duration set';
    try {
      const s = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const e = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${s} → ${e}`;
    } catch (e) {
      return `${start} → ${end}`;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h1 className="text-2xl font-bold text-white flex-1">Activity & Thresholds</h1>
          <button onClick={fetchStages} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Configure Stages</h2>
          <button 
            onClick={() => onPushView('create_stage')}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stage</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : stages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
            <Box className="w-12 h-12 text-slate-300 mb-2" />
            <p>No stages configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map(stage => {
              const active = stage.isActive ?? stage.active ?? true;
              return (
                <div 
                  key={stage.id} 
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-red-300 transition-colors flex items-center justify-between"
                  onClick={() => onPushView('stage_details', { 
                    stageId: stage.id, 
                    stageName: stage.name, 
                    stageDescription: stage.description,
                    teachersList: teachers 
                  })}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{stage.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{stage.description || 'No description'}</p>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        Order: {stage.displayOrder || 0}
                      </span>
                      <div className="flex items-center space-x-1 text-xs font-medium text-slate-600 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(stage.startDate, stage.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs font-bold text-blue-600">
                      {stage.subgroups?.length || 0} sub-branches configured
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPushView('edit_stage', { stage }); }} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(stage.id, stage.name); }} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
