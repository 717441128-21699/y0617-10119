import { useMemo } from 'react';
import {
  UserCircle,
  GraduationCap,
  Phone,
  Mail,
  Building2,
  Users,
  CalendarDays,
  CheckCircle2,
  Edit3,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import DashboardLayout from '@/components/DashboardLayout';

export default function StudentProfile() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const members = useStore((s) => s.members);
  const activities = useStore((s) => s.activities);

  const stats = useMemo(() => {
    if (!currentUser) return { clubs: 0, activities: 0, checkIns: 0 };

    const joinedClubs = members.filter(
      (m) => m.studentId === currentUser.studentId && m.status === 'approved'
    ).length;

    let activityCount = 0;
    let checkInCount = 0;

    activities.forEach((activity) => {
      const reg = activity.registrations.find(
        (r) => r.studentId === currentUser.studentId && r.status === 'registered'
      );
      if (reg) activityCount++;

      const att = activity.attendances.find((a) => a.studentId === currentUser.studentId);
      if (att) checkInCount++;
    });

    return { clubs: joinedClubs, activities: activityCount, checkIns: checkInCount };
  }, [currentUser, members, activities]);

  const statCards = [
    {
      label: '加入社团',
      value: stats.clubs,
      unit: '个',
      icon: Building2,
      color: 'from-brand-500 to-brand-700',
      bg: 'bg-brand-50',
      text: 'text-brand-700',
    },
    {
      label: '参与活动',
      value: stats.activities,
      unit: '场',
      icon: CalendarDays,
      color: 'from-accent-500 to-accent-700',
      bg: 'bg-accent-50',
      text: 'text-accent-700',
    },
    {
      label: '签到次数',
      value: stats.checkIns,
      unit: '次',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div className="card overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-brand-900 via-brand-800 to-accent-600 relative">
            <div className="absolute inset-0 opacity-20 bg-grid" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-400 rounded-full blur-3xl opacity-40" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-400 rounded-full blur-3xl opacity-30" />
          </div>

          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white font-serif">
                      {currentUser?.name?.slice(-2) || '?'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentUser?.name || '未登录'}
                      </h1>
                      <span className="badge bg-brand-100 text-brand-700">
                        <Sparkles className="w-3 h-3" />
                        {currentUser?.role === 'admin'
                          ? '管理员'
                          : currentUser?.role === 'leader'
                          ? '社团负责人'
                          : '学生'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      学号：{currentUser?.studentId || '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="btn-secondary !py-2 text-sm">
                      <Edit3 className="w-4 h-4" />
                      编辑资料
                    </button>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost !py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="stat-card card group hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                    <span className="text-base font-normal text-gray-400 ml-1">{stat.unit}</span>
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8">
          <h2 className="section-title">
            <UserCircle className="w-6 h-6 text-brand-600" />
            个人信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">姓名</p>
                  <p className="font-medium text-gray-900">
                    {currentUser?.name || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">学号</p>
                  <p className="font-medium text-gray-900">
                    {currentUser?.studentId || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">学院</p>
                  <p className="font-medium text-gray-900">
                    {currentUser?.department || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">手机号码</p>
                  <p className="font-medium text-gray-900">
                    {currentUser?.phone || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">邮箱</p>
                  <p className="font-medium text-gray-900">
                    {currentUser?.email || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="section-title">
            <Users className="w-6 h-6 text-brand-600" />
            参与概览
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-600 font-medium mb-1">社团参与</p>
                  <p className="text-3xl font-bold text-brand-900">
                    {stats.clubs}
                    <span className="text-base font-normal text-brand-500 ml-1">个社团</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-brand-600/70 mt-4">
                {stats.clubs > 0
                  ? '继续积极参与社团活动，收获更多友谊与成长！'
                  : '快去社团广场发现感兴趣的社团吧！'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-50 to-orange-50 border border-accent-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-accent-600 font-medium mb-1">活动参与</p>
                  <p className="text-3xl font-bold text-accent-900">
                    {stats.activities}
                    <span className="text-base font-normal text-accent-500 ml-1">场活动</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">签到 {stats.checkIns} 次</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">
                    出勤率{' '}
                    {stats.activities > 0
                      ? Math.round((stats.checkIns / stats.activities) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
