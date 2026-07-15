import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../../../../services/apiClient';

export default function GroupActivityYearPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await apiClient.get(`/api/v1/my-activities/${activityId}/years`);
        if (res.data.success) {
          // Simplification for the stub
          setYears([{ yearNo: 1, yearName: '1st Year' }, { yearNo: 2, yearName: '2nd Year' }]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, [activityId]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-full text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Select Academic Year</h1>
      </div>
      <div className="p-6">
        {loading ? <p>Loading years...</p> : (
          <div className="space-y-4">
            {years.map(y => (
              <div 
                key={y.yearNo} 
                onClick={() => navigate(`/teacher/group-activity/${activityId}/execution`, { state: { year: y } })}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-bold text-lg flex justify-between cursor-pointer hover:bg-slate-50"
              >
                {y.yearName}
                <span className="text-slate-400">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
