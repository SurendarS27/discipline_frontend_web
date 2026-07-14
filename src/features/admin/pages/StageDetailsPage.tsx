import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, UserPlus, RefreshCw, X, FileText } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onBack: () => void;
  stageId: number;
  stageName: string;
  stageDescription: string;
  teachersList?: any[];
  onPushView: (name: string, props?: any) => void;
}

export default function StageDetailsPage({ onBack, stageId, stageName, stageDescription, teachersList = [], onPushView }: Props) {
  const [subgroups, setSubgroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubgroup, setEditingSubgroup] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: 'must (individual)',
    category: 'INDIVIDUAL',
    threshold: ''
  });

  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [selectedSubgroupForFaculty, setSelectedSubgroupForFaculty] = useState<any>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  useEffect(() => {
    fetchSubgroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubgroups = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/stages');
      if (response.data?.success) {
        const stages = response.data.data || [];
        const currentStage = stages.find((s: any) => s.id === stageId);
        if (currentStage) {
          setSubgroups(currentStage.subgroups || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (sub: any = null) => {
    setEditingSubgroup(sub);
    if (sub) {
      setFormData({
        name: sub.name || '',
        category: sub.category || 'INDIVIDUAL',
        threshold: sub.threshold?.toString() || ''
      });
    } else {
      setFormData({
        name: 'must (individual)',
        category: 'INDIVIDUAL',
        threshold: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.threshold) return;

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        threshold: parseInt(formData.threshold) || 0
      };

      if (editingSubgroup) {
        await apiClient.put(`/api/v1/admin/stages/${stageId}/subgroups/${editingSubgroup.id}`, payload);
      } else {
        await apiClient.post(`/api/v1/admin/stages/${stageId}/subgroups`, payload);
      }
      
      setIsModalOpen(false);
      fetchSubgroups();
    } catch (e) {
      console.error(e);
      alert('Failed to save subgroup');
    }
  };

  const handleDelete = async (subId: number) => {
    if (window.confirm('Are you sure you want to delete this subgroup?')) {
      try {
        await apiClient.delete(`/api/v1/admin/stages/${stageId}/subgroups/${subId}`);
        fetchSubgroups();
      } catch (e) {
        console.error(e);
        alert('Failed to delete subgroup');
      }
    }
  };

  const openFacultyModal = (sub: any) => {
    setSelectedSubgroupForFaculty(sub);
    setSelectedFacultyId('');
    setIsFacultyModalOpen(true);
  };

  const handleAssignFaculty = async () => {
    if (!selectedFacultyId || !selectedSubgroupForFaculty) return;
    try {
      await apiClient.put(`/api/v1/admin/stages/${stageId}/subgroups/${selectedSubgroupForFaculty.id}/assign?facultyId=${selectedFacultyId}`);
      setIsFacultyModalOpen(false);
      fetchSubgroups();
    } catch (e) {
      console.error(e);
      alert('Failed to assign faculty');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{stageName}</h1>
          <p className="text-slate-400 text-sm">{stageDescription}</p>
        </div>
        <button onClick={fetchSubgroups} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Subgroups ({subgroups.length})</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subgroup</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : subgroups.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No subgroups found for this stage.
          </div>
        ) : (
          <div className="space-y-4">
            {subgroups.map(sub => (
              <div key={sub.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 mb-4 md:mb-0 pr-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{sub.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200 uppercase">
                      {sub.category || 'INDIVIDUAL'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-2">
                    <span className="font-medium text-slate-900">Threshold:</span> {sub.threshold} XP required
                  </div>
                  
                  {sub.assignedFacultyName ? (
                    <div className="text-sm font-medium text-green-600 flex items-center">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Assigned to: {sub.assignedFacultyName}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-amber-500 flex items-center">
                      <UserPlus className="w-4 h-4 mr-1" />
                      No Faculty Assigned
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => openFacultyModal(sub)}
                    className="flex-1 md:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Assign Faculty
                  </button>
                  <button 
                    onClick={() => onPushView('activity_list', { stageId, subgroup: sub })}
                    className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-1" /> Activities
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(sub)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingSubgroup ? 'Edit Subgroup' : 'Add New Subgroup'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Subgroup Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Category *</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GROUP">Group</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Threshold (XP) *</label>
                <input required type="number" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="mt-8 flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  {editingSubgroup ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Faculty</h2>
              <button onClick={() => setIsFacultyModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Assign a faculty member to manage requests for <strong>{selectedSubgroupForFaculty?.name}</strong>.</p>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Select Faculty *</label>
                <select value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">-- Select Teacher --</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName || t.username}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsFacultyModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleAssignFaculty} disabled={!selectedFacultyId} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
