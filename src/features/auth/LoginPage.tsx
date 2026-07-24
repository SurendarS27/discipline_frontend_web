import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, User, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService, type LoginCredentials } from './services/auth.service';

const loginSchema = z.object({
  role: z.enum(['Student', 'Teacher', 'Admin']),
  username: z.string().min(1, 'Username / ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'Student',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const response = await authService.login(data);
      const token = response.token;
      
      // Determine the user's role from the backend response
      let finalRole = 'STUDENT';
      const userType = (response as any).userType || '';
      const roles: string[] = (response as any).roles || [];
      const isCaptain = (response as any).isCaptain === true || (response as any).captain === true;

      if (data.role === 'Admin' || data.role === 'Teacher') {
        if (roles.includes('ROLE_ADMIN')) {
          finalRole = 'ADMIN';
        } else if (userType === 'TEACHER' || roles.includes('ROLE_TEACHER') || roles.includes('ROLE_DISCIPLINE_COMMITTEE')) {
          finalRole = 'TEACHER';
        } else {
          setError('Unauthorized role combination');
          return;
        }
      } else {
        finalRole = isCaptain || userType === 'CAPTAIN' ? 'CAPTAIN' : 'STUDENT';
      }

      // Call Zustand store login
      const user = {
        id: (response as any).id || (response as any).studentId || 'unknown',
        username: data.username,
        role: finalRole,
        name: (response as any).name || (response as any).firstName || data.username,
      };
      
      login(user, token);
      
      // Navigate to the correct dashboard
      navigate(`/${finalRole.toLowerCase()}`);
      
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <Lock className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SPDMS Login</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <div className="relative">
              <select
                {...register('role')}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none appearance-none text-gray-900"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username / ID / Email</label>
            <div className="relative">
              <input
                type="text"
                {...register('username')}
                placeholder="Enter your Username, ID or Email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-gray-900"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-gray-900"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-sm"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
