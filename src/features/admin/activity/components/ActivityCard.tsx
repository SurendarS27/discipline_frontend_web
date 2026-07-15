import { Pencil, Trash2, UserPlus, BookOpen } from 'lucide-react';
import type { ActivityModel } from '../types/ActivityTypes';

interface ActivityCardProps {
  activity: ActivityModel;
  onEdit: () => void;
  onDelete: () => void;
  onAssign?: () => void;
  onTap?: () => void;
  isCc?: boolean;
  isReadOnly?: boolean;
}

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
  onAssign,
  onTap,
  isCc = false,
  isReadOnly = false,
}: ActivityCardProps) {
  return (
    <div 
      onClick={onTap}
      className={`bg-white shadow-sm border border-slate-200 rounded-2xl mb-4 p-5 ${onTap ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-[16px] text-[#1E293B] flex-1 mr-4">{activity.name}</h3>
        {!isReadOnly && (
          <div className="flex items-center gap-1 shrink-0">
            {onAssign && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAssign(); }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Assign Faculty"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={isCc ? 'Assign Faculty/Owner' : 'Edit'}
            >
              {isCc ? <UserPlus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            </button>
            {!isCc && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {activity.description && (
        <p className="text-[13px] text-gray-600 mt-1">{activity.description}</p>
      )}

      <div className="h-px bg-slate-100 my-3.5" />

      <div className="flex flex-wrap gap-2 mb-3.5">
        {activity.awardEnabled && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 uppercase">
            Award: {activity.awardXp}
          </span>
        )}
        {activity.penaltyEnabled && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 uppercase">
            Penalty: {activity.penaltyXp}
          </span>
        )}
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase">
          Cap: {activity.cap}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
          Freq: {activity.awardFrequency}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
          Type: {activity.type}
        </span>
      </div>

      {!activity.assignmentSummary || activity.assignmentSummary.length === 0 ? (
        <div className="flex items-start gap-2 mb-2">
          <UserPlus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <span className="text-xs text-gray-700 font-medium">
            Department: {activity.ownerDepartment || "Unassigned"} (No assignments yet)
          </span>
        </div>
      ) : (
        <div className="mb-2">
          <div className="flex items-start gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-800 font-bold">
              {activity.assignmentMode === 'GLOBAL'
                ? 'Assignment Mode: Global (All Departments)'
                : `Assignments (${activity.ownerDepartment}):`}
            </span>
          </div>
          <div className="pl-6 flex flex-col gap-1">
            {activity.assignmentSummary.map((assign, idx) => {
              const text = assign.section
                ? `Section ${assign.section} → ${assign.teacher || 'Unknown Teacher'}`
                : `Assigned to → ${assign.teacher || 'Unknown Teacher'}`;
              return (
                <span key={idx} className="text-xs text-gray-600">
                  • {text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {activity.evidence && activity.evidence.length > 0 && (
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-50">
          <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <span className="text-xs text-gray-600 italic">
            Evidence: {activity.evidence.join(', ')}
          </span>
        </div>
      )}
      
      {activity.justification && (
        <div className="flex items-start gap-2 mt-1.5">
          <div className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="text-xs text-gray-500 italic">
            Justification: {activity.justification}
          </span>
        </div>
      )}
    </div>
  );
}
