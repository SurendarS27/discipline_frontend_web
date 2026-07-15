import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function GroupActivityExecutionPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Group Execution</h1>
      </div>
      <div className="p-6 text-center text-slate-500">
        Group Activity Execution Page - Coming Soon
      </div>
    </div>
  );
}
