import { useState, useMemo } from 'react';
import { Search, Check, X, Eye, MapPin, Wallet, Calendar, Users, Clock, MessageSquare, LayoutGrid, List, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import type { Activity, ActivityStatus } from '@/types';

export default function AdminActivities() {
  const activities = useStore((s) => s.activities);
  const clubs = useStore((s) => s.clubs);
  const reviewActivity = useStore((s) => s.reviewActivity);
  const [status, setStatus] = useState<ActivityStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Activity | null>(null);
  const [venueApproval, setVenueApproval] = useState<'approved' | 'rejected'>('approved');
  const [budgetApproval, setBudgetApproval] = useState<'approved' | 'rejected'>('approved');
  const [venueReason, setVenueReason] = useState('');
  const [budgetReason, setBudgetReason] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'venue'>('list');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const nonDraftActivities = activities.filter((a) => a.status !== 'draft');

  const filtered = nonDraftActivities.filter((a) => {
    if (status !== 'all' && a.status !== status) return false;
    if (keyword && !a.title.includes(keyword)) return false;
    return true;
  });

  const venues = useMemo(() => {
    const set = new Set<string>();
    nonDraftActivities.forEach((a) => {
      if (a.venueApplication?.venue) {
        set.add(a.venueApplication.venue);
      }
    });
    return Array.from(set).sort();
  }, [nonDraftActivities]);

  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [startDate]);

  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = weekdays[d.getDay()];
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateStr === today;
    return { month, day, weekday, isToday };
  };

  const getActivitiesForVenueAndDate = (venue: string, dateStr: string) => {
    return filtered.filter((a) => {
      if (a.venueApplication?.venue !== venue) return false;
      const activityDate = a.startTime.split(' ')[0];
      return activityDate === dateStr;
    });
  };

  const getConflictingActivities = (activity: Activity) => {
    const activityDate = activity.startTime.split(' ')[0];
    return activities.filter((a) => {
      if (a.id === activity.id) return false;
      if (a.venueApplication?.venue !== activity.venueApplication?.venue) return false;
      const aDate = a.startTime.split(' ')[0];
      if (aDate !== activityDate) return false;
      if (a.venueApplication?.timeSlot !== activity.venueApplication?.timeSlot) return false;
      return a.status === 'approved' || a.status === 'pending';
    });
  };

  const getClubName = (clubId: string) => clubs.find((c) => c.id === clubId)?.name || '-';

  const tabs: { key: ActivityStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: nonDraftActivities.length },
    { key: 'pending', label: '待审批', count: nonDraftActivities.filter((a) => a.status === 'pending').length },
    { key: 'approved', label: '已批准', count: nonDraftActivities.filter((a) => a.status === 'approved').length },
    { key: 'rejected', label: '已驳回', count: nonDraftActivities.filter((a) => a.status === 'rejected').length },
    { key: 'published', label: '已发布', count: nonDraftActivities.filter((a) => a.status === 'published').length },
    { key: 'ended', label: '已结束', count: nonDraftActivities.filter((a) => a.status === 'ended').length },
  ];

  const handleReview = () => {
    if (!selected) return;
    if (venueApproval === 'rejected' && !venueReason.trim()) {
      alert('请填写场地审批驳回意见');
      return;
    }
    if (budgetApproval === 'rejected' && !budgetReason.trim()) {
      alert('请填写经费审批驳回意见');
      return;
    }
    reviewActivity(selected.id, venueApproval, venueReason, budgetApproval, budgetReason);
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

  const getActivityCardBgClass = (s: string) => {
    switch (s) {
      case 'approved':
      case 'published':
      case 'ended':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'pending':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'rejected':
        return 'bg-gray-100 border-gray-200 hover:bg-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'approved':
      case 'published':
      case 'ended':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'rejected':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    setStartDate(d.toISOString().split('T')[0]);
  };

  const conflictingActivities = selected ? getConflictingActivities(selected) : [];

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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索活动..." className="input-field pl-10 w-64" />
          </div>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              列表
            </button>
            <button
              onClick={() => setViewMode('venue')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'venue'
                  ? 'bg-brand-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              场地视图
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' && (
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
                        {a.venueApplication.status === 'rejected' && a.venueApplication.rejectReason && (
                          <p className="text-xs text-red-500 flex items-center gap-1" title={a.venueApplication.rejectReason}>
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{a.venueApplication.rejectReason}</span>
                          </p>
                        )}
                        {a.venueApplication.status === 'approved' && a.venueApplication.reviewComment && (
                          <p className="text-xs text-green-600 flex items-center gap-1" title={a.venueApplication.reviewComment}>
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{a.venueApplication.reviewComment}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <span className={`badge ${getStatusBadgeClass(a.budgetApplication.status)}`}>
                          ¥{a.budgetApplication.total}
                        </span>
                        {a.budgetApplication.status === 'rejected' && a.budgetApplication.rejectReason && (
                          <p className="text-xs text-red-500 flex items-center gap-1" title={a.budgetApplication.rejectReason}>
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{a.budgetApplication.rejectReason}</span>
                          </p>
                        )}
                        {a.budgetApplication.status === 'approved' && a.budgetApplication.reviewComment && (
                          <p className="text-xs text-green-600 flex items-center gap-1" title={a.budgetApplication.reviewComment}>
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{a.budgetApplication.reviewComment}</span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {viewMode === 'venue' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftDate(-7)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="font-medium text-gray-700">
                  {dateRange[0]} ~ {dateRange[6]}
                </span>
              </div>
              <button
                onClick={() => shiftDate(7)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setStartDate(today.toISOString().split('T')[0]);
                }}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                今天
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-gray-600">已通过</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                <span className="text-gray-600">待审批</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-400"></span>
                <span className="text-gray-600">已驳回</span>
              </div>
            </div>
          </div>

          {venues.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无场地数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex border-b border-gray-200">
                  <div className="w-32 flex-shrink-0 p-3 bg-gray-50/70 border-r border-gray-200">
                    <span className="text-xs font-semibold text-gray-500">日期 \ 场地</span>
                  </div>
                  {venues.map((venue) => (
                    <div key={venue} className="flex-1 min-w-[200px] p-3 bg-gray-50/70 border-r border-gray-200 last:border-r-0">
                      <p className="text-sm font-semibold text-gray-700 truncate" title={venue}>
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
                        {venue}
                      </p>
                    </div>
                  ))}
                </div>

                {dateRange.map((dateStr) => {
                  const { month, day, weekday, isToday } = getDateLabel(dateStr);
                  return (
                    <div key={dateStr} className="flex border-b border-gray-100 last:border-b-0">
                      <div className="w-32 flex-shrink-0 p-3 border-r border-gray-100 bg-gray-50/30">
                        <div className={`text-center ${isToday ? 'text-brand-700' : 'text-gray-700'}`}>
                          <p className="text-xs font-medium">{month}月{day}日</p>
                          <p className={`text-xs mt-0.5 ${isToday ? 'font-semibold' : 'text-gray-400'}`}>
                            {weekday}
                            {isToday && <span className="ml-1 text-brand-600">今天</span>}
                          </p>
                        </div>
                      </div>
                      {venues.map((venue) => {
                        const dayActivities = getActivitiesForVenueAndDate(venue, dateStr);
                        return (
                          <div key={venue} className="flex-1 min-w-[200px] p-2 border-r border-gray-100 last:border-r-0 min-h-[100px]">
                            {dayActivities.length === 0 ? (
                              <div className="h-full min-h-[80px] flex items-center justify-center">
                                <span className="text-xs text-gray-300">—</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {dayActivities.map((a) => (
                                  <button
                                    key={a.id}
                                    onClick={() => openDetail(a)}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${getActivityCardBgClass(a.status)}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">
                                        {a.title}
                                      </p>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${getActivityStatusBadgeClass(a.status)}`}>
                                        {getStatusText(a.status)}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{a.venueApplication.timeSlot}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

            {conflictingActivities.length > 0 && (
              <div className="mx-6 mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">
                      ⚠️ 场地时段冲突：已有 {conflictingActivities.length} 个活动使用了该场地
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {conflictingActivities.map((ca) => (
                        <div key={ca.id} className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-3 py-2">
                          <span className="text-gray-700 font-medium">{ca.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-white ${getActivityStatusBadgeClass(ca.status)}`}>
                            {getStatusText(ca.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                {selected.venueApplication.status === 'rejected' && selected.venueApplication.rejectReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 驳回原因
                    </p>
                    <p className="text-xs text-red-600 mt-1">{selected.venueApplication.rejectReason}</p>
                  </div>
                )}

                {selected.venueApplication.status === 'approved' && selected.venueApplication.reviewComment && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 审批意见
                    </p>
                    <p className="text-xs text-green-600 mt-1">{selected.venueApplication.reviewComment}</p>
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

                {selected.budgetApplication.status === 'rejected' && selected.budgetApplication.rejectReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 驳回原因
                    </p>
                    <p className="text-xs text-red-600 mt-1">{selected.budgetApplication.rejectReason}</p>
                  </div>
                )}

                {selected.budgetApplication.status === 'approved' && selected.budgetApplication.reviewComment && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 审批意见
                    </p>
                    <p className="text-xs text-green-600 mt-1">{selected.budgetApplication.reviewComment}</p>
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
                <button onClick={handleReview} className="btn-primary">
                  <Check className="w-4 h-4" /> 提交审批结果
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
