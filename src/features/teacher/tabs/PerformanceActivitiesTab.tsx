import { useState, useEffect } from 'react';
import { 
  School, MessageCircle, Gavel, Lightbulb, Briefcase, 
  ShieldCheck, Activity, Users, BrainCircuit, Music,
  ArrowLeft, CalendarX, UsersRound
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

const CATEGORY_STYLES: Record<string, any> = {
  "ACADEMIC": { color: "text-blue-600", bg: "bg-blue-100", icon: School, label: "Academic" },
  "COMMUNICATION": { color: "text-indigo-600", bg: "bg-indigo-100", icon: MessageCircle, label: "Communication" },
  "LEADERSHIP": { color: "text-amber-600", bg: "bg-amber-100", icon: Gavel, label: "Leadership" },
  "INNOVATION": { color: "text-orange-600", bg: "bg-orange-100", icon: Lightbulb, label: "Innovation" },
  "PLACEMENT": { color: "text-emerald-600", bg: "bg-emerald-100", icon: Briefcase, label: "Placement" },
  "DISCIPLINE": { color: "text-red-600", bg: "bg-red-100", icon: ShieldCheck, label: "Discipline" },
  "SPORTS": { color: "text-pink-600", bg: "bg-pink-100", icon: Activity, label: "Sports" },
  "COMMUNITY": { color: "text-teal-600", bg: "bg-teal-100", icon: Users, label: "Community" },
  "SKILL": { color: "text-purple-600", bg: "bg-purple-100", icon: BrainCircuit, label: "Skill" },
  "CULTURAL": { color: "text-cyan-600", bg: "bg-cyan-100", icon: Music, label: "Cultural" },
};

export default function PerformanceActivitiesTab() {
  const [currentFlowStep, setCurrentFlowStep] = useState(0);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [myActivities, setMyActivities] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await apiClient.get('/api/v1/admin/my-activities');
        if (response.data.success) {
          setMyActivities(response.data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch activities", e);
      } finally {
        setIsLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  const fetchStudentsForEvent = async (event: any) => {
    setIsLoadingStudents(true);
    setEligibleStudents([]);
    setSelectedStudentIds(new Set());
    setSelectAll(false);
    setAssignmentId(null);
    
    try {
      const activityId = event.activityId;
      const response = await apiClient.get(`/api/v1/my-activities/${activityId}/students`);
      if (response.data.success) {
        setEligibleStudents(response.data.data.students || []);
        const assignData = response.data.data.assignment;
        if (assignData) {
          setAssignmentId(assignData.id);
        }
      } else {
        alert(response.data.message || "Failed to load students");
      }
    } catch (e) {
      alert("Error loading students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const onCategorySelected = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setCurrentFlowStep(1);
  };

  const onEventSelected = (event: any) => {
    setSelectedEvent(event);
    setCurrentFlowStep(2);
    fetchStudentsForEvent(event);
  };

  const submitAward = async () => {
    if (selectedStudentIds.size === 0) {
      alert("Please select at least one student");
      return;
    }

    setIsAwarding(true);
    try {
      const body = {
        studentIds: Array.from(selectedStudentIds),
        activityId: selectedEvent.activityId,
        assignmentId: assignmentId || selectedEvent.activityId,
        remarks: remarks.trim(),
      };

      const response = await apiClient.post('/api/v1/student-xp/award/batch', body);
      if (response.data.success) {
        alert(response.data.message || "XP Awarded successfully!");
        setRemarks("");
        setSelectedStudentIds(new Set());
        setCurrentFlowStep(1);
      } else {
        alert(response.data.message || "Failed to award XP");
      }
    } catch (e) {
      alert("Error submitting batch award");
    } finally {
      setIsAwarding(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudentIds(new Set(eligibleStudents.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    const newSet = new Set(selectedStudentIds);
    if (checked) {
      newSet.add(studentId);
    } else {
      newSet.delete(studentId);
      setSelectAll(false);
    }
    setSelectedStudentIds(newSet);
  };

  const getFilteredEvents = () => {
    if (!selectedCategory) return [];
    return myActivities.filter(a => (a.xpCategory || "").toUpperCase() === selectedCategory);
  };

  const renderCategoryGrid = () => (
    <div className="p-4">
      <p className="text-[15px] font-bold text-slate-800 mb-4">
        Select XP Category to view predefined Events
      </p>
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(CATEGORY_STYLES).map(key => {
          const style = CATEGORY_STYLES[key];
          const IconComponent = style.icon;
          const count = myActivities.filter(a => (a.xpCategory || "").toUpperCase() === key).length;
          
          return (
            <button 
              key={key}
              onClick={() => onCategorySelected(key)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left hover:shadow-md transition-shadow flex flex-col items-start min-h-[110px]"
            >
              <div className={`${style.bg} p-2 rounded-xl mb-auto`}>
                <IconComponent className={`w-6 h-6 ${style.color}`} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm text-slate-800">{style.label}</div>
                <div className="text-[11px] text-slate-500">{count} configured events</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderEventList = () => {
    const list = getFilteredEvents();
    
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <CalendarX className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">No Events assigned under this category</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <p className="text-[15px] font-bold text-slate-800 mb-4">
          Select Predefined Event ({list.length} available)
        </p>
        <div className="space-y-3">
          {list.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onEventSelected(item)}
              className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-left hover:border-teal-300 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] text-slate-800 truncate">{item.name || "Unnamed"}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {item.description || "No description"}
                  </p>
                </div>
                <div className="shrink-0 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl text-[13px] font-bold">
                  {item.xp || 0} XP
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStudentListAndAward = () => {
    if (isLoadingStudents) {
      return (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      );
    }

    if (eligibleStudents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <UsersRound className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">No students assigned to this section/department</p>
        </div>
      );
    }

    const xpValue = selectedEvent?.xp || "0";

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-[15px] text-slate-800">Select Students</h3>
            <div className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl text-orange-800 font-bold text-[13px]">
              Award: {xpValue} XP
            </div>
          </div>
          
          <label className="flex items-center gap-3 py-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="font-bold text-sm text-slate-800">Select All Students</span>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
          {eligibleStudents.map((student) => (
            <label 
              key={student.id} 
              className="flex items-center gap-3 p-3 mb-1 bg-white hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={selectedStudentIds.has(student.id)}
                onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-800 truncate">{student.fullName}</div>
                <div className="text-xs text-slate-500">{student.studentId}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-white p-4 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          <input 
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 mb-3"
            placeholder="Add optional description/remarks…"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
          <button
            onClick={submitAward}
            disabled={isAwarding || selectedStudentIds.size === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-sm flex justify-center items-center ${
              isAwarding || selectedStudentIds.size === 0 ? 'bg-teal-600/50 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isAwarding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Award XP to ${selectedStudentIds.size} Students`
            )}
          </button>
        </div>
      </div>
    );
  };

  const getAppBarTitle = () => {
    if (currentFlowStep === 0) return "Performance Activities";
    if (currentFlowStep === 1) return `${CATEGORY_STYLES[selectedCategory!]?.label || ''} Events`;
    return selectedEvent?.name || "Event Details";
  };

  if (isLoadingActivities) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-4 flex items-center sticky top-0 z-20 shadow-md">
        {currentFlowStep > 0 && (
          <button 
            onClick={() => setCurrentFlowStep(prev => prev - 1)}
            className="mr-3 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold truncate">{getAppBarTitle()}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentFlowStep === 0 && renderCategoryGrid()}
        {currentFlowStep === 1 && renderEventList()}
        {currentFlowStep === 2 && renderStudentListAndAward()}
      </div>
    </div>
  );
}
