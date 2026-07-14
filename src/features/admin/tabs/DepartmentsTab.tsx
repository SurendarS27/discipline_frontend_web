import { useState, useEffect } from 'react';
import { Building2, Search, Plus, Edit2, Trash2, ArrowLeft, RefreshCw, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onBack?: () => void;
}

export default function DepartmentsTab({ onBack }: Props) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/departments');
      if (response.data?.success) {
        setDepartments(response.data.data || []);
        setFilteredDepartments(response.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setFilteredDepartments(departments);
    } else {
      setFilteredDepartments(departments.filter(d => 
        (d.name || '').toLowerCase().includes(query) ||
        (d.code || '').toLowerCase().includes(query)
      ));
    }
  };

  const openModal = (dept: any = null) => {
    setEditingDept(dept);
    if (dept) {
      setFormData({ name: dept.name || '', code: dept.code || '' });
    } else {
      setFormData({ name: '', code: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await apiClient.put(`/api/v1/admin/departments/${editingDept.id}`, formData);
      } else {
        await apiClient.post('/api/v1/admin/departments', formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (e) {
      console.error(e);
      alert('Failed to save department. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await apiClient.delete(`/api/v1/admin/departments/${id}`);
        fetchDepartments();
      } catch (e) {
        console.error(e);
        alert('Failed to delete department.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6">
        <div className="flex items-center space-x-4 mb-6">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white flex-1">Departments</h1>
          <button onClick={fetchDepartments} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border-none rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">All Departments ({filteredDepartments.length})</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dept</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No departments found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDepartments.map(dept => (
              <div key={dept.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{dept.name}</h3>
                    <p className="text-sm font-medium text-amber-600">{dept.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openModal(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Department Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Department Code *</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none uppercase" />
              </div>
              
              <div className="mt-8 flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                  {editingDept ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
