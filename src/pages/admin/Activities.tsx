import { useState } from 'react';
import { Search, Check, X, Eye, MapPin, Wallet, Calendar, Users, Clock, MessageSquare } from 'lucide-react';
import { useStore } from '@/store';
import type { Activity, ActivityStatus } from '@/types';

export default function AdminActivities() {
  const activities = useStore((s) => s.activities);
  const clubs = useStore((s) => s.clubs);
  const approveActivity = useStore((s) => s.approveActivity);
  const rejectActivity = useStore((s) => s.rejectActivity);
  const [status, setStatus] = useState<ActivityStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Activity | null>(null);
  const [venueApproval, setVenueApproval] = useState<'approved' | 'rejected'>('approved');
  const [budgetApproval, setBudgetApproval] = useState<'approved' | 'rejected'>('approved');
  const [venueReason, setVenueReason] = useState('');
  const [budgetReason, setBudgetReason] = useState('');

  const filtered = activities.filter((a) => {
    if (status !== 'all' && a.status !== status) return false;
    if (keyword && !a.title.includes(keyword)) return false;
    return true;
  });

  const getClubName = (clubId: string) => clubs.find((c) => c.id === clubId)?.name || '-';

  const tabs: { key: ActivityStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: activities.length },
    { key: 'pending', label: '待审批', count: activities.filter((a) => a.status === 'pending').length },
    { key: 'approved', label: '已批准', count: activities.filter((a) => a.status === 'approved').length },
    { key: 'rejected', label: '已驳回', count: activities.filter((a) => a.status === 'rejected').length },
    { key: 'published', label: '已发布', count: activities.filter((a) => a.status === 'published').length },
    { key: 'ended', label: '已结束', count: activities.filter((a) => a.status === 'ended').length },
  ];

  const handleApprove = (id: string) => {
    approveActivity(id);
    setSelected(null);
  };

  const handleReject = (id: string) => {
    rejectActivity(id, venueReason, budgetReason);
    setSelected(null);
    setVenueReason('');
    setBudgetReason('');
    setVenueApproval('approved');
    setBudgetApproval('approved');
  };

  const openDetail = (activity: Activity) => {
    setSelected(activity);
    setVenueReason('');
    setBudgetReason('');
    setVenueApproval('approved');
    setBudgetApproval('approved');
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved':
        return 'badge-approved';
      case 'pending':
        return 'badge-pending';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '待审批';
      case 'rejected':
        return '已驳回';
      default:
        return s;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                status === tab.key
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索活动..." className="input-field pl-10 w-64" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">活动名称</th>
                <th className="table-header">所属社团</th>
                <th className="table-header">时间 / 地点</th>
                <th className="table-header">场地审批</th>
                <th className="table-header">经费审批</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="table-cell">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> {a.registeredCount}/{a.capacity} 人
                    </p>
                  </td>
                  <td className="table-cell text-gray-700">{getClubName(a.clubId)}</td>
                  <td className="table-cell">
                    <p className="flex items-center gap-1 text-gray-700 text-sm"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {a.startTime}</p>
                    <p className="flex items-center gap-1 text-gray-500 text-xs mt-0.5"><MapPin className="w-3 h-3" /> {a.location}</p>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className={`badge ${getStatusBadgeClass(a.venueApplication.status)}`}>
                        {getStatusText(a.venueApplication.status)}
                      </span>
                      {a.venueApplication.rejectReason && (
                        <p className="text-xs text-gray-400 flex items-center gap-1" title={a.venueApplication.rejectReason}>
                          <MessageSquare className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{a.venueApplication.rejectReason}</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className={`badge ${getStatusBadgeClass(a.budgetApplication.status)}`}>
                        ¥{a.budgetApplication.total}
                      </span>
                      {a.budgetApplication.rejectReason && (
                        <p className="text-xs text-gray-400 flex items-center gap-1" title={a.budgetApplication.rejectReason}>
                          <MessageSquare className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{a.budgetApplication.rejectReason}</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      a.status === 'approved' ? 'badge-approved' :
                      a.status === 'pending' ? 'badge-pending' :
                      a.status === 'published' ? 'badge-published' :
                      a.status === 'rejected' ? 'badge-rejected' :
                      a.status === 'ended' ? 'bg-gray-100 text-gray-600' : 'badge-rejected'
                    }`}>
                      {a.status === 'draft' ? '草稿' : a.status === 'pending' ? '待审批' : a.status === 'approved' ? '已批准' : a.status === 'published' ? '已发布' : a.status === 'rejected' ? '已驳回' : '已结束'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDetail(a)} className="btn-ghost !px-3 !py-1.5 text-xs"><Eye className="w-4 h-4" /> 详情</button>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(a.id)} className="btn-success !px-3 !py-1.5 text-xs"><Check className="w-4 h-4" /> 通过</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selected.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{getClubName(selected.clubId)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost !p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> 开始时间</label>
                  <p className="mt-1 text-gray-900">{selected.startTime}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> 结束时间</label>
                  <p className="mt-1 text-gray-900">{selected.endTime}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> 活动地点</label>
                  <p className="mt-1 text-gray-900">{selected.location}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Users className="w-3 h-3" /> 人数限制</label>
                  <p className="mt-1 text-gray-900">{selected.registeredCount} / {selected.capacity} 人</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">活动描述</label>
                <p className="mt-1.5 text-gray-700 leading-relaxed">{selected.description}</p>
              </div>

              <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-brand-700 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> 场地申请</label>
                  <span className={`badge ${getStatusBadgeClass(selected.venueApplication.status)}`}>
                    {getStatusText(selected.venueApplication.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{selected.venueApplication.venue}</p>
                <p className="text-xs text-gray-500 mt-1">时段：{selected.venueApplication.timeSlot}</p>

                {selected.venueApplication.rejectReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 驳回原因
                    </p>
                    <p className="text-xs text-red-600 mt-1">{selected.venueApplication.rejectReason}</p>
                  </div>
                )}

                {selected.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-brand-200 space-y-3">
                    <p className="text-xs font-semibold text-brand-700">审批结果</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="venueApproval"
                          value="approved"
                          checked={venueApproval === 'approved'}
                          onChange={() => setVenueApproval('approved')}
                          className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-sm text-gray-700">通过</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="venueApproval"
                          value="rejected"
                          checked={venueApproval === 'rejected'}
                          onChange={() => setVenueApproval('rejected')}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm text-gray-700">驳回</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> 审批意见
                      </label>
                      <textarea
                        value={venueReason}
                        onChange={(e) => setVenueReason(e.target.value)}
                        placeholder="请输入场地审批意见（驳回必填）..."
                        className="input-field !py-2 text-sm resize-none h-20"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-accent-50/50 rounded-xl border border-accent-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-accent-700 uppercase flex items-center gap-1"><Wallet className="w-3 h-3" /> 经费预算（总计 ¥{selected.budgetApplication.total}）</label>
                  <span className={`badge ${getStatusBadgeClass(selected.budgetApplication.status)}`}>
                    {getStatusText(selected.budgetApplication.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  {selected.budgetApplication.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{item.name}{item.remark && <span className="text-gray-400 text-xs ml-2">({item.remark})</span>}</span>
                      <span className="font-medium text-gray-900">¥{item.amount}</span>
                    </div>
                  ))}
                </div>

                {selected.budgetApplication.rejectReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 驳回原因
                    </p>
                    <p className="text-xs text-red-600 mt-1">{selected.budgetApplication.rejectReason}</p>
                  </div>
                )}

                {selected.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-accent-200 space-y-3">
                    <p className="text-xs font-semibold text-accent-700">审批结果</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="budgetApproval"
                          value="approved"
                          checked={budgetApproval === 'approved'}
                          onChange={() => setBudgetApproval('approved')}
                          className="w-4 h-4 text-accent-600"
                        />
                        <span className="text-sm text-gray-700">通过</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="budgetApproval"
                          value="rejected"
                          checked={budgetApproval === 'rejected'}
                          onChange={() => setBudgetApproval('rejected')}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm text-gray-700">驳回</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> 审批意见
                      </label>
                      <textarea
                        value={budgetReason}
                        onChange={(e) => setBudgetReason(e.target.value)}
                        placeholder="请输入经费审批意见（驳回必填）..."
                        className="input-field !py-2 text-sm resize-none h-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={() => setSelected(null)} className="btn-secondary">稍后处理</button>
                <button onClick={() => handleReject(selected.id)} className="btn-danger">
                  <X className="w-4 h-4" /> 驳回
                </button>
                <button onClick={() => handleApprove(selected.id)} className="btn-primary">
                  <Check className="w-4 h-4" /> 通过审批
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
