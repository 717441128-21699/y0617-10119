import { useState } from 'react';
import { Building2, Save, User, FileText, Calendar, Check } from 'lucide-react';
import { useStore } from '@/store';

export default function LeaderClub() {
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const updateClub = useStore((s) => s.updateClub);
  const [saved, setSaved] = useState(false);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const [form, setForm] = useState({
    name: myClub?.name || '',
    slogan: myClub?.slogan || '',
    description: myClub?.description || '',
    constitution: myClub?.constitution || '',
    activityPlan: myClub?.activityPlan || '',
    category: myClub?.category || '科技类',
  });

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  const handleSave = () => {
    updateClub(myClub.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title mb-0">
            <Building2 className="w-6 h-6 text-brand-600" /> 社团信息维护
          </h2>
          <p className="text-sm text-gray-500 mt-1">更新社团信息，对外展示在社团官网主页</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" /> {saved ? '已保存 ✓' : '保存修改'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" /> 基本信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">社团名称</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">社团类别</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className="input-field">
                {['科技类', '文艺类', '体育类', '学术类', '公益类', '其他'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">社团口号 / Slogan</label>
              <input value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} className="input-field" placeholder="一句话介绍社团..." />
            </div>
            <div className="md:col-span-2">
              <label className="label">社团简介</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" placeholder="详细介绍社团的宗旨、特色活动等..." />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" /> 负责人信息
          </h3>
          <div className="space-y-3">
            <div>
              <label className="label">姓名</label>
              <div className="input-field bg-gray-50 text-gray-600">{myClub.leaderInfo.name}</div>
            </div>
            <div>
              <label className="label">学号</label>
              <div className="input-field bg-gray-50 text-gray-600">{myClub.leaderInfo.studentId}</div>
            </div>
            <div>
              <label className="label">联系电话</label>
              <div className="input-field bg-gray-50 text-gray-600">{myClub.leaderInfo.phone}</div>
            </div>
            <p className="text-xs text-gray-400">如需修改负责人信息，请联系校团委</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-500" /> 认证状态
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${myClub.status === 'approved' ? 'bg-emerald-100' : myClub.status === 'pending' ? 'bg-amber-100' : 'bg-rose-100'}`}>
                <Check className={`w-6 h-6 ${myClub.status === 'approved' ? 'text-emerald-600' : myClub.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}`} />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {myClub.status === 'approved' ? '已认证' : myClub.status === 'pending' ? '待审核' : '已驳回'}
                </p>
                <p className="text-xs text-gray-500">
                  申请时间：{myClub.createdAt}
                  {myClub.approvedAt && ` · 通过时间：${myClub.approvedAt}`}
                </p>
              </div>
            </div>
            {myClub.rejectReason && (
              <div className="p-3 bg-rose-50 rounded-xl text-sm text-rose-700">
                驳回原因：{myClub.rejectReason}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" /> 社团章程
          </h3>
          <textarea value={form.constitution} onChange={(e) => setForm({ ...form, constitution: e.target.value })} rows={8} className="input-field resize-none font-mono text-sm" />
        </div>

        <div className="card p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> 年度活动计划
          </h3>
          <textarea value={form.activityPlan} onChange={(e) => setForm({ ...form, activityPlan: e.target.value })} rows={5} className="input-field resize-none" placeholder="描述本社团本学期/学年的活动规划..." />
        </div>
      </div>
    </div>
  );
}
