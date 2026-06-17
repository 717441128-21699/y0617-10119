import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Award,
  LogOut,
  Building2,
  UserCircle,
  ClipboardList,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface Props {
  role: 'admin' | 'leader' | 'student';
  children: React.ReactNode;
}

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: '数据看板' },
  { to: '/admin/clubs', icon: Building2, label: '社团审批' },
  { to: '/admin/activities', icon: CalendarDays, label: '活动审批' },
  { to: '/admin/finances', icon: Wallet, label: '经费审核' },
  { to: '/admin/reviews', icon: Award, label: '评优管理' },
];

const leaderNav: NavItem[] = [
  { to: '/leader/dashboard', icon: LayoutDashboard, label: '工作台' },
  { to: '/leader/club', icon: Building2, label: '社团信息' },
  { to: '/leader/members', icon: Users, label: '成员管理' },
  { to: '/leader/activities', icon: CalendarDays, label: '活动管理' },
  { to: '/leader/finances', icon: Wallet, label: '经费管理' },
  { to: '/leader/report', icon: FileText, label: '工作总结' },
];

const studentNav: NavItem[] = [
  { to: '/student/home', icon: Sparkles, label: '社团广场' },
  { to: '/student/activities', icon: CalendarDays, label: '活动大厅' },
  { to: '/student/my', icon: ClipboardList, label: '我的社团' },
  { to: '/student/profile', icon: UserCircle, label: '个人中心' },
];

const navMap = { admin: adminNav, leader: leaderNav, student: studentNav };
const roleNameMap = { admin: '校团委管理后台', leader: '社团负责人工作台', student: '学生服务中心' };

export default function DashboardLayout({ role, children }: Props) {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const navItems = navMap[role];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gradient-to-b from-brand-900 to-brand-800 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight">高校社团管理</h1>
              <p className="text-xs text-gray-300 mt-0.5">{roleNameMap[role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.studentId}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-rose-300 hover:text-rose-200 hover:bg-rose-500/10">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-gray-800">
            {navItems.find((n) => location.pathname.startsWith(n.to))?.label || ''}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
