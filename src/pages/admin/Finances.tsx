import { useState } from 'react';
import { Search, Check, X, TrendingUp, TrendingDown, Filter, Wallet, FileText } from 'lucide-react';
import { useStore } from '@/store';
import type { FinanceRecord } from '@/types';

export default function AdminFinances() {
  const finances = useStore((s) => s.finances);
  const clubs = useStore((s) => s.clubs);
  const approveFinance = useStore((s) => s.approveFinance);
  const rejectFinance = useStore((s) => s.rejectFinance);
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selected, setSelected] = useState<FinanceRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filtered = finances.filter((f) => status === 'all' || f.reviewStatus === status);

  const totalIncome = finances.filter((f) => f.type === 'income' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter((f) => f.type === 'expense' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0);
  const pendingCount = finances.filter((f) => f.reviewStatus === 'pending').length;

  const getClubName = (clubId: string) => clubs.find((c) => c.id === clubId)?.name || '-';

  const handleApprove = (id: string) => approveFinance(id);
  const handleReject = () => {
    if (selected && rejectReason.trim()) {
      rejectFinance(selected.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelected(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">总收入</p>
              <p className="text-3xl font-bold mt-1">¥{totalIncome.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-100">总支出</p>
              <p className="text-3xl font-bold mt-1">¥{totalExpense.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-100">待审核记录</p>
              <p className="text-3xl font-bold mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                status === s ? 'bg-brand-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {s === 'all' ? '全部' : s === 'pending' ? '待审核' : s === 'approved' ? '已通过' : '已驳回'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="搜索..." className="input-field pl-10 w-56" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">日期</th>
                <th className="table-header">所属社团</th>
                <th className="table-header">类型</th>
                <th className="table-header">分类</th>
                <th className="table-header">金额</th>
                <th className="table-header">说明</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50">
                  <td className="table-cell text-gray-600">{f.date}</td>
                  <td className="table-cell text-gray-900 font-medium">{getClubName(f.clubId)}</td>
                  <td className="table-cell">
                    <span className={`badge ${f.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {f.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-700">{f.category}</td>
                  <td className={`table-cell font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.type === 'income' ? '+' : '-'}¥{f.amount.toLocaleString()}
                  </td>
                  <td className="table-cell text-gray-600 max-w-xs truncate">{f.description}</td>
                  <td className="table-cell">
                    <span className={`badge ${f.reviewStatus === 'approved' ? 'badge-approved' : f.reviewStatus === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                      {f.reviewStatus === 'approved' ? '已通过' : f.reviewStatus === 'pending' ? '待审核' : '已驳回'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    {f.reviewStatus === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(f.id)} className="btn-success !px-3 !py-1.5 text-xs"><Check className="w-4 h-4" /> 通过</button>
                        <button onClick={() => { setSelected(f); setShowRejectModal(true); }} className="btn-danger !px-3 !py-1.5 text-xs"><X className="w-4 h-4" /> 驳回</button>
                      </div>
                    )}
                    {f.reviewStatus !== 'pending' && (
                      <span className="text-xs text-gray-400">{f.reviewer || '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>暂无符合条件的财务记录</p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-rose-500" /> 驳回财务记录
            </h3>
            <label className="label">请输入驳回原因</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} className="input-field resize-none" placeholder="请说明驳回原因..." />
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
