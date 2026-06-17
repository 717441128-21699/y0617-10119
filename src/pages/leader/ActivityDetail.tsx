import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  QrCode,
  CheckCircle,
  PlayCircle,
  StopCircle,
  ArrowLeft,
  DollarSign,
  Building2,
  UserCheck,
  Download,
  Edit3,
  Send,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/store';
import type { ActivityStatus } from '@/types';

const statusLabels: Record<ActivityStatus, string> = {
  draft: '草稿', pending: '待审批', approved: '已批准', published: '报名中', ended: '已结束', rejected: '已驳回',
};

const statusBadge = (s: ActivityStatus) =>
  s === 'published' ? 'badge-published' :
  s === 'approved' ? 'badge-approved' :
  s === 'pending' ? 'badge-pending' :
  s === 'rejected' ? 'badge-rejected' :
  s === 'ended' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500';

const applyLabels: Record<string, string> = { pending: '待审批', approved: '已通过', rejected: '已驳回' };
const applyBadge = (s: string) =>
  s === 'approved' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activities = useStore((s) => s.activities);
  const users = useStore((s) => s.users);
  const publishActivity = useStore((s) => s.publishActivity);
  const endActivity = useStore((s) => s.endActivity);
  const resubmitActivity = useStore((s) => s.resubmitActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const [showQR, setShowQR] = useState(false);

  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <div className="card p-12 text-center text-gray-500">
        <p>活动不存在</p>
        <button onClick={() => navigate('/leader/activities')} className="btn-secondary mt-4">返回列表</button>
      </div>
    );
  }

  const registered = activity.registrations.filter((r) => r.status === 'registered');
  const isFull = registered.length >= activity.capacity;
  const attendanceMap = useMemo(() => {
    const map = new Map<string, boolean>();
    activity.attendances.forEach((a) => map.set(a.studentId, true));
    return map;
  }, [activity.attendances]);

  const getPhone = (studentId: string) => {
    const user = users.find((u) => u.studentId === studentId);
    return user?.phone || '-';
  };

  const handleExportCSV = () => {
    const headers = ['姓名', '学号', '手机号', '报名时间', '签到状态'];
    const rows = registered.map((r) => [
      r.name,
      r.studentId,
      getPhone(r.studentId),
      r.registeredAt,
      attendanceMap.has(r.studentId) ? '已签到' : '未签到',
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activity.title}_报名名单.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitApproval = () => {
    if (id) {
      updateActivity(id, { status: 'pending' });
    }
  };

  const handleWithdraw = () => {
    if (id && confirm('确定要撤回审批吗？撤回后活动将回到草稿状态。')) {
      updateActivity(id, { status: 'draft' });
    }
  };

  const handleResubmit = () => {
    if (id) {
      resubmitActivity(id);
    }
  };

  const progressPercent = Math.min((registered.length / activity.capacity) * 100, 100);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/leader/activities')} className="btn-ghost !px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{activity.title}</h2>
              <span className={`badge ${statusBadge(activity.status)}`}>{statusLabels[activity.status]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">活动管理详情</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activity.status === 'draft' && (
            <>
              <button onClick={() => navigate('/leader/activities/new')} className="btn-secondary">
                <Edit3 className="w-4 h-4" /> 编辑
              </button>
              <button onClick={handleSubmitApproval} className="btn-primary">
                <Send className="w-4 h-4" /> 提交审批
              </button>
            </>
          )}
          {activity.status === 'pending' && (
            <>
              <button className="btn-secondary" disabled>
                <Clock className="w-4 h-4" /> 审批中
              </button>
              <button onClick={handleWithdraw} className="btn-accent">
                <RotateCcw className="w-4 h-4" /> 撤回
              </button>
            </>
          )}
          {activity.status === 'approved' && (
            <button onClick={() => id && publishActivity(id)} className="btn-success">
              <PlayCircle className="w-4 h-4" /> 发布活动
            </button>
          )}
          {activity.status === 'published' && (
            <button onClick={() => id && endActivity(id)} className="btn-accent">
              <StopCircle className="w-4 h-4" /> 结束活动
            </button>
          )}
          {activity.status === 'rejected' && (
            <button onClick={handleResubmit} className="btn-primary">
              <RotateCcw className="w-4 h-4" /> 修改后重新提交
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="section-title"><CalendarDays className="w-5 h-5 text-brand-600" /> 活动基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><p className="text-xs text-gray-500">活动时间</p><p className="font-medium text-gray-900">{activity.startTime} ~ {activity.endTime}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><p className="text-xs text-gray-500">活动地点</p><p className="font-medium text-gray-900">{activity.location}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><p className="text-xs text-gray-500">报名人数</p><p className="font-medium text-gray-900">{registered.length} / {activity.capacity} 人</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><p className="text-xs text-gray-500">创建时间</p><p className="font-medium text-gray-900">{activity.createdAt}</p></div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">活动描述</p>
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">
                <Users className="w-5 h-5 text-brand-600" /> 报名名单管理
                <span className="ml-2 text-sm font-normal text-gray-500">共 {registered.length} 人</span>
              </h3>
              <button onClick={handleExportCSV} className="btn-secondary !px-4 !py-2">
                <Download className="w-4 h-4" /> 导出名单
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">报名进度</span>
                <span className="font-medium text-gray-900">{registered.length} / {activity.capacity}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${isFull ? 'bg-rose-500' : 'bg-brand-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {isFull && (
              <div className="mb-4 p-3 bg-rose-50 rounded-xl flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">已满员</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">姓名</th>
                  <th className="table-header">学号</th>
                  <th className="table-header">手机号</th>
                  <th className="table-header">报名时间</th>
                  <th className="table-header">签到状态</th>
                </tr></thead>
                <tbody>
                  {registered.length === 0 ? (
                    <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">暂无报名成员</td></tr>
                  ) : registered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="table-cell font-medium text-gray-900">{r.name}</td>
                      <td className="table-cell text-gray-600">{r.studentId}</td>
                      <td className="table-cell text-gray-600">{getPhone(r.studentId)}</td>
                      <td className="table-cell text-gray-500 text-xs">{r.registeredAt}</td>
                      <td className="table-cell">
                        {attendanceMap.has(r.studentId) ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                            <CheckCircle className="w-4 h-4" /> 已签到
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                            <XCircle className="w-4 h-4" /> 未签到
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">
                <UserCheck className="w-5 h-5 text-accent-500" /> 签到管理
                <span className="ml-2 text-sm font-normal text-gray-500">
                  已签到 {activity.attendances.length} / {registered.length} 人
                </span>
              </h3>
              <button onClick={() => setShowQR(!showQR)} className={`${showQR ? 'btn-accent' : 'btn-secondary'} !px-4 !py-2`}>
                <QrCode className="w-4 h-4" /> {showQR ? '隐藏二维码' : '签到二维码'}
              </button>
            </div>
            {showQR && (
              <div className="mb-5 p-6 bg-gradient-to-br from-brand-50 to-accent-50 rounded-2xl flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-3">扫码签到 · 活动ID: {activity.id}</p>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCodeSVG value={`checkin:${activity.id}`} size={180} level="H" fgColor="#1e3a8a" />
                </div>
                <p className="text-xs text-gray-400 mt-3">请让参会同学使用小程序扫描此二维码完成签到</p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">姓名</th><th className="table-header">学号</th><th className="table-header">签到时间</th>
                </tr></thead>
                <tbody>
                  {activity.attendances.length === 0 ? (
                    <tr><td colSpan={3} className="table-cell text-center text-gray-400 py-8">暂无签到记录</td></tr>
                  ) : activity.attendances.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="table-cell font-medium text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {a.name}
                      </td>
                      <td className="table-cell text-gray-600">{a.studentId}</td>
                      <td className="table-cell text-gray-500 text-xs">{a.checkedInAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="section-title"><Building2 className="w-5 h-5 text-brand-600" /> 场地申请</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">申请状态</span>
                <span className={`badge ${applyBadge(activity.venueApplication.status)}`}>{applyLabels[activity.venueApplication.status]}</span>
              </div>
              <div><span className="text-xs text-gray-500">场地名称</span><p className="font-medium text-gray-900">{activity.venueApplication.venue || '未填写'}</p></div>
              <div><span className="text-xs text-gray-500">使用时段</span><p className="font-medium text-gray-900">{activity.venueApplication.timeSlot || '未填写'}</p></div>
              {activity.venueApplication.rejectReason && (
                <div className="p-3 bg-rose-50 rounded-xl text-sm text-rose-700">
                  <p className="font-medium mb-1">驳回原因</p>
                  <p>{activity.venueApplication.rejectReason}</p>
                </div>
              )}
              {activity.venueApplication.status === 'rejected' && activity.status === 'rejected' && (
                <button onClick={handleResubmit} className="btn-primary w-full mt-2">
                  <RotateCcw className="w-4 h-4" /> 修改后重新提交
                </button>
              )}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="section-title"><DollarSign className="w-5 h-5 text-accent-500" /> 经费申请</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">申请状态</span>
                <span className={`badge ${applyBadge(activity.budgetApplication.status)}`}>{applyLabels[activity.budgetApplication.status]}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-50 to-brand-50 rounded-xl">
                <span className="text-sm text-gray-600">申请总额</span>
                <span className="text-xl font-bold text-accent-600">¥{activity.budgetApplication.total}</span>
              </div>
              {activity.budgetApplication.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {activity.budgetApplication.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">¥{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
              {activity.budgetApplication.rejectReason && (
                <div className="p-3 bg-rose-50 rounded-xl text-sm text-rose-700">
                  <p className="font-medium mb-1">驳回原因</p>
                  <p>{activity.budgetApplication.rejectReason}</p>
                </div>
              )}
              {activity.budgetApplication.status === 'rejected' && activity.status === 'rejected' && (
                <button onClick={handleResubmit} className="btn-primary w-full mt-2">
                  <RotateCcw className="w-4 h-4" /> 修改后重新提交
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
