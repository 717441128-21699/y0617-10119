import { Building2, Users, CalendarDays, Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

export default function AdminDashboard() {
  const clubs = useStore((s) => s.clubs);
  const activities = useStore((s) => s.activities);
  const finances = useStore((s) => s.finances);
  const members = useStore((s) => s.members);

  const pendingClubs = clubs.filter((c) => c.status === 'pending').length;
  const approvedClubs = clubs.filter((c) => c.status === 'approved').length;
  const pendingActivities = activities.filter((a) => a.status === 'pending').length;
  const pendingFinances = finances.filter((f) => f.reviewStatus === 'pending').length;

  const activityTrend = [
    { month: '1月', count: 8, budget: 12000 },
    { month: '2月', count: 5, budget: 8000 },
    { month: '3月', count: 12, budget: 18000 },
    { month: '4月', count: 15, budget: 22000 },
    { month: '5月', count: 18, budget: 28000 },
    { month: '6月', count: 14, budget: 20000 },
  ];

  const categoryData = [
    { name: '科技类', value: clubs.filter((c) => c.category === '科技类').length, color: '#5c7cfa' },
    { name: '文艺类', value: clubs.filter((c) => c.category === '文艺类').length, color: '#f97316' },
    { name: '体育类', value: clubs.filter((c) => c.category === '体育类').length, color: '#10b981' },
    { name: '学术类', value: clubs.filter((c) => c.category === '学术类').length, color: '#8b5cf6' },
    { name: '公益类', value: clubs.filter((c) => c.category === '公益类').length, color: '#f43f5e' },
    { name: '其他', value: clubs.filter((c) => c.category === '其他').length, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: '注册社团总数', value: clubs.length, icon: Building2, color: 'from-brand-500 to-brand-700', bg: 'bg-brand-50', text: 'text-brand-700' },
    { label: '已认证成员数', value: members.filter((m) => m.status === 'approved').length, icon: Users, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: '本学期活动数', value: activities.length, icon: CalendarDays, color: 'from-accent-500 to-accent-700', bg: 'bg-accent-50', text: 'text-accent-700' },
    { label: '待审批事项', value: pendingClubs + pendingActivities + pendingFinances, icon: Clock, color: 'from-rose-500 to-rose-700', bg: 'bg-rose-50', text: 'text-rose-700' },
  ];

  const recentApprovals = [
    ...clubs.filter((c) => c.status === 'pending').map((c) => ({ type: '社团注册', name: c.name, time: c.createdAt, icon: Building2, status: 'pending' })),
    ...activities.filter((a) => a.status === 'pending').map((a) => ({ type: '活动申请', name: a.title, time: a.createdAt, icon: CalendarDays, status: 'pending' })),
    ...finances.filter((f) => f.reviewStatus === 'pending').slice(0, 3).map((f) => ({ type: '经费报销', name: f.description, time: f.date, icon: Wallet, status: 'pending' })),
  ].slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="stat-card bg-white border border-gray-100" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-5 rounded-bl-full`} />
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-6 h-6 ${s.text}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              活动数量与经费趋势
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" name="活动数" stroke="#1e3a8a" strokeWidth={3} dot={{ fill: '#1e3a8a', strokeWidth: 2, r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="budget" name="经费(元)" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-5">社团类别分布</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                {c.name} ({c.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            待审批事项
          </h3>
          {recentApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
              <p>暂无待审批事项</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApprovals.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type} · {item.time}</p>
                  </div>
                  <span className="badge badge-pending">待审核</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">各社团成员数量 TOP</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubs.filter((c) => c.status === 'approved').sort((a, b) => b.memberCount - a.memberCount).slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="memberCount" name="成员数" fill="#1e3a8a" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
