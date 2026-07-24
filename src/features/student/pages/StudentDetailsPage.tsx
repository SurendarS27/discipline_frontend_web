import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../../store/studentStore';
import { studentService } from '../services/student.service';
import { ArrowLeft, Edit, Trash2, Award, FileWarning, Medal, Mail, Building, Hash } from 'lucide-react';

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedStudent, setSelectedStudent } = useStudentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (id) {
          const student = await studentService.getStudentById(Number(id));
          setSelectedStudent(student);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load student details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    
    return () => setSelectedStudent(null);
  }, [id, setSelectedStudent]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !selectedStudent) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <FileWarning className="w-5 h-5" />
          <p>{error || 'Student not found'}</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Student Profile</h1>
            <p className="text-sm text-slate-500">View and manage detailed information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm shadow-sm">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
            
            <div className="w-24 h-24 bg-white rounded-full p-1 mt-8 z-10 relative shadow-md">
              <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                {selectedStudent.fullName.charAt(0)}
              </div>
              {selectedStudent.isCaptain && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white" title="Team Captain">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-slate-800 z-10">{selectedStudent.fullName}</h2>
            <p className="text-sm text-slate-500 font-medium z-10">{selectedStudent.regNo}</p>
            
            <div className="mt-6 w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{selectedStudent.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{selectedStudent.departmentName || 'No Department'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>Year {selectedStudent.year} - Sec {selectedStudent.section}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Discipline Score</h3>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke={selectedStudent.disciplineScore >= 80 ? '#22c55e' : selectedStudent.disciplineScore >= 50 ? '#eab308' : '#ef4444'} 
                    strokeWidth="8" 
                    strokeDasharray={`${(selectedStudent.disciplineScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-slate-800">{selectedStudent.disciplineScore}</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">/ 100</span>
                </div>
              </div>
              
              <div className="mt-6 w-full space-y-2">
                <button className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                  Adjust Points
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content/Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <FileWarning className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Incidents</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">--</span>
             </div>
             
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Activities</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">--</span>
             </div>
             
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Medal className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Level</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">--</span>
             </div>
          </div>
          
          {/* Recent Logs (Placeholder for now) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Recent Disciplinary Action</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileWarning className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No recent incidents recorded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
