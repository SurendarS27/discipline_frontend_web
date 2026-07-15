import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { activityService } from '../api/activityService';
import type { ActivityModel } from '../types/ActivityTypes';
import ActivityCard from '../components/ActivityCard';

interface ActivityListPageProps {
  onBack: () => void;
  subgroup: any;
  onPushView: (name: string, props?: any) => void;
}

export default function ActivityListPage({ onBack, subgroup, onPushView }: ActivityListPageProps) {
  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await activityService.fetchActivities(subgroup.id);
      setActivities(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load activities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subgroup.id]);

  const handleDelete = async (activity: ActivityModel) => {
    if (window.confirm(`Are you sure you want to delete '${activity.name}'?`)) {
      try {
        await activityService.deleteActivity(activity.id);
        fetchActivities();
      } catch (err) {
        console.error(err);
        alert('Failed to delete activity');
      }
    }
  };

  const getCleanName = (fullName: string) => {
    const lower = fullName.toLowerCase();
    if (lower.endsWith(' (must)')) return fullName.substring(0, fullName.length - 7);
    if (lower.endsWith(' (individual)')) return fullName.substring(0, fullName.length - 13);
    if (lower.endsWith(' (group)')) return fullName.substring(0, fullName.length - 8);
    return fullName;
  };

  const cleanTitle = getCleanName(subgroup.name);
  const categoryLabel = (subgroup.category || 'INDIVIDUAL').toUpperCase();

  return (
    <div className="flex flex-col min-h-full bg-slate-50 relative">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{cleanTitle} – Activities</h1>
        </div>
        <button onClick={fetchActivities} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 p-6 pb-24">
        <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">{cleanTitle}</h2>
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
              {categoryLabel}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            {activities.length} activities configured
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-lg font-medium text-slate-700 mb-2">No Activities Found</p>
            <p className="text-sm">Tap the Add Activity button to create one.</p>
          </div>
        ) : (
          <div>
            {activities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={() => onPushView('edit_activity', { activity, subgroupId: subgroup.id })}
                onDelete={() => handleDelete(activity)}
                onAssign={() => onPushView('assign_faculty', { activity, subgroupId: subgroup.id })}
                onTap={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-20">
        <button
          onClick={() => onPushView('create_activity', { subgroupId: subgroup.id })}
          className="flex items-center justify-center gap-2 bg-[#EA4335] text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-red-600 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      </div>
    </div>
  );
}
