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
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-slate-900 px-6 pt-12 pb-6">
        <div className="flex items-center space-x-4 mb-6">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white flex-1">Student Management</h1>
          <button onClick={fetchStudents} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name, reg no, SPR..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border-none rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">All Students ({filteredStudents.length})</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No students found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {student.fullName ? student.fullName[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{student.fullName}</h3>
                    <p className="text-xs text-slate-500">{student.department?.name || 'No Dept'} • {student.year || 'No Year'} • {student.section || 'No Sec'}</p>
                    <p className="text-xs font-medium text-slate-600 mt-1">Reg: {student.registerNumber} | SPR: {student.sprNo}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openModal(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Full Name *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Username *</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Password {editingStudent ? '(Leave blank to keep)' : '*'}</label>
                  <input required={!editingStudent} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Register Number *</label>
                  <input required type="text" value={formData.registerNumber} onChange={e => setFormData({...formData, registerNumber: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">SPR Number *</label>
                  <input required type="text" value={formData.sprNo} onChange={e => setFormData({...formData, sprNo: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Mobile Number</label>
                  <input type="text" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                  <input type="date" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                {/* Selects */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <select value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Year</label>
                  <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Semester</label>
                  <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.semesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Section</label>
                  <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.genders.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Academic Year</label>
                  <select value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {lookups.academicYears.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  {editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
