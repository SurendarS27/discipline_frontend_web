import { useState, useEffect } from 'react';
import { UsersRound, RefreshCw, ChevronDown, ChevronUp, UserPlus, Edit2, Shield, UserMinus } from 'lucide-react';
import apiClient from '../../../services/apiClient';

export default function TeacherGroupManagementTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [depts, setDepts] = useState<string[]>(["All"]);
  const [years, setYears] = useState<string[]>(["All"]);
  const [sections, setSections] = useState<string[]>(["All"]);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/teams');
      if (response.data.success) {
        const data = response.data.data || [];
        setGroups(data);
        
        const deptSet = new Set<string>();
        const yearSet = new Set<string>();
        const sectionSet = new Set<string>();
        
        data.forEach((g: any) => {
          (g.teamMembers || []).forEach((m: any) => {
            if (m.department) deptSet.add(m.department);
            if (m.year) yearSet.add(m.year.toString());
            if (m.section) sectionSet.add(m.section);
          });
        });
        
        setDepts(["All", ...Array.from(deptSet).sort()]);
        setYears(["All", ...Array.from(yearSet).sort()]);
        setSections(["All", ...Array.from(sectionSet).sort()]);
      }
    } catch (e: any) {
      console.error("Error fetching teams", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredGroups = () => {
    return groups.filter(g => {
      const members = g.teamMembers || [];
      if (selectedDept !== "All" && !members.some((m: any) => m.department === selectedDept)) return false;
      if (selectedYear !== "All" && !members.some((m: any) => m.year?.toString() === selectedYear)) return false;
      if (selectedSection !== "All" && !members.some((m: any) => m.section === selectedSection)) return false;
      return true;
    });
  };

  const updateGroupLimit = async (teamId: number, currentSize: number) => {
    const limit = window.prompt("Enter new max size limit:", currentSize.toString());
    if (!limit) return;
    
    const newSize = parseInt(limit, 10);
    if (isNaN(newSize) || newSize <= 0) {
      alert("Please enter a valid positive number");
      return;
    }
    
    try {
      const response = await apiClient.put(`/api/v1/teams/${teamId}/limit?size=${newSize}`);
      if (response.data.success) {
        alert("Group limit updated successfully!");
        fetchGroups();
      } else {
        alert(response.data.message || "Failed to update group limit");
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const addMember = async (teamId: number) => {
    const studentId = window.prompt("Enter Student ID to add (e.g. 24CS01):");
    if (!studentId?.trim()) return;
    
    try {
      const response = await apiClient.post(`/api/v1/teams/${teamId}/add-member?studentId=${studentId.trim()}`);
      if (response.data.success) {
        alert("Member added successfully!");
        fetchGroups();
      } else {
        alert(response.data.message || "Failed to add member");
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const removeMember = async (teamId: number, studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    
    try {
      const response = await apiClient.post(`/api/v1/teams/${teamId}/remove-member?studentId=${studentId}`);
      if (response.data.success) {
        alert(`Removed ${name} successfully!`);
        fetchGroups();
      } else {
        alert(response.data.message || "Failed to remove member");
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const filteredGroups = getFilteredGroups();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-indigo-600 text-white px-6 py-4 sticky top-0 z-20 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">View Groups</h1>
        <button 
          onClick={fetchGroups} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-indigo-50 p-3 flex gap-2 border-b border-indigo-100 z-10 sticky top-[60px]">
        <select 
          className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option disabled>Dept</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select 
          className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          <option disabled>Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select 
          className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
          value={selectedSection}
          onChange={e => setSelectedSection(e.target.value)}
        >
          <option disabled>Section</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <UsersRound className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-medium">No groups found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map(g => {
              const isExpanded = expandedGroupId === g.teamId;
              const captainName = g.captainName || "No Captain";
              const members = g.teamMembers || [];
              const memberCount = members.length;
              const size = g.teamCapacity || 0;
              const groupName = g.teamName || "Group";

              return (
                <div key={g.teamId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedGroupId(isExpanded ? null : g.teamId)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <UsersRound className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] text-slate-800 truncate">{groupName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Captain: {captainName} • {memberCount}/{size} members
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50">
                      <div className="p-3 flex justify-end gap-2 border-b border-slate-100">
                        <button 
                          onClick={() => updateGroupLimit(g.teamId, size)}
                          className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Limit
                        </button>
                        <button 
                          onClick={() => addMember(g.teamId)}
                          className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add Member
                        </button>
                      </div>
                      
                      <div className="flex flex-col">
                        {members.map((m: any, i: number) => {
                          const isCaptain = m.studentId === g.captainId;
                          return (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCaptain ? 'bg-amber-500 text-white shadow-sm' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {isCaptain ? <Shield className="w-4 h-4" /> : <div className="font-bold text-xs">{m.fullName?.charAt(0)}</div>}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-slate-800 truncate">{m.fullName || "Student"}</div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {m.studentId} • {m.department || ''} {m.year || ''} {m.section || ''}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="shrink-0 flex items-center gap-2">
                                {isCaptain && (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    Captain
                                  </span>
                                )}
                                {!isCaptain && (
                                  <button 
                                    onClick={() => removeMember(g.teamId, m.studentId, m.fullName || "Student")}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Member"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
