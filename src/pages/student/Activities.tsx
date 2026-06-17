import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useStore } from '@/store';
import DashboardLayout from '@/components/DashboardLayout';

export default function StudentActivities() {
  const navigate = useNavigate();
  const activities = useStore((s) => s.activities);
  const clubs = useStore((s) => s.clubs);
  const currentUser = useStore((s) => s.currentUser);
  const registerActivity = useStore((s) => s.registerActivity);

  const publishedActivities = useMemo(() => {
    return activities
      .filter((a) => a.status === 'published')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [activities]);

  const getClubName = (clubId: string) => {
    return clubs.find((c) => c.id === clubId)?.name || '未知社团';
  };

  const isRegistered = (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity || !currentUser) return false;
    return activity.registrations.some(
      (r) => r.studentId === currentUser.studentId && r.status === 'registered'
    );
  };

  const handleRegister = (activityId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    registerActivity(activityId, currentUser.studentId, currentUser.name);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8 animate-fade-in">
        <div className="card p-8 bg-gradient-to-r from-brand-900 via-brand-800 to-accent-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-grid" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-400 rounded-full blur-3xl opacity-30" />

          <div className="relative">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
              <CalendarDays className="w-4 h-4" />
              <span>精彩活动不断</span>
            </div>
            <h1 className="hero-title text-4xl md:text-5xl mb-3">活动大厅</h1>
            <p className="text-white/70 text-lg max-w-xl">
              发现校园里最有趣的活动，拓展视野，结识朋友，让大学生活更加丰富多彩
            </p>

            <div className="flex items-center gap-8 mt-6">
              <div>
                <p className="text-3xl font-bold">{publishedActivities.length}</p>
                <p className="text-xs text-white/60">正在报名</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">
                  {publishedActivities.reduce((sum, a) => sum + a.registeredCount, 0)}
                </p>
                <p className="text-xs text-white/60">总报名人次</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <CalendarDays className="w-6 h-6 text-brand-600" />
            活动列表
            <span className="ml-2 text-sm font-normal text-gray-400">
              共 {publishedActivities.length} 个活动
            </span>
          </h2>

          {publishedActivities.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-transparent" />

              <div className="space-y-6">
                {publishedActivities.map((activity, index) => {
                  const full = activity.registeredCount >= activity.capacity;
                  const registered = isRegistered(activity.id);

                  return (
                    <div key={activity.id} className="relative pl-16">
                      <div
                        className={`absolute left-4 top-8 w-5 h-5 rounded-full border-4 border-white shadow-lg ${
                          full ? 'bg-gray-400' : 'bg-gradient-to-br from-brand-500 to-brand-700'
                        }`}
                      />

                      <div
                        className="card card-hover overflow-hidden group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex flex-col lg:flex-row">
                          <div className="relative lg:w-72 h-48 lg:h-auto flex-shrink-0 bg-gradient-to-br from-brand-100 to-accent-100 overflow-hidden">
                            {activity.cover ? (
                              <img
                                src={activity.cover}
                                alt={activity.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-brand-300" />
                              </div>
                            )}

                            <div className="absolute top-3 left-3">
                              <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center shadow-md">
                                <span className="text-xs text-gray-500 leading-none">
                                  {activity.startTime.slice(5, 7)}月
                                </span>
                                <span className="text-xl font-bold text-brand-700 leading-tight">
                                  {activity.startTime.slice(8, 10)}
                                </span>
                              </div>
                            </div>

                            {full && (
                              <div className="absolute top-3 right-3">
                                <span className="badge bg-gray-900/80 text-white backdrop-blur-sm">
                                  <AlertCircle className="w-3 h-3" />
                                  已满员
                                </span>
                              </div>
                            )}

                            {registered && !full && (
                              <div className="absolute top-3 right-3">
                                <span className="badge bg-emerald-600/90 text-white backdrop-blur-sm">
                                  <CheckCircle2 className="w-3 h-3" />
                                  已报名
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 p-6 flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl text-gray-900 group-hover:text-brand-700 transition-colors mb-1">
                                  {activity.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Building2 className="w-4 h-4" />
                                  <span>{getClubName(activity.clubId)}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                              {activity.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-brand-500" />
                                <span>
                                  {activity.startTime} - {activity.endTime.slice(11)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-brand-500" />
                                <span>{activity.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-brand-500" />
                                <span
                                  className={full ? 'text-rose-600 font-medium' : ''}
                                >
                                  {activity.registeredCount}/{activity.capacity} 人
                                </span>
                              </div>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  full
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                                    : 'bg-gradient-to-r from-brand-500 to-accent-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (activity.registeredCount / activity.capacity) * 100
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              {registered ? (
                                <button
                                  disabled
                                  className="btn-success !py-2.5 text-sm opacity-70 cursor-not-allowed"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  已报名成功
                                </button>
                              ) : full ? (
                                <button
                                  disabled
                                  className="btn-primary w-full !py-2.5 text-sm opacity-50 cursor-not-allowed"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  已满员
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRegister(activity.id)}
                                  className="btn-accent !py-2.5 text-sm"
                                >
                                  立即报名
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                              <button className="btn-secondary !py-2.5 text-sm">
                                查看详情
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card p-16 text-center">
              <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">暂无正在报名的活动</h3>
              <p className="text-gray-400">稍后再来看看，精彩活动即将上线</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
