import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { activityService } from '../api/activityService';
import type { ActivityModel } from '../types/ActivityTypes';
import ActivityForm from '../components/ActivityForm';

interface EditActivityPageProps {
  onBack: () => void;
  activity: ActivityModel;
}

export default function EditActivityPage({ onBack, activity }: EditActivityPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await activityService.updateActivity(activity.id, data);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Edit Activity</h1>
      </div>

      <div className="flex-1 p-6">
        <ActivityForm initialData={activity} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
