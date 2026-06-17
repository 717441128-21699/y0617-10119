import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, Plus, FileText, X, CalendarDays, Tag, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useStore } from '@/store';
import type { FinanceType, FinanceCategory } from '@/types';

const incomeCategories: FinanceCategory[] = ['会费收入', '赞助收入', '学校拨款', '其他'];
const expenseCategories: FinanceCategory[] = ['场地费', '物料费', '餐饮费', '奖品费', '宣传费', '其他'];

export default function LeaderFinances() {
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const activities = useStore((s) => s.activities);
  const getFinancesByClub = useStore((s) => s.getFinancesByClub);
  const addFinanceRecord = useStore((s) => s.addFinanceRecord);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const myFinances = useMemo(
    () => (myClub ? getFinancesByClub(myClub.id) : []),
    [myClub, getFinancesByClub]
  );
  const myActivities = myClub ? activities.filter((a) => a.clubId === myClub.id) : [];

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<FinanceType>('expense');
  const [category, setCategory] = useState<FinanceCategory>('其他');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [activityId, setActivityId] = useState('');

  const totalIncome = useMemo(
    () => myFinances.filter((f) => f.type === 'income' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0),
    [myFinances]
  );
  const totalExpense = useMemo(
    () => myFinances.filter((f) => f.type === 'expense' && f.reviewStatus === 'approved').reduce((s, f) => s + f.amount, 0),
    [myFinances]
  );
  const pendingCount = useMemo(() => myFinances.filter((f) => f.reviewStatus === 'pending').length, [myFinances]);
  const balance = totalIncome - totalExpense;

  const categoryStats = useMemo(() => {
    const stats: Record<string, { income: number; expense: number }> = {};
    myFinances.forEach((f) => {
      if (f.reviewStatus !== 'approved') return;
      if (!stats[f.category]) stats[f.category] = { income: 0, expense: 0 };
      if (f.type === 'income') stats[f.category].income += f.amount;
      else stats[f.category].expense += f.amount;
    });
    return stats;
  }, [myFinances]);

  const resetForm = () => {
    setType('expense');
    setCategory('其他');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setActivityId('');
  };

  const handleSubmit = () => {
    if (!myClub || !amount || parseFloat(amount) <= 0 || !description.trim()) return;
    addFinanceRecord({
      clubId: myClub.id,
      activityId: activityId || undefined,
      type,
      category,
      amount: parseFloat(amount),
      description: description.trim(),
      date,
    });
    setShowModal(false);
    resetForm();
  };

  const handleGenerateReport = () => {
    const lines = [
      `${myClub?.name || '社团'} 财务报表`,
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      '',
      `总收入：¥${totalIncome.toLocaleString()}`,
      `总支出：¥${totalExpense.toLocaleString()}`,
      `当前余额：¥${balance.toLocaleString()}`,
      '',
      '分类明细：',
      ...Object.entries(categoryStats).map(([cat, s]) => {
        const parts = [];
        if (s.income > 0) parts.push(`收入 ¥${s.income.toLocaleString()}`);
        if (s.expense > 0) parts.push(`支出 ¥${s.expense.toLocaleString()}`);
        return `  ${cat}：${parts.join(' / ') || '无'}`;
      }),
      '',
      '收支记录：',
      ...myFinances.map((f) => `  [${f.date}] ${f.type === 'income' ? '+' : '-'}¥${f.amount} ${f.category} - ${f.description} (${f.reviewStatus === 'approved' ? '已通过' : f.reviewStatus === 'pending' ? '待审核' : '已驳回'})`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${myClub?.name || '社团'}_财务报表_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-brand-100">当前余额</p>
              <p className="text-3xl font-bold mt-1">¥{balance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-100">待审核</p>
              <p className="text-3xl font-bold mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="section-title !mb-0">
          <Wallet className="w-5 h-5 text-brand-600" /> 收支记录
        </h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> 新增记录
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">日期</th>
                <th className="table-header">类型</th>
                <th className="table-header">分类</th>
                <th className="table-header">金额</th>
                <th className="table-header">说明</th>
                <th className="table-header">审核状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myFinances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无收支记录</p>
                  </td>
                </tr>
              ) : (
                myFinances.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="table-cell text-gray-600">{f.date}</td>
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
                      {f.reviewStatus === 'rejected' && f.rejectReason && (
                        <p className="text-xs text-rose-500 mt-1">原因：{f.rejectReason}</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title !mb-0">
            <FileText className="w-5 h-5 text-brand-600" /> 财务报表
          </h3>
          <button onClick={handleGenerateReport} className="btn-accent">
            <Download className="w-4 h-4" /> 生成报表
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-emerald-50">
            <p className="text-xs text-emerald-600 font-medium">总收入汇总</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">¥{totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-50">
            <p className="text-xs text-rose-600 font-medium">总支出汇总</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">¥{totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-brand-50">
            <p className="text-xs text-brand-600 font-medium">结余</p>
            <p className="text-2xl font-bold text-brand-700 mt-1">¥{balance.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">分类统计</h4>
          <div className="space-y-2">
            {Object.entries(categoryStats).length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">暂无已审核的记录</p>
            ) : (
              Object.entries(categoryStats).map(([cat, s]) => (
                <div key={cat} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{cat}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {s.income > 0 && (
                      <span className="text-emerald-600 font-medium">
                        收入 +¥{s.income.toLocaleString()}
                      </span>
                    )}
                    {s.expense > 0 && (
                      <span className="text-rose-600 font-medium">
                        支出 -¥{s.expense.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-brand-600" /> 新增收支记录
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-ghost !p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setType('income'); setCategory('会费收入'); }}
                    className={`py-2.5 rounded-xl font-medium transition-all ${
                      type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" /> 收入
                  </button>
                  <button
                    onClick={() => { setType('expense'); setCategory('物料费'); }}
                    className={`py-2.5 rounded-xl font-medium transition-all ${
                      type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 inline mr-1" /> 支出
                  </button>
                </div>
              </div>

              <div>
                <label className="label">分类</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as FinanceCategory)} className="input-field">
                  {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">金额 (¥)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入金额"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  <CalendarDays className="w-4 h-4 inline mr-1" /> 日期
                </label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="label">关联活动（可选）</label>
                <select value={activityId} onChange={(e) => setActivityId(e.target.value)} className="input-field">
                  <option value="">不关联活动</option>
                  {myActivities.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">描述说明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="请详细说明收支用途..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            {(!amount || parseFloat(amount) <= 0 || !description.trim()) && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>请填写金额（大于 0）和描述说明</span>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">取消</button>
              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || !description.trim()}
                className="btn-primary"
              >
                <CheckCircle className="w-4 h-4" /> 提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
