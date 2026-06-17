import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  UserCircle,
  ArrowRight,
  ClipboardList,
  LogIn,
} from 'lucide-react';
import { useStore } from '@/store';

export default function StudentMyClubs() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const members = useStore((s) => s.members);
  const activities = useStore((s) => s.activities);

  const myApprovedMemberships = useMemo(() => {
    if (!currentUser) return [];
    return members.filter(
      (m) => m.studentId === currentUser.studentId && m.status === 'approved'
    );
  }, [members, currentUser]);

  const myPendingMemberships = useMemo(() => {
    if (!currentUser) return [];
    return members.filter(
      (m) => m.studentId === currentUser.studentId && m.status === 'pending'
    );
  }, [members, currentUser]);

  const myApprovedClubs = useMemo(() => {
    const clubIds = myApprovedMemberships.map((m) => m.clubId);
    return clubs.filter((c) => clubIds.includes(c.id));
  }, [myApprovedMemberships, clubs]);

  const myPendingClubs = useMemo(() => {
    const clubIds = myPendingMemberships.map((m) => m.clubId);
    return clubs.filter((c) => clubIds.includes(c.id));
  }, [myPendingMemberships, clubs]);

  const myRegistrations = useMemo(() => {
    if (!currentUser) return [];
    const result: {
      activity: (typeof activities)[0];
      clubName: string;
      registeredAt: string;
      hasCheckedIn: boolean;
      checkedInAt?: string;
    }[] = [];

    activities.forEach((activity) => {
      const reg = activity.registrations.find(
        (r) => r.studentId === currentUser.studentId && r.status === 'registered'
      );
      if (reg) {
        const attendance = activity.attendances.find(
          (a) => a.studentId === currentUser.studentId
        );
        result.push({
          activity,
          clubName: clubs.find((c) => c.id === activity.clubId)?.name || '未知社团',
          registeredAt: reg.registeredAt,
          hasCheckedIn: !!attendance,
          checkedInAt: attendance?.checkedInAt,
        });
      }
    });

    return result.sort(
      (a, b) =>
        new Date(b.activity.startTime).getTime() - new Date(a.activity.startTime).getTime()
    );
  }, [activities, currentUser, clubs]);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="card p-8 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-grid" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-400 rounded-full blur-3xl opacity-30" />

          <div className="relative flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <UserCircle className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="hero-title text-3xl md:text-4xl mb-2">我的社团</h1>
              <p className="text-white/70">管理你加入的社团、活动报名和签到记录</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">{myApprovedClubs.length}</p>
                <p className="text-xs text-white/60">已加入</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">{myPendingClubs.length}</p>
                <p className="text-xs text-white/60">待审核</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">{myRegistrations.length}</p>
                <p className="text-xs text-white/60">活动报名</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <Building2 className="w-6 h-6 text-brand-600" />
            已加入的社团
            <span className="ml-2 text-sm font-normal text-gray-400">
              共 {myApprovedClubs.length} 个
            </span>
          </h2>

          {myApprovedClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myApprovedClubs.map((club) => {
                const membership = myApprovedMemberships.find((m) => m.clubId === club.id);
                return (
                  <div
                    key={club.id}
                    className="card card-hover p-5 cursor-pointer group"
                    onClick={() => navigate(`/club/${club.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
                            {club.name}
                          </h3>
                          {membership?.role === 'leader' && (
                            <span className="badge bg-amber-100 text-amber-700">会长</span>
                          )}
                          {membership?.role === 'vice_leader' && (
                            <span className="badge bg-blue-100 text-blue-700">副会长</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">"{club.slogan}"</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {club.memberCount} 人
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            已认证
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Building2 className="w-14 h-14 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">还没有加入任何社团</h3>
              <p className="text-gray-400 text-sm mb-5">去社团广场发现感兴趣的社团吧</p>
              <button onClick={() => navigate('/student/home')} className="btn-primary">
                浏览社团广场
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title">
            <Clock className="w-6 h-6 text-amber-500" />
            待审核申请
            {myPendingClubs.length > 0 && (
              <span className="badge badge-pending ml-2">{myPendingClubs.length}</span>
            )}
          </h2>

          {myPendingClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPendingClubs.map((club) => {
                const membership = myPendingMemberships.find((m) => m.clubId === club.id);
                return (
                  <div key={club.id} className="card p-5 bg-amber-50/50 border-amber-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <LogIn className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{club.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          申请时间：{membership?.joinDate}
                        </p>
                      </div>
                      <span className="badge badge-pending">审核中</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">暂无待审核的加入申请</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title">
            <ClipboardList className="w-6 h-6 text-brand-600" />
            活动报名与签到记录
            <span className="ml-2 text-sm font-normal text-gray-400">
              共 {myRegistrations.length} 条
            </span>
          </h2>

          {myRegistrations.length > 0 ? (
            <div className="space-y-3">
              {myRegistrations.map(({ activity, clubName, registeredAt, hasCheckedIn, checkedInAt }) => (
                <div key={activity.id} className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs opacity-80 leading-none">
                        {activity.startTime.slice(5, 7)}月
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {activity.startTime.slice(8, 10)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{activity.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {clubName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          报名于 {registeredAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasCheckedIn ? (
                        <div className="text-right">
                          <span className="badge bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            已签到
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{checkedInAt}</p>
                        </div>
                      ) : activity.status === 'ended' ? (
                        <span className="badge bg-gray-100 text-gray-500">未签到</span>
                      ) : (
                        <span className="badge bg-blue-100 text-blue-700">
                          <Clock className="w-3 h-3" />
                          待参加
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <ClipboardList className="w-14 h-14 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">还没有报名任何活动</h3>
              <p className="text-gray-400 text-sm mb-5">去活动大厅看看有什么精彩活动吧</p>
              <button onClick={() => navigate('/student/activities')} className="btn-primary">
                浏览活动大厅
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
