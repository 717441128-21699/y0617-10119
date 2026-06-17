import { useState, useEffect } from 'react';
import { FileText, Calendar, Star, MessageSquare, Send, CheckCircle, AlertCircle, BookOpen, Award, AlertTriangle, Rocket, Clock } from 'lucide-react';
import { useStore } from '@/store';

const getAcademicYears = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentStart = month >= 8 ? year : year - 1;
  return [
    `${currentStart}-${currentStart + 1}`,
    `${currentStart - 1}-${currentStart}`,
    `${currentStart - 2}-${currentStart - 1}`,
  ];
};

export default function LeaderReport() {
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const submitReport = useStore((s) => s.submitReport);
  const getReportByClub = useStore((s) => s.getReportByClub);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const existingReport = myClub ? getReportByClub(myClub.id) : undefined;

  const [academicYear, setAcademicYear] = useState(getAcademicYears()[0]);
  const [summary, setSummary] = useState('');
  const [achievements, setAchievements] = useState('');
  const [problems, setProblems] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingReport && existingReport.academicYear === academicYear) {
      setSummary(existingReport.summary);
      setAchievements(existingReport.achievements);
      setProblems(existingReport.problems);
      setNextPlan(existingReport.nextPlan);
    } else {
      setSummary('');
      setAchievements('');
      setProblems('');
      setNextPlan('');
    }
    setSubmitted(false);
  }, [academicYear, existingReport]);

  const isFormValid = summary.trim() && achievements.trim() && problems.trim() && nextPlan.trim();

  const handleSubmit = () => {
    if (!myClub || !isFormValid) return;
    submitReport({
      clubId: myClub.id,
      academicYear,
      summary: summary.trim(),
      achievements: achievements.trim(),
      problems: problems.trim(),
      nextPlan: nextPlan.trim(),
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  const showReview = existingReport && existingReport.academicYear === academicYear && existingReport.reviewStatus !== 'pending';

  return (
    <div className="space-y-5 animate-fade-in">
      {existingReport && existingReport.academicYear === academicYear && (
        <div className={`card p-5 ${
          existingReport.reviewStatus === 'approved'
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-emerald-200'
            : existingReport.reviewStatus === 'rejected'
            ? 'bg-gradient-to-r from-rose-50 to-rose-50/50 border-rose-200'
            : 'bg-gradient-to-r from-amber-50 to-amber-50/50 border-amber-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              existingReport.reviewStatus === 'approved' ? 'bg-emerald-100' : existingReport.reviewStatus === 'rejected' ? 'bg-rose-100' : 'bg-amber-100'
            }`}>
              {existingReport.reviewStatus === 'approved' ? (
                <Award className="w-6 h-6 text-emerald-600" />
              ) : existingReport.reviewStatus === 'rejected' ? (
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-gray-900">
                  {academicYear} 学年工作总结
                </h3>
                <span className={`badge ${
                  existingReport.reviewStatus === 'approved' ? 'badge-approved' : existingReport.reviewStatus === 'pending' ? 'badge-pending' : 'badge-rejected'
                }`}>
                  {existingReport.reviewStatus === 'approved' ? '已通过' : existingReport.reviewStatus === 'pending' ? '审核中' : '已驳回'}
                </span>
                <span className="text-xs text-gray-500">提交于 {existingReport.submittedAt}</span>
              </div>
              {existingReport.reviewStatus === 'approved' && existingReport.score !== undefined && (
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-gray-700">评分：</span>
                  <span className="text-lg font-bold text-emerald-700">{existingReport.score}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
              )}
              {existingReport.reviewComment && (
                <div className="flex items-start gap-2 mt-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">评审意见：</span>
                    <span className="text-sm text-gray-700">{existingReport.reviewComment}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title !mb-0">
            <FileText className="w-5 h-5 text-brand-600" /> 学年工作总结
          </h2>
          {submitted && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-fade-in">
              <CheckCircle className="w-4 h-4" /> 提交成功
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-1" /> 选择学年
            </label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input-field">
              {getAcademicYears().map((y) => (
                <option key={y} value={y}>{y} 学年</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-500" /> 工作概述
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="请概述本学年社团的整体工作情况、活动开展概况、队伍建设等..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{summary.length} 字</p>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> 主要成果
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={4}
              placeholder="请列出本学年取得的主要成果、获奖情况、特色活动等（可分点列出）..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{achievements.length} 字</p>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> 存在问题
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={problems}
              onChange={(e) => setProblems(e.target.value)}
              rows={3}
              placeholder="请反思工作中存在的问题、遇到的困难以及需要改进的地方..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{problems.length} 字</p>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Rocket className="w-4 h-4 text-accent-500" /> 下学年计划
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              rows={4}
              placeholder="请规划下一学年的工作目标、重点活动、发展方向等..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{nextPlan.length} 字</p>
          </div>
        </div>

        {!isFormValid && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>请填写所有必填项（工作概述、主要成果、存在问题、下学年计划）</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={() => {
              setSummary('');
              setAchievements('');
              setProblems('');
              setNextPlan('');
            }}
            className="btn-secondary"
          >
            清空重写
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
            {existingReport && existingReport.academicYear === academicYear ? '更新并提交' : '提交工作总结'}
          </button>
        </div>
      </div>

      {showReview && (
        <div className="card p-6">
          <h3 className="section-title">
            <MessageSquare className="w-5 h-5 text-brand-600" /> 评审详情
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 font-medium mb-1">提交时间</p>
              <p className="text-sm font-medium text-gray-900">{existingReport?.submittedAt}</p>
            </div>
            {existingReport?.score !== undefined && (
              <div className="p-4 rounded-xl bg-emerald-50">
                <p className="text-xs text-emerald-600 font-medium mb-1">评审评分</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {existingReport.score}
                  <span className="text-sm font-normal text-emerald-600 ml-1">/ 100</span>
                </p>
              </div>
            )}
          </div>
          {existingReport?.reviewComment && (
            <div className="p-4 rounded-xl bg-brand-50">
              <p className="text-xs text-brand-600 font-medium mb-2 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> 评审意见
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{existingReport.reviewComment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
