import { useState, useEffect } from 'react';
import { activityService } from '../api/activityService';
import type { ActivityModel } from '../types/ActivityTypes';

interface ActivityFormProps {
  initialData?: Partial<ActivityModel>;
  onSubmit: (data: Partial<ActivityModel>) => void;
  isSubmitting: boolean;
}

const XP_CATEGORIES = [
  'Academic', 'Skill', 'Communication', 'Leadership', 'Discipline',
  'Placement', 'Innovation', 'Community', 'Sports', 'Cultural'
];

const EVIDENCE_OPTIONS = [
  'Handwritten', 'Soft Copy', 'Diary / Notebook', 'Weekly Log',
  'Direct Observation', 'Attendance Register', 'ERP Attendance'
];

export default function ActivityForm({ initialData, onSubmit, isSubmitting }: ActivityFormProps) {
  const [formData, setFormData] = useState<Partial<ActivityModel>>({
    name: '',
    description: '',
    justification: '',
    type: 'Individual',
    xpCategory: 'Academic',
    xpType: 'Reward',
    awardEnabled: true,
    awardXp: 0,
    penaltyEnabled: false,
    penaltyXp: 0,
    cap: 1,
    awardFrequency: 'One Time',
    evidence: [],
    status: 'ACTIVE',
    displayOrder: 0,
    ...initialData
  });

  const [customFrequencies, setCustomFrequencies] = useState<any[]>([]);

  useEffect(() => {
    activityService.fetchCustomFrequencies().then(setCustomFrequencies).catch(console.error);
  }, []);

  const handleChange = (field: keyof ActivityModel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEvidence = (ev: string) => {
    const current = formData.evidence || [];
    if (current.includes(ev)) {
      handleChange('evidence', current.filter(e => e !== ev));
    } else {
      handleChange('evidence', [...current, ev]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Core Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Activity Name *</label>
            <input required type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Completed Assignment" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Description</label>
            <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Provide details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Type</label>
              <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">XP Category</label>
              <select value={formData.xpCategory} onChange={e => handleChange('xpCategory', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                {XP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">XP Rules</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-slate-700">XP Type:</label>
            <select value={formData.xpType} onChange={e => {
              const val = e.target.value;
              handleChange('xpType', val);
              if (val === 'Penalty') {
                handleChange('awardEnabled', false);
                handleChange('penaltyEnabled', true);
              } else {
                handleChange('awardEnabled', true);
                handleChange('penaltyEnabled', false);
              }
            }} className="p-2 border border-slate-300 rounded-lg outline-none bg-white">
              <option value="Reward">Reward</option>
              <option value="Penalty">Penalty</option>
              <option value="Both">Both</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {formData.awardEnabled && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Award XP</label>
                <input type="number" value={formData.awardXp} onChange={e => handleChange('awardXp', parseInt(e.target.value) || 0)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
              </div>
            )}
            {formData.penaltyEnabled && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Penalty XP</label>
                <input type="number" value={formData.penaltyXp} onChange={e => handleChange('penaltyXp', parseInt(e.target.value) || 0)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Maximum Uses (Cap)</label>
              <input type="number" value={formData.cap} onChange={e => handleChange('cap', parseInt(e.target.value) || 1)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Frequency</label>
              <select value={formData.awardFrequency} onChange={e => handleChange('awardFrequency', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="One Time">One Time</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                {customFrequencies.map(cf => (
                  <option key={cf.id} value={cf.name}>{cf.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Requirements</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Evidence Required</label>
            <div className="flex flex-wrap gap-2">
              {EVIDENCE_OPTIONS.map(ev => {
                const selected = (formData.evidence || []).includes(ev);
                return (
                  <button type="button" key={ev} onClick={() => toggleEvidence(ev)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selected ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Justification / Rationale</label>
            <textarea value={formData.justification || ''} onChange={e => handleChange('justification', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Why is this activity important?" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-10">
        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#EA4335] text-white font-bold rounded-xl shadow hover:bg-red-600 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Activity' : 'Create Activity')}
        </button>
      </div>
    </form>
  );
}
