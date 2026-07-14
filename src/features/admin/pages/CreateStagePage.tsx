import { useState } from 'react';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onBack: () => void;
}

export default function CreateStagePage({ onBack }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '0',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both Start and End dates');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
        active: formData.isActive
      };
      
      const response = await apiClient.post('/api/v1/admin/stages', payload);
      if (response.data?.success || response.status === 200 || response.status === 201) {
        onBack();
      } else {
        alert(response.data?.message || 'Failed to create stage');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating stage');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6 flex items-center space-x-4">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white flex-1">Create New Stage</h1>
      </div>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Stage Name *</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Stage 1"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description of this stage's purpose..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" /> Start Date *
                </label>
                <input 
                  required 
                  type="date" 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" /> End Date *
                </label>
                <input 
                  required 
                  type="date" 
                  value={formData.endDate} 
                  min={formData.startDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Display Order</label>
                <input 
                  type="number" 
                  value={formData.displayOrder} 
                  onChange={e => setFormData({...formData, displayOrder: e.target.value})} 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                />
              </div>
              <div className="flex items-center pt-6 space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Active Status</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onBack} 
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:opacity-70 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
