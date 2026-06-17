import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Building2,
  UserPlus,
  UserMinus,
  QrCode,
  CheckCircle,
  LogIn,
  ArrowLeft,
  Sparkles,
  Building,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore } from '@/store';
import dayjs from 'dayjs';

export default function ActivityDetail() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const activities = useStore((s) => s.activities);
  const clubs = useStore((s) => s.clubs);
  const currentUser = useStore((s) => s.currentUser);
  const registerActivity = useStore((s) => s.registerActivity);
  const cancelRegistration = useStore((s) => s.cancelRegistration);
  const checkIn = useStore((s) => s.checkIn);

  const [showCheckInAnimation, setShowCheckInAnimation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activity = activities.find((a) => a.id === activityId);
  const club = activity ? clubs.find((c) => c.id === activity.clubId) : undefined;

  const isStudent = currentUser?.role === 'student';
  const myRegistration = isStudent && activity
    ? activity.registrations.find(
        (r) => r.studentId === currentUser?.studentId && r.status === 'registered'
      )
    : undefined;
  const myAttendance = isStudent && activity
    ? activity.attendances.find((a) => a.studentId === currentUser?.studentId)
    : undefined;

  const isActivityToday = activity
    ? dayjs().isSame(dayjs(activity.startTime), 'day')
    : false;
  const isActivityEnded = activity?.status === 'ended';
  const isFull = activity ? activity.registeredCount >= activity.capacity : false;
  const canRegister = isStudent && !myRegistration && !isFull && !isActivityEnded && activity?.status === 'published';
  const canCancel = isStudent && !!myRegistration && !isActivityEnded;
  const canCheckIn = isStudent && !!myRegistration && isActivityToday && !myAttendance;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRegister = () => {
    if (!currentUser || !activity) return;
    const ok = registerActivity(activity.id, currentUser.studentId, currentUser.name);
    if (ok) {
      showToast('报名成功！');
    } else {
      showToast('报名失败，请稍后重试');
    }
  };

  const handleCancel = () => {
    if (!currentUser || !activity) return;
    cancelRegistration(activity.id, currentUser.studentId);
    showToast('已取消报名');
  };

  const handleCheckIn = () => {
    if (!currentUser || !activity) return;
    const ok = checkIn(activity.id, currentUser.studentId, currentUser.name);
    if (ok) {
      setShowCheckInAnimation(true);
      setTimeout(() => setShowCheckInAnimation(false), 2500);
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">活动不存在</h2>
          <p className="text-gray-500 mb-6">该活动可能已被删除或尚未发布</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  const capacityPercent = activity.capacity > 0
    ? Math.min(100, Math.round((activity.registeredCount / activity.capacity) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2">
            {club && (
              <Link
                to={`/club/${club.id}`}
                className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                <Building2 className="w-4 h-4" />
                {club.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="relative h-72 md:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: activity.cover
              ? `url(${activity.cover})`
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 50%, #f97316 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative h-full max-w-5xl mx-auto px-6 flex flex-col justify-end pb-8">
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${
                activity.status === 'published' ? 'bg-accent-500 text-white' :
                activity.status === 'ended' ? 'bg-gray-100 text-gray-600' :
                'bg-amber-100 text-amber-700'
              }`}>
                {activity.status === 'published' ? '报名进行中' :
                 activity.status === 'ended' ? '已结束' :
                 activity.status === 'approved' ? '待发布' :
                 activity.status === 'pending' ? '审批中' : '草稿'}
              </span>
              {isActivityToday && activity.status === 'published' && (
                <span className="badge bg-emerald-100 text-emerald-700">
                  <Sparkles className="w-3 h-3" />
                  今日活动
                </span>
              )}
            </div>
            <h1 className="hero-title text-3xl md:text-5xl text-white mb-3 leading-tight">
              {activity.title}
            </h1>
            {club && (
              <p className="text-white/80 text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                {club.name}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card p-8 animate-fade-in-up">
              <h2 className="section-title">
                <CalendarDays className="w-6 h-6 text-brand-600" />
                活动详情
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">活动时间</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {dayjs(activity.startTime).format('YYYY年MM月DD日 HH:mm')}
                    </p>
                    <p className="text-xs text-gray-500">
                      至 {dayjs(activity.endTime).format('HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">活动地点</p>
                    <p className="font-medium text-gray-900 text-sm">{activity.location}</p>
                    <p className="text-xs text-gray-500">{activity.venueApplication.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">报名人数</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {activity.registeredCount} / {activity.capacity} 人
                    </p>
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          capacityPercent >= 100 ? 'bg-rose-500' :
                          capacityPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">主办方</p>
                    <p className="font-medium text-gray-900 text-sm">{club?.name || '-'}</p>
                    <p className="text-xs text-gray-500">
                      负责人: {club?.leaderInfo.name || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">活动介绍</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {activity.description}
                </p>
              </div>
            </div>

            {isStudent && (
              <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="section-title">
                  <CheckCircle className="w-6 h-6 text-brand-600" />
                  我的出席记录
                </h2>
                <div className="space-y-3">
                  {myAttendance ? (
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800">已完成签到</p>
                        <p className="text-sm text-emerald-600">
                          签到时间: {myAttendance.checkedInAt}
                        </p>
                      </div>
                    </div>
                  ) : myRegistration ? (
                    <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800">等待签到</p>
                        <p className="text-sm text-amber-600">
                          {isActivityToday
                            ? '活动今日进行，请在现场完成签到'
                            : '请在活动当天到场完成签到'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">尚未报名</p>
                        <p className="text-sm text-gray-500">报名后可查看出席记录</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-8 animate-fade-in-up">
              <h2 className="section-title">
                <Users className="w-6 h-6 text-brand-600" />
                报名信息
              </h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">当前报名</span>
                  <span className="text-sm font-semibold">
                    <span className={capacityPercent >= 100 ? 'text-rose-600' : 'text-brand-700'}>
                      {activity.registeredCount}
                    </span>
                    <span className="text-gray-400"> / {activity.capacity}</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      capacityPercent >= 100 ? 'bg-gradient-to-r from-rose-500 to-rose-600' :
                      capacityPercent >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      'bg-gradient-to-r from-brand-500 to-brand-700'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                {capacityPercent >= 100 && (
                  <p className="text-xs text-rose-500 mt-2">人数已满，暂无法报名</p>
                )}
              </div>

              {!isStudent ? (
                <Link to="/login" className="btn-primary w-full">
                  <LogIn className="w-5 h-5" />
                  登录后报名
                </Link>
              ) : myRegistration ? (
                <div className="space-y-3">
                  <div className="w-full py-3 bg-emerald-50 text-emerald-700 font-medium rounded-full text-center border border-emerald-200">
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    已报名成功
                  </div>
                  {canCancel && (
                    <button
                      onClick={handleCancel}
                      className="btn-secondary w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <UserMinus className="w-5 h-5" />
                      取消报名
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={!canRegister}
                  className="btn-primary w-full"
                >
                  <UserPlus className="w-5 h-5" />
                  {isFull ? '人数已满' : isActivityEnded ? '活动已结束' : '立即报名'}
                </button>
              )}
            </div>

            {isStudent && isActivityToday && myRegistration && activity.status === 'published' && (
              <div className="card p-8 bg-gradient-to-br from-brand-900 to-brand-800 text-white overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <h2 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-accent-400" />
                    活动签到
                  </h2>
                  <p className="text-white/70 text-sm mb-6">
                    请在活动现场出示二维码或点击签到按钮完成签到
                  </p>

                  <div className="bg-white p-4 rounded-2xl mb-6">
                    <QRCodeCanvas
                      value={`checkin:${activity.id}:${currentUser?.studentId}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="w-full h-auto"
                    />
                  </div>

                  {myAttendance ? (
                    <div className="w-full py-3 bg-emerald-500/20 text-emerald-300 font-medium rounded-full text-center border border-emerald-400/30">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      已完成签到
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckIn}
                      disabled={!canCheckIn}
                      className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-full transition-all hover:shadow-lg hover:shadow-accent-500/30 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      点击签到
                    </button>
                  )}
                </div>
              </div>
            )}

            {club && (
              <Link
                to={`/club/${club.id}`}
                className="card p-6 block card-hover animate-fade-in-up"
                style={{ animationDelay: '150ms' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {club.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{club.name}</p>
                    <p className="text-sm text-gray-500 truncate">{club.slogan}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {showCheckInAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-fade-in-up">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-3xl font-serif font-bold text-white mb-2">签到成功</h3>
            <p className="text-white/80">欢迎参加本次活动</p>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-gray-900 text-white rounded-full shadow-xl text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
