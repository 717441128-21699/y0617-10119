import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, UserCog, School, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import type { UserRole } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useStore((s) => s.login);
  const [role, setRole] = useState<UserRole>('student');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: Location })?.from?.pathname || null;

  const roleOptions = [
    { value: 'student' as UserRole, label: '学生', icon: GraduationCap, placeholder: '请输入学号', hint: '默认密码 123456' },
    { value: 'leader' as UserRole, label: '社团负责人', icon: UserCog, placeholder: '请输入学号', hint: '默认密码 123456' },
    { value: 'admin' as UserRole, label: '校团委管理员', icon: School, placeholder: '请输入管理员账号', hint: '账号 admin / 密码 admin123' },
  ];

  const currentOption = roleOptions.find((r) => r.value === role)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(studentId.trim(), password);
    if (!user) {
      setError('账号或密码错误，请重试');
      return;
    }
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    const redirect: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      leader: '/leader/dashboard',
      student: '/student/home',
    };
    navigate(redirect[user.role], { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-500 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">高校社团管理平台</h1>
                <p className="text-sm text-white/70 mt-0.5">University Club Management System</p>
              </div>
            </div>
          </div>

          <div className="relative space-y-6">
            <div className="flex items-center gap-3 text-white/90">
              <Sparkles className="w-5 h-5 text-accent-400" />
              <span className="text-sm">社团注册审批数字化</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Sparkles className="w-5 h-5 text-accent-400" />
              <span className="text-sm">活动场地经费一站式申请</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Sparkles className="w-5 h-5 text-accent-400" />
              <span className="text-sm">成员扫码加入 · 在线签到</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Sparkles className="w-5 h-5 text-accent-400" />
              <span className="text-sm">自动生成社团官网主页</span>
            </div>
          </div>

          <p className="relative text-sm text-white/50">© 2025 University Club Platform</p>
        </div>

        <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">欢迎回来</h2>
            <p className="text-gray-500">请选择身份并登录系统</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRole(opt.value); setError(''); }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                  role === opt.value
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{currentOption.label}账号</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={currentOption.placeholder}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{currentOption.hint}</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm">{error}</div>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-base">
              <span>登 录</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>测试账号速查</p>
            <p className="mt-1.5 space-x-4">
              <span className="text-gray-400">admin/admin123</span>
              <span className="text-gray-400">2023001001/123456</span>
              <span className="text-gray-400">2023002001/123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
