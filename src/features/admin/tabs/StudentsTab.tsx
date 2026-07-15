import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ArrowLeft, RefreshCw, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface Props {
  onBack?: () => void;
}

export default function StudentsTab({ onBack }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Lookups
  const [lookups, setLookups] = useState({
    departments: [] as any[],
    academicYears: [] as any[],
    years: [] as any[],
    semesters: [] as any[],
    genders: [] as any[],
    sections: [] as any[],
    groups: [] as any[]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', email: '', 
    mobileNumber: '', sprNo: '', registerNumber: '', dob: '',
    departmentId: '', academicYear: '', year: '', semester: '',
    gender: '', section: '', teamId: ''
  });

  useEffect(() => {
    fetchLookups();
    fetchStudents();
  }, []);

  const fetchLookups = async () => {
    try {
      const [deptRes, ayRes, yearRes, semRes, genRes, secRes, teamRes] = await Promise.all([
        apiClient.get('/api/v1/admin/departments'),
        apiClient.get('/api/v1/admin/academic-years'),
        apiClient.get('/api/v1/admin/years'),
        apiClient.get('/api/v1/admin/semesters'),
        apiClient.get('/api/v1/admin/genders'),
        apiClient.get('/api/v1/admin/sections'),
        apiClient.get('/api/v1/teams')
      ]);

      setLookups({
        departments: deptRes.data?.data || [],
        academicYears: ayRes.data?.data || [],
        years: yearRes.data?.data || [],
        semesters: semRes.data?.data || [],
        genders: genRes.data?.data || [],
        sections: secRes.data?.data || [],
        groups: teamRes.data?.data || []
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/admin/students');
      if (response.data?.success) {
        setStudents(response.data.data || []);
        setFilteredStudents(response.data.data || []);
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
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => 
        (s.fullName || '').toLowerCase().includes(query) ||
        (s.registerNumber || '').toLowerCase().includes(query) ||
        (s.sprNo || '').toLowerCase().includes(query)
      ));
    }
  };

  const openModal = (student: any = null) => {
    setEditingStudent(student);
    if (student) {
      setFormData({
        username: student.username || '',
        password: '',
        fullName: student.fullName || '',
        email: student.email || '',
        mobileNumber: student.mobileNumber || '',
        sprNo: student.sprNo || '',
        registerNumber: student.registerNumber || '',
        dob: student.dob || '',
        departmentId: student.department?.id?.toString() || '',
        academicYear: student.academicYear || '',
        year: student.year || '',
        semester: student.semester || '',
        gender: student.gender || '',
        section: student.section || '',
        teamId: student.team?.id?.toString() || ''
      });
    } else {
      setFormData({
        username: '', password: '', fullName: '', email: '', 
        mobileNumber: '', sprNo: '', registerNumber: '', dob: '',
        departmentId: lookups.departments.length > 0 ? lookups.departments[0].id.toString() : '',
        academicYear: lookups.academicYears[0] || '',
        year: lookups.years[0] || '',
        semester: lookups.semesters[0] || '',
        gender: lookups.genders[0] || '',
        section: lookups.sections[0] || '',
        teamId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        teamId: formData.teamId ? parseInt(formData.teamId) : null
      };
      
      if (editingStudent) {
        if (!payload.password) delete (payload as any).password;
        await apiClient.put(`/api/v1/admin/students/${editingStudent.id}`, payload);
      } else {
        await apiClient.post('/api/v1/admin/students', payload);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (e) {
      console.error(e);
      alert('Failed to save student. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiClient.delete(`/api/v1/admin/students/${id}`);
        fetchStudents();
      } catch (e) {
        console.error(e);
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 relative pb-20">
      <div className="bg-slate-900 px-6 pt-12 pb-4 shadow-md z-10">
        <div className="flex items-center space-x-4 mb-2">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white flex-1">Student Management</h1>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name, reg no, SPR..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setFilteredStudents(students); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No students found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 pl-2 mb-2 md:mb-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {student.fullName ? student.fullName[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">{student.fullName}</h3>
                    <p className="text-xs text-slate-500">{student.department?.name || 'No Dept'} • {student.year || 'No Year'} • {student.section || 'No Sec'}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Reg: {student.registerNumber} | SPR: {student.sprNo}</p>
                  </div>
                </div>
                <div className="flex space-x-1 pr-2 self-end md:self-center">
                  <button onClick={() => openModal(student)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB Add Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => openModal()}
          className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-6 pb-4">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1">
                {editingStudent ? `Edit Student: ${editingStudent.registerNumber || editingStudent.id}` : 'Add New Student'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone</label>
                  <input type="text" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} maxLength={10} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">SPR No</label>
                  <input type="text" value={formData.sprNo} onChange={e => setFormData({...formData, sprNo: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Register Number *</label>
                  <input required type="text" value={formData.registerNumber} onChange={e => setFormData({...formData, registerNumber: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                {!editingStudent && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Username *</label>
                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Password {editingStudent ? '(Leave blank to keep current)' : '*'}</label>
                  <input required={!editingStudent} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Date of Birth</label>
                  <input type="date" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Department *</label>
                  <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                    <option value="">-- Select --</option>
                    {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.code || d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Academic Year *</label>
                    <select value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                      {lookups.academicYears.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Year *</label>
                    <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                      {lookups.years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Semester *</label>
                    <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                      {lookups.semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Gender *</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                      {lookups.genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Section (Optional)</label>
                  <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white text-sm">
                    <option value="">No Section Selected</option>
                    {lookups.sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-500 font-semibold hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  {editingStudent ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
