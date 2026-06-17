import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, CalendarDays, MapPin, TrendingUp, Clock, CheckCircle, MoreHorizontal, Eye, Pencil, Send, RotateCcw, RefreshCw } from 'lucide-react';
import { useStore } from '@/store';
import type { ActivityStatus } from '@/types';

export default function LeaderActivities() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const activities = useStore((s) => s.activities);
  const [filter, setFilter] = useState<ActivityStatus | 'all'>('all');
  const publishActivity = useStore((s) => s.publishActivity);
  const endActivity = useStore((s) => s.endActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const resubmitActivity = useStore((s) => s.resubmitActivity);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const myActivities = myClub ? activities.filter((a) => a.clubId === myClub.id) : [];

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  const filtered = filter === 'all' ? myActivities : myActivities.filter((a) => a.status === filter);

  const statusLabels: Record<ActivityStatus | 'all', string> = {
    all: '全部', draft: '草稿', pending: '待审批', approved: '已批准', published: '报名中', rejected: '已驳回', ended: '已结束',
  };

  const tabOrder: (ActivityStatus | 'all')[] = ['all', 'draft', 'pending', 'approved', 'published', 'rejected', 'ended'];

  const counts = {
    all: myActivities.length,
    draft: myActivities.filter((a) => a.status === 'draft').length,
    pending: myActivities.filter((a) => a.status === 'pending').length,
    approved: myActivities.filter((a) => a.status === 'approved').length,
    published: myActivities.filter((a) => a.status === 'published').length,
    rejected: myActivities.filter((a) => a.status === 'rejected').length,
    ended: myActivities.filter((a) => a.status === 'ended').length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabOrder.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === s ? 'bg-brand-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {statusLabels[s]} <span className="ml-1 opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
        <button onClick={() => navigate('/leader/activities/new')} className="btn-primary">
          <Plus className="w-4 h-4" /> 发起新活动
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((a) => (
          <div key={a.id} className="card card-hover p-0 overflow-hidden group">
            {a.cover && (
              <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {a.startTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {a.location}</span>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${
                  a.status === 'published' ? 'badge-published' : a.status === 'approved' ? 'badge-approved' :
                  a.status === 'pending' ? 'badge-pending' : a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  a.status === 'ended' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {statusLabels[a.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">报名进度</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full" style={{ width: `${Math.min(100, (a.registeredCount / a.capacity) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{a.registeredCount}/{a.capacity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-brand-600" /> 经费 ¥{a.budgetApplication.total}</span>
                  <span className={`flex items-center gap-1 ${a.venueApplication.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}><Clock className="w-3.5 h-3.5" /> 场地{a.venueApplication.status === 'approved' ? '已批' : '待批'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {a.status === 'draft' && (
                    <>
                      <button onClick={() => navigate('/leader/activities/new')} className="btn-ghost !px-3 !py-1.5 text-xs"><Pencil className="w-4 h-4" /> 编辑</button>
                      <button onClick={() => updateActivity(a.id, { status: 'pending' })} className="btn-primary !px-3 !py-1.5 text-xs"><Send className="w-4 h-4" /> 提交审批</button>
                    </>
                  )}
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => navigate(`/leader/activities/${a.id}`)} className="btn-ghost !px-3 !py-1.5 text-xs"><Eye className="w-4 h-4" /> 详情</button>
                      <button onClick={() => updateActivity(a.id, { status: 'draft' })} className="btn-secondary !px-3 !py-1.5 text-xs"><RotateCcw className="w-4 h-4" /> 撤回</button>
                    </>
                  )}
                  {a.status === 'approved' && (
                    <>
                      <button onClick={() => navigate(`/leader/activities/${a.id}`)} className="btn-ghost !px-3 !py-1.5 text-xs"><Eye className="w-4 h-4" /> 详情</button>
                      <button onClick={() => publishActivity(a.id)} className="btn-success !px-3 !py-1.5 text-xs"><CheckCircle className="w-4 h-4" /> 发布活动</button>
                    </>
                  )}
                  {a.status === 'published' && (
                    <>
                      <button onClick={() => navigate(`/leader/activities/${a.id}`)} className="btn-ghost !px-3 !py-1.5 text-xs"><Eye className="w-4 h-4" /> 详情</button>
                      <button onClick={() => endActivity(a.id)} className="btn-secondary !px-3 !py-1.5 text-xs"><MoreHorizontal className="w-4 h-4" /> 结束活动</button>
                    </>
                  )}
                  {a.status === 'rejected' && (
                    <>
                      <button onClick={() => navigate(`/leader/activities/${a.id}`)} className="btn-ghost !px-3 !py-1.5 text-xs"><Pencil className="w-4 h-4" /> 编辑</button>
                      <button onClick={() => resubmitActivity(a.id)} className="btn-primary !px-3 !py-1.5 text-xs"><RefreshCw className="w-4 h-4" /> 重新提交</button>
                    </>
                  )}
                  {a.status === 'ended' && (
                    <button onClick={() => navigate(`/leader/activities/${a.id}`)} className="btn-ghost !px-3 !py-1.5 text-xs"><Eye className="w-4 h-4" /> 详情</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-16 text-center">
          <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">暂无活动</h3>
          <p className="text-gray-500 mb-5">点击右上角发起第一个活动吧</p>
          <button onClick={() => navigate('/leader/activities/new')} className="btn-primary"><Plus className="w-4 h-4" /> 发起活动</button>
        </div>
      )}
    </div>
  );
}
