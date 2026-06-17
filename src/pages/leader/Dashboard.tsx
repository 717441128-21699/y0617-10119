import { useNavigate } from 'react-router-dom';
import { Building2, Users, CalendarDays, Wallet, TrendingUp, Clock, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store';

export default function LeaderDashboard() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const activities = useStore((s) => s.activities);
  const finances = useStore((s) => s.finances);
  const members = useStore((s) => s.members);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const myMembers = myClub ? members.filter((m) => m.clubId === myClub.id) : [];
  const myActivities = myClub ? activities.filter((a) => a.clubId === myClub.id) : [];
  const myFinances = myClub ? finances.filter((f) => f.clubId === myClub.id) : [];

  const pendingMembers = myMembers.filter((m) => m.status === 'pending').length;
  const pendingActivities = myActivities.filter((a) => a.status === 'pending').length;
  const pendingFinances = myFinances.filter((f) => f.reviewStatus === 'pending').length;

  const income = myFinances.filter((f) => f.type === 'income' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0);
  const expense = myFinances.filter((f) => f.type === 'expense' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0);

  const stats = [
    { label: '社团成员', value: myMembers.filter((m) => m.status === 'approved').length, icon: Users, color: 'from-brand-500 to-brand-700', bg: 'bg-brand-50', text: 'text-brand-700' },
    { label: '举办活动', value: myActivities.length, icon: CalendarDays, color: 'from-accent-500 to-accent-700', bg: 'bg-accent-50', text: 'text-accent-700' },
    { label: '经费余额', value: `¥${(income - expense).toLocaleString()}`, icon: Wallet, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: '待处理', value: pendingMembers + pendingActivities + pendingFinances, icon: Clock, color: 'from-rose-500 to-rose-700', bg: 'bg-rose-50', text: 'text-rose-700' },
  ];

  const quickActions = [
    { label: '发起新活动', icon: CalendarDays, to: '/leader/activities/new', color: 'from-brand-600 to-brand-800' },
    { label: '管理成员', icon: Users, to: '/leader/members', color: 'from-emerald-500 to-emerald-700' },
    { label: '录入收支', icon: Wallet, to: '/leader/finances', color: 'from-accent-500 to-accent-700' },
    { label: '查看官网', icon: ExternalLink, to: myClub ? `/club/${myClub.id}` : '#', color: 'from-purple-500 to-purple-700', external: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {myClub ? (
        <>
          <div className="card p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  欢迎回来，{currentUser?.name} 会长
                </div>
                <h1 className="text-3xl font-serif font-bold">{myClub.name}</h1>
                <p className="text-white/70 mt-1.5">{myClub.slogan}</p>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold">{myMembers.filter((m) => m.status === 'approved').length}</p>
                  <p className="text-xs text-white/60">认证成员</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">{myActivities.filter((a) => a.status === 'published' || a.status === 'ended').length}</p>
                  <p className="text-xs text-white/60">已办活动</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">¥{(income - expense).toLocaleString()}</p>
                  <p className="text-xs text-white/60">可用经费</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => a.external ? window.open(a.to, '_blank') : navigate(a.to)}
                className={`card p-5 flex items-center gap-4 hover:shadow-card-hover hover:-translate-y-1 ${a.color} text-white border-0`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <a.icon className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-base">{a.label}</p>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    立即前往 <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-brand-600" /> 近期活动
                </h3>
                <button onClick={() => navigate('/leader/activities')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  查看全部 →
                </button>
              </div>
              <div className="space-y-3">
                {myActivities.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs opacity-80">{a.startTime.slice(5, 7)}月</span>
                      <span className="text-lg font-bold leading-none">{a.startTime.slice(8, 10)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.startTime} · {a.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${a.status === 'published' ? 'badge-published' : a.status === 'approved' ? 'badge-approved' : a.status === 'pending' ? 'badge-pending' : a.status === 'ended' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                        {a.status === 'draft' ? '草稿' : a.status === 'pending' ? '待审批' : a.status === 'approved' ? '已批准' : a.status === 'published' ? '报名中' : '已结束'}
                      </span>
                      <span className="text-xs text-gray-500">{a.registeredCount}/{a.capacity}</span>
                    </div>
                  </div>
                ))}
                {myActivities.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无活动，快去创建第一个活动吧</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> 经费概览
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50">
                  <p className="text-xs text-emerald-600 font-medium">总收入</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">¥{income.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50">
                  <p className="text-xs text-rose-600 font-medium">总支出</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">¥{expense.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-50">
                  <p className="text-xs text-brand-600 font-medium">当前余额</p>
                  <p className="text-2xl font-bold text-brand-700 mt-1">¥{(income - expense).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => navigate('/leader/finances')} className="btn-primary w-full mt-5 !py-2.5 text-sm">
                <Wallet className="w-4 h-4" /> 管理经费
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> 新成员申请
                </h3>
                {pendingMembers > 0 && <span className="badge badge-pending">{pendingMembers} 人待审核</span>}
              </div>
              <div className="space-y-3">
                {myMembers.filter((m) => m.status === 'pending').slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                      {m.name.slice(-2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.studentId} · {m.phone}</p>
                    </div>
                    <span className="badge badge-pending">申请中</span>
                  </div>
                ))}
                {pendingMembers === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">暂无新成员申请</div>
                )}
              </div>
              {pendingMembers > 0 && (
                <button onClick={() => navigate('/leader/members')} className="btn-secondary w-full mt-4 !py-2 text-sm">处理申请 →</button>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-600" /> 社团信息概览
                </h3>
                <button onClick={() => navigate('/leader/club')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">编辑 →</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">社团类别</span>
                  <span className="text-sm font-medium text-gray-900">{myClub.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">成立时间</span>
                  <span className="text-sm font-medium text-gray-900">{myClub.createdAt}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">认证状态</span>
                  <span className={`badge ${myClub.status === 'approved' ? 'badge-approved' : myClub.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                    {myClub.status === 'approved' ? '已认证' : myClub.status === 'pending' ? '待认证' : '已驳回'}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{myClub.description}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-brand-100 rounded-3xl flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">您尚未创建或负责任何社团</h3>
          <p className="text-gray-500 mb-6">请联系校团委申请创建新社团，或等待已有社团负责人任命</p>
          <button onClick={() => navigate('/student/home')} className="btn-primary">
            浏览社团广场 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
