import { useState, useEffect } from 'react';
import { School, Search, Plus, Edit2, Trash2, ArrowLeft, RefreshCw, X, UserCog } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onBack?: () => void;
}

export default function TeachersTab({ onBack }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Lookups
  const [lookups, setLookups] = useState({
    departments: [] as any[],
    roles: [] as any[],
    subjects: [] as any[],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', email: '', 
    departmentId: '', mainRole: 'ROLE_TEACHER', subRoles: [] as string[],
    section: '', year: '', subjectIds: [] as number[]
  });

  useEffect(() => {
    fetchLookups();
    fetchUsers();
  }, []);

  const fetchLookups = async () => {
    try {
      const [deptRes, roleRes, subjRes] = await Promise.all([
        apiClient.get('/api/v1/admin/departments'),
        apiClient.get('/api/v1/admin/roles'),
        apiClient.get('/api/v1/admin/subjects')
      ]);

      setLookups({
        departments: deptRes.data?.data || [],
        roles: roleRes.data?.data || [{name: 'ROLE_ADMIN'}, {name: 'ROLE_TEACHER'}, {name: 'ROLE_STUDENT'}],
        subjects: subjRes.data?.data || []
      });
    } catch (e) {
      console.error(e);
      // Fallback roles if API fails
      setLookups(prev => ({ ...prev, roles: [{name: 'ROLE_ADMIN'}, {name: 'ROLE_TEACHER'}, {name: 'ROLE_STUDENT'}] }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/users');
      if (response.data?.success) {
        const allUsers = response.data.data || [];
        // Filter out students to show only staff/teachers in this tab
        const staff = allUsers.filter((u: any) => !u.roles?.includes('ROLE_STUDENT'));
        setUsers(staff);
        setFilteredUsers(staff);
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
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => 
        (u.fullName || '').toLowerCase().includes(query) ||
        (u.username || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query)
      ));
    }
  };

  const openModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      const roles = user.roles || [];
      const mainRole = roles.length > 0 ? roles[0] : 'ROLE_TEACHER';
      const subRoles = roles.length > 1 ? roles.slice(1) : [];

      setFormData({
        username: user.username || '',
        password: '',
        fullName: user.fullName || '',
        email: user.email || '',
        departmentId: user.department?.id?.toString() || '',
        mainRole: mainRole,
        subRoles: subRoles,
        section: user.section || '',
        year: user.year || '',
        subjectIds: user.subjects?.map((s: any) => s.id) || []
      });
    } else {
      setFormData({
        username: '', password: '', fullName: '', email: '', 
        departmentId: lookups.departments.length > 0 ? lookups.departments[0].id.toString() : '',
        mainRole: 'ROLE_TEACHER', subRoles: [],
        section: '', year: '', subjectIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rolesToSubmit = [formData.mainRole, ...formData.subRoles];
      
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        roles: rolesToSubmit,
        subjectIds: formData.subjectIds
      };
      
      if (editingUser) {
        if (!payload.password) delete (payload as any).password;
        await apiClient.put(`/api/v1/admin/users/${editingUser.id}`, payload);
      } else {
        await apiClient.post('/api/v1/admin/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.delete(`/api/v1/admin/users/${id}`);
        fetchUsers();
      } catch (e) {
        console.error(e);
        alert('Failed to delete user.');
      }
    }
  };

  const toggleSubRole = (role: string) => {
    setFormData(prev => {
      const exists = prev.subRoles.includes(role);
      if (exists) {
        return { ...prev, subRoles: prev.subRoles.filter(r => r !== role) };
      } else {
        return { ...prev, subRoles: [...prev.subRoles, role] };
      }
    });
  };

  const toggleSubject = (id: number) => {
    setFormData(prev => {
      const exists = prev.subjectIds.includes(id);
      if (exists) {
        return { ...prev, subjectIds: prev.subjectIds.filter(s => s !== id) };
      } else {
        return { ...prev, subjectIds: [...prev.subjectIds, id] };
      }
    });
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
          <h1 className="text-2xl font-bold text-white flex-1">Staff Management</h1>
          <button onClick={fetchUsers} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff by name, username..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border-none rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">All Staff ({filteredUsers.length})</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No staff found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{user.fullName || user.username}</h3>
                    <p className="text-xs text-slate-500">{user.email || 'No Email'} • {user.department?.name || 'No Dept'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(user.roles || []).map((r: string) => (
                        <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 self-end md:self-center">
                  <button onClick={() => openModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Edit Staff Member' : 'Add New Staff'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-green-600" /> Basic Details
                  </h3>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Full Name *</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Username *</label>
                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Password {editingUser ? '(Leave blank to keep)' : '*'}</label>
                    <input required={!editingUser} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Department</label>
                    <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      <option value="">-- None --</option>
                      {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Roles and Subjects */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <School className="w-4 h-4 text-green-600" /> Roles & Responsibilities
                  </h3>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Primary Role *</label>
                    <select value={formData.mainRole} onChange={e => setFormData({...formData, mainRole: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      {lookups.roles.filter(r => r.name !== 'ROLE_STUDENT').map(r => <option key={r.name} value={r.name}>{r.name.replace('ROLE_', '')}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-slate-700">Additional Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {lookups.roles.filter(r => r.name !== 'ROLE_STUDENT' && r.name !== formData.mainRole).map(r => (
                        <button
                          key={r.name}
                          type="button"
                          onClick={() => toggleSubRole(r.name)}
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            formData.subRoles.includes(r.name) 
                              ? 'bg-green-100 border-green-300 text-green-800' 
                              : 'bg-white border-slate-300 text-slate-600'
                          }`}
                        >
                          + {r.name.replace('ROLE_', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium text-slate-700">Subjects Handled</label>
                    <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                      {lookups.subjects.length > 0 ? lookups.subjects.map(s => (
                        <label key={s.id} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded">
                          <input 
                            type="checkbox" 
                            checked={formData.subjectIds.includes(s.id)}
                            onChange={() => toggleSubject(s.id)}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-slate-700">{s.name} ({s.code})</span>
                        </label>
                      )) : (
                        <div className="text-xs text-slate-500 p-2">No subjects found.</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Year (Optional)</label>
                      <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Section (Optional)</label>
                      <input type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                  {editingUser ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
