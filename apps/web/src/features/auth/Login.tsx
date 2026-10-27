import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@edusphere.com',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({
        email: data.email,
        password: data.password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const errorText =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to sign in. Please verify your credentials.';
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', 'admin@edusphere.com');
    setValue('password', 'admin123');
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      {/* Left side: Navy Brand Illustration Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">EduSphere</h1>
            <p className="text-xs text-slate-400 font-medium">School ERP + CRM</p>
          </div>
        </div>

        {/* Center Copy & Visual */}
        <div className="my-auto py-12 z-10 max-w-lg">
          <div className="mb-8">
            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Better Education <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Brighter Future
              </span>
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Manage your school, students, teachers, parents and more — all in one place.
            </p>
          </div>

          {/* School Building Vector Illustration */}
          <div className="relative mx-auto w-full max-w-sm rounded-2xl p-6 bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <svg
              className="w-full h-48 text-blue-400"
              viewBox="0 0 320 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Moon / Sun */}
              <circle cx="270" cy="35" r="14" fill="#3882F6" fillOpacity="0.4" />
              <circle cx="270" cy="35" r="8" fill="#60A5FA" />
              {/* Stars */}
              <circle cx="45" cy="30" r="2" fill="#93C5FD" />
              <circle cx="95" cy="45" r="1.5" fill="#93C5FD" />
              <circle cx="220" cy="20" r="2" fill="#93C5FD" />
              {/* Ground */}
              <rect x="10" y="150" width="300" height="4" rx="2" fill="#334155" />
              {/* School Main Building */}
              <rect x="80" y="70" width="160" height="80" rx="3" fill="#1E293B" stroke="#3882F6" strokeWidth="2" />
              {/* Central Clock Tower / Dome */}
              <rect x="130" y="40" width="60" height="30" rx="2" fill="#0F172A" stroke="#3882F6" strokeWidth="2" />
              <path d="M130 40 L160 15 L190 40 Z" fill="#3882F6" />
              <circle cx="160" cy="55" r="7" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
              {/* Entrance Arch */}
              <path d="M142 150 V115 Q160 100 178 115 V150 Z" fill="#3882F6" />
              {/* Windows */}
              <rect x="95" y="85" width="22" height="20" rx="2" fill="#0F172A" stroke="#60A5FA" strokeWidth="1" />
              <rect x="95" y="115" width="22" height="20" rx="2" fill="#0F172A" stroke="#60A5FA" strokeWidth="1" />
              <rect x="203" y="85" width="22" height="20" rx="2" fill="#0F172A" stroke="#60A5FA" strokeWidth="1" />
              <rect x="203" y="115" width="22" height="20" rx="2" fill="#0F172A" stroke="#60A5FA" strokeWidth="1" />
              {/* Trees */}
              <circle cx="50" cy="125" r="16" fill="#10B981" fillOpacity="0.8" />
              <rect x="47" y="138" width="6" height="12" fill="#475569" />
              <circle cx="270" cy="125" r="16" fill="#10B981" fillOpacity="0.8" />
              <rect x="267" y="138" width="6" height="12" fill="#475569" />
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 z-10 flex items-center justify-between">
          <span>EduSphere ERP & CRM v0.1.0</span>
          <span>© 2026 EduSphere Inc.</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-100">
          {/* Mobile brand heading */}
          <div className="flex items-center space-x-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">EduSphere</h2>
              <span className="text-xs text-slate-500">School ERP + CRM</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account
            </p>
          </div>

          {/* Quick Demo Helper Pill */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div>
              <span className="font-semibold text-blue-700">Demo Login:</span>{' '}
              admin@edusphere.com / admin123
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-blue-600 font-medium hover:underline text-xs"
            >
              Auto-fill
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@edusphere.com"
                  {...register('email')}
                  className={`w-full rounded-lg border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register('password')}
                  className={`w-full rounded-lg border bg-white pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 text-xs sm:text-sm">Remember me</span>
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact your School Super Administrator to reset your password.');
                }}
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-[#3882F6] hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-sm shadow-blue-500/20"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                alert('For new school registrations, please contact your administration office.');
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              Contact admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
