import { useState } from 'react';
import { Search, Check, X, Eye, Filter, Building2, User, FileText, Calendar } from 'lucide-react';
import { useStore } from '@/store';
import type { Club, ClubStatus } from '@/types';

export default function AdminClubs() {
  const clubs = useStore((s) => s.clubs);
  const approveClub = useStore((s) => s.approveClub);
  const rejectClub = useStore((s) => s.rejectClub);
  const [status, setStatus] = useState<ClubStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Club | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filtered = clubs.filter((c) => {
    if (status !== 'all' && c.status !== status) return false;
    if (keyword && !c.name.includes(keyword) && !c.leaderInfo.name.includes(keyword)) return false;
    return true;
  });

  const statusTab: { key: ClubStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: clubs.length },
    { key: 'pending', label: '待审批', count: clubs.filter((c) => c.status === 'pending').length },
    { key: 'approved', label: '已通过', count: clubs.filter((c) => c.status === 'approved').length },
    { key: 'rejected', label: '已驳回', count: clubs.filter((c) => c.status === 'rejected').length },
  ];

  const handleApprove = (id: string) => {
    approveClub(id);
    setSelected(null);
  };

  const handleReject = () => {
    if (selected && rejectReason.trim()) {
      rejectClub(selected.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelected(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {statusTab.map((tab) => (
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
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索社团名称或负责人..."
            className="input-field pl-10 w-72"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">社团信息</th>
                <th className="table-header">类别</th>
                <th className="table-header">负责人</th>
                <th className="table-header">申请时间</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{club.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{club.slogan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="badge bg-brand-50 text-brand-700">{club.category}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="text-gray-900">{club.leaderInfo.name}</p>
                      <p className="text-xs text-gray-500">{club.leaderInfo.studentId}</p>
                    </div>
                  </td>
                  <td className="table-cell text-gray-600">{club.createdAt}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      club.status === 'approved' ? 'badge-approved' :
                      club.status === 'pending' ? 'badge-pending' : 'badge-rejected'
                    }`}>
                      {club.status === 'approved' ? '已通过' : club.status === 'pending' ? '待审批' : '已驳回'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelected(club)} className="btn-ghost !px-3 !py-1.5 text-xs">
                        <Eye className="w-4 h-4" /> 查看
                      </button>
                      {club.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(club.id)} className="btn-success !px-3 !py-1.5 text-xs">
                            <Check className="w-4 h-4" /> 通过
                          </button>
                          <button onClick={() => { setSelected(club); setShowRejectModal(true); }} className="btn-danger !px-3 !py-1.5 text-xs">
                            <X className="w-4 h-4" /> 驳回
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>暂无符合条件的社团</p>
          </div>
        )}
      </div>

      {selected && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="btn-ghost !p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selected.slogan}</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Building2 className="w-3 h-3" /> 社团类别</label>
                  <p className="mt-1 text-gray-900">{selected.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> 申请时间</label>
                  <p className="mt-1 text-gray-900">{selected.createdAt}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><User className="w-3 h-3" /> 负责人</label>
                  <p className="mt-1 text-gray-900">{selected.leaderInfo.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">学号 / 电话</label>
                  <p className="mt-1 text-gray-900">{selected.leaderInfo.studentId} / {selected.leaderInfo.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> 社团简介</label>
                <p className="mt-1.5 text-gray-700 leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> 社团章程</label>
                <div className="mt-1.5 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                  {selected.constitution}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> 年度活动计划</label>
                <p className="mt-1.5 text-gray-700 leading-relaxed">{selected.activityPlan}</p>
              </div>
              {selected.rejectReason && (
                <div className="p-4 bg-rose-50 rounded-xl">
                  <label className="text-xs font-semibold text-rose-600 uppercase">驳回原因</label>
                  <p className="mt-1 text-rose-700">{selected.rejectReason}</p>
                </div>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={() => { setShowRejectModal(true); }} className="btn-danger">
                  <X className="w-4 h-4" /> 驳回申请
                </button>
                <button onClick={() => handleApprove(selected.id)} className="btn-primary">
                  <Check className="w-4 h-4" /> 批准注册
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">驳回社团申请</h3>
            <label className="label">请输入驳回原因</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="请说明驳回原因..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="btn-secondary">取消</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="btn-danger">确认驳回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
