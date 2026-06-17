import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  CalendarDays,
  MapPin,
  Users,
  FileText,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useStore } from '@/store';

interface BudgetItem {
  name: string;
  amount: number;
  remark: string;
}

export default function ActivityNew() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const createActivity = useStore((s) => s.createActivity);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);

  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    location: '', capacity: 50, venueName: '', venueTimeSlot: '',
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([{ name: '', amount: 0, remark: '' }]);

  const totalBudget = useMemo(
    () => budgetItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [budgetItems]
  );

  const updateBudget = (idx: number, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addBudget = () => setBudgetItems((prev) => [...prev, { name: '', amount: 0, remark: '' }]);
  const removeBudget = (idx: number) => {
    if (budgetItems.length <= 1) return;
    setBudgetItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildData = (status: 'draft' | 'pending') => ({
    clubId: myClub?.id || '',
    title: form.title, description: form.description,
    startTime: form.startTime, endTime: form.endTime,
    location: form.location, capacity: form.capacity, status,
    venueApplication: { venue: form.venueName, timeSlot: form.venueTimeSlot, status: 'pending' as const },
    budgetApplication: {
      total: totalBudget,
      items: budgetItems.filter((i) => i.name.trim()).map((i) => ({ name: i.name, amount: Number(i.amount), remark: i.remark })),
      status: 'pending' as const,
    },
  });

  const handleSubmit = (status: 'draft' | 'pending') => {
    if (!form.title.trim()) { alert('请填写活动标题'); return; }
    if (status === 'pending') {
      if (!form.startTime || !form.endTime) { alert('请选择活动时间'); return; }
      if (!form.location.trim()) { alert('请填写活动地点'); return; }
    }
    createActivity(buildData(status));
    navigate('/leader/activities');
  };

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/leader/activities')} className="btn-ghost !px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">发起新活动</h2>
            <p className="text-sm text-gray-500 mt-1">填写活动信息，提交校团委审批</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSubmit('draft')} className="btn-secondary">
            <Save className="w-4 h-4" /> 保存草稿
          </button>
          <button onClick={() => handleSubmit('pending')} className="btn-primary">
            <Send className="w-4 h-4" /> 提交审批
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title"><FileText className="w-5 h-5 text-brand-600" /> 基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">活动标题 *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="请输入活动标题" />
          </div>
          <div className="md:col-span-2">
            <label className="label">活动描述</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" placeholder="请详细描述活动内容、目的、形式等..." />
          </div>
          <div>
            <label className="label flex items-center gap-1"><CalendarDays className="w-4 h-4" /> 开始时间 *</label>
            <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><CalendarDays className="w-4 h-4" /> 结束时间 *</label>
            <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><MapPin className="w-4 h-4" /> 活动地点 *</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="如：大学生活动中心301" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Users className="w-4 h-4" /> 人数上限</label>
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title"><Building2 className="w-5 h-5 text-brand-600" /> 场地申请</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">场地名称</label>
            <input value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} className="input-field" placeholder="如：学术报告厅" />
          </div>
          <div>
            <label className="label">使用时段</label>
            <input value={form.venueTimeSlot} onChange={(e) => setForm({ ...form, venueTimeSlot: e.target.value })} className="input-field" placeholder="如：14:00 - 17:00" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0"><DollarSign className="w-5 h-5 text-accent-500" /> 经费预算</h3>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">预算总额</p>
              <p className="text-xl font-bold text-accent-600">¥{totalBudget}</p>
            </div>
            <button onClick={addBudget} className="btn-secondary !px-4 !py-2">
              <Plus className="w-4 h-4" /> 添加
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {budgetItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-4">
                <input value={item.name} onChange={(e) => updateBudget(idx, 'name', e.target.value)} className="input-field" placeholder="项目名称" />
              </div>
              <div className="col-span-2">
                <input type="number" min={0} value={item.amount || ''} onChange={(e) => updateBudget(idx, 'amount', e.target.value)} className="input-field" placeholder="金额" />
              </div>
              <div className="col-span-5">
                <input value={item.remark} onChange={(e) => updateBudget(idx, 'remark', e.target.value)} className="input-field" placeholder="备注（可选）" />
              </div>
              <div className="col-span-1 flex justify-center">
                <button onClick={() => removeBudget(idx)} disabled={budgetItems.length <= 1} className="btn-ghost !px-2 !py-2 text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
