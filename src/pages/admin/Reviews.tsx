import { useState } from 'react';
import { Award, Star, Check, X, FileText, User } from 'lucide-react';
import { useStore } from '@/store';
import type { AnnualReport } from '@/types';

export default function AdminReviews() {
  const reports = useStore((s) => s.reports);
  const clubs = useStore((s) => s.clubs);
  const approveReport = useStore((s) => s.approveReport);
  const rejectReport = useStore((s) => s.rejectReport);
  const [selected, setSelected] = useState<AnnualReport | null>(null);
  const [score, setScore] = useState(85);
  const [comment, setComment] = useState('');

  const getClubName = (clubId: string) => clubs.find((c) => c.id === clubId)?.name || '-';
  const getClubLeader = (clubId: string) => clubs.find((c) => c.id === clubId)?.leaderInfo.name || '-';

  const handleApprove = () => {
    if (selected) {
      approveReport(selected.id, score, comment);
      setSelected(null);
      setScore(85);
      setComment('');
    }
  };

  const handleReject = () => {
    if (selected && comment.trim()) {
      rejectReport(selected.id, comment);
      setSelected(null);
      setComment('');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title mb-0">
            <Award className="w-6 h-6 text-accent-500" />
            学年社团评优 · 工作总结审核
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">待审核 <b className="text-amber-600">{reports.filter((r) => r.reviewStatus === 'pending').length}</b> 份</span>
            <span className="text-gray-500">已评分 <b className="text-brand-600">{reports.filter((r) => r.reviewStatus === 'approved').length}</b> 份</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-card transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{getClubName(r.clubId)}</h4>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> 负责人：{getClubLeader(r.clubId)} · {r.academicYear} 学年
                  </p>
                </div>
                <span className={`badge ${r.reviewStatus === 'approved' ? 'badge-approved' : r.reviewStatus === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                  {r.reviewStatus === 'approved' ? `已评分 ${r.score}分` : r.reviewStatus === 'pending' ? '待审核' : '已驳回'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">{r.summary}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">提交于 {r.submittedAt}</span>
                <button onClick={() => { setSelected(r); setScore(r.score || 85); setComment(r.reviewComment || ''); }} className="btn-primary !py-1.5 !px-4 text-sm">
                  <FileText className="w-4 h-4" /> {r.reviewStatus === 'pending' ? '开始评审' : '查看评审'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{getClubName(selected.clubId)} · 学年工作总结</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selected.academicYear} 学年 · 提交于 {selected.submittedAt}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost !p-2"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-brand-700 uppercase tracking-wide mb-2">工作概述</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">主要成果</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.achievements}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-2">存在问题</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.problems}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-accent-700 uppercase tracking-wide mb-2">下学年计划</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.nextPlan}</p>
              </div>

              {selected.reviewStatus !== 'pending' && (
                <div className={`p-5 rounded-2xl ${selected.reviewStatus === 'approved' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className={`w-5 h-5 ${selected.reviewStatus === 'approved' ? 'text-amber-500' : 'text-rose-500'}`} />
                    <span className={`font-bold ${selected.reviewStatus === 'approved' ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {selected.reviewStatus === 'approved' ? `评审结果：${selected.score} 分` : '评审结果：已驳回'}
                    </span>
                  </div>
                  <p className={`text-sm ${selected.reviewStatus === 'approved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    评审意见：{selected.reviewComment}
                  </p>
                </div>
              )}

              {selected.reviewStatus === 'pending' && (
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                  <div>
                    <label className="label flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> 评分（满分 100）
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={60}
                        max={100}
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="flex-1 accent-brand-600"
                      />
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                        {score}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>60 合格</span><span>75 良好</span><span>85 优秀</span><span>100 卓越</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">评审意见</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="input-field resize-none" placeholder="请输入评审意见..." />
                  </div>
                </div>
              )}
            </div>

            {selected.reviewStatus === 'pending' && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={handleReject} disabled={!comment.trim()} className="btn-danger">
                  <X className="w-4 h-4" /> 不予通过
                </button>
                <button onClick={handleApprove} disabled={!comment.trim()} className="btn-primary">
                  <Check className="w-4 h-4" /> 评分通过
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
