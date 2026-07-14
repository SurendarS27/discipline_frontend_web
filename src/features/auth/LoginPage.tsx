import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../store/authContext';
import apiClient from '../../services/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [role, setRole] = useState('Student');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identity.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (role === 'Admin' || role === 'Teacher') {
        const res = await apiClient.post('/api/v1/auth/login', {
          username: identity,
          password
        });
        
        if (res.data.success) {
          const data = res.data.data;
          const token = data.token;
          const roles: string[] = data.roles || [];
          const userType = data.userType || '';
          
          if (roles.includes('ROLE_ADMIN')) {
            login(token, 'ADMIN');
            navigate('/admin');
          } else if (userType === 'TEACHER' || roles.includes('ROLE_TEACHER') || roles.includes('ROLE_DISCIPLINE_COMMITTEE')) {
            login(token, 'TEACHER');
            navigate('/teacher');
          } else {
            setError('Unauthorized role combination');
          }
        } else {
          setError('Invalid credentials');
        }
      } else {
        const res = await apiClient.post('/api/v1/auth/student-login', {
          identity,
          password
        });
        
        if (res.data.success) {
          const data = res.data.data;
          const token = data.token;
          const userType = data.userType || '';
          const isCaptain = data.isCaptain === true || data.captain === true;
          
          login(token, isCaptain || userType === 'CAPTAIN' ? 'CAPTAIN' : 'STUDENT');
          navigate('/student'); // Both Captains and Students go here
        } else {
          setError('Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-6">
      <div className="bg-white/95 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Lock className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">SPDMS Login</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your credentials to access your portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username / ID / Email</label>
            <div className="relative">
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Enter your Username, ID or Email"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
