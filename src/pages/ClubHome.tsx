import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  Info,
  BookOpen,
  UserPlus,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';
import dayjs from 'dayjs';

export default function ClubHome() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const clubs = useStore((s) => s.clubs);
  const activities = useStore((s) => s.activities);
  const members = useStore((s) => s.members);
  const currentUser = useStore((s) => s.currentUser);
  const addMember = useStore((s) => s.addMember);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const club = clubs.find((c) => c.id === clubId);
  const clubActivities = activities
    .filter((a) => a.clubId === clubId && (a.status === 'published' || a.status === 'ended'))
    .sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
    .slice(0, 4);

  const coreMembers = members
    .filter((m) => m.clubId === clubId && m.status === 'approved' && (m.role === 'leader' || m.role === 'vice_leader'))
    .sort((a, b) => {
      const order = { leader: 0, vice_leader: 1, member: 2 };
      return order[a.role] - order[b.role];
    });

  const activityCount = activities.filter((a) => a.clubId === clubId).length;

  const isStudent = currentUser?.role === 'student';
  const alreadyMember = isStudent && members.some(
    (m) => m.clubId === clubId && m.studentId === currentUser?.studentId && m.status !== 'rejected'
  );

  const getInitials = (name: string) => {
    return name.slice(-2);
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      leader: '社长',
      vice_leader: '副社长',
      member: '成员',
    };
    return map[role] || role;
  };

  const handleApply = () => {
    if (!currentUser || !club) return;
    addMember({
      clubId: club.id,
      studentId: currentUser.studentId,
      name: currentUser.name,
      phone: currentUser.phone,
      department: currentUser.department,
    });
    setApplySuccess(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplySuccess(false);
    }, 1500);
  };

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">社团不存在</h2>
          <p className="text-gray-500 mb-6">该社团可能已被删除或尚未注册</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[520px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: club.coverImage
              ? `url(${club.coverImage})`
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 50%, #f97316 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/60 to-brand-900/90" />

        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-center text-white">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span>{club.category} · 校级认证社团</span>
            </div>

            <h1 className="hero-title text-5xl md:text-7xl mb-4 leading-tight">
              {club.name}
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 font-light">
              「{club.slogan}」
            </p>

            <div className="flex flex-wrap items-center gap-8 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{club.memberCount}</p>
                  <p className="text-sm text-white/60">在册成员</p>
                </div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{activityCount}</p>
                  <p className="text-sm text-white/60">举办活动</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {isStudent && !alreadyMember && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn-accent px-8 py-3 text-base"
                >
                  <UserPlus className="w-5 h-5" />
                  申请加入
                </button>
              )}
              {alreadyMember && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 backdrop-blur rounded-full text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="w-5 h-5" />
                  你已是本社团成员
                </div>
              )}
              {!isStudent && (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-accent px-8 py-3 text-base"
                >
                  登录后申请加入
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <div className="card p-8 animate-fade-in-up">
              <h2 className="section-title">
                <Info className="w-6 h-6 text-brand-600" />
                关于我们
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {club.description}
              </p>
            </div>

            <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h2 className="section-title">
                <BookOpen className="w-6 h-6 text-brand-600" />
                社团章程摘要
              </h2>
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {club.constitution}
                </pre>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title mb-0">
                  <CalendarDays className="w-6 h-6 text-brand-600" />
                  近期活动
                </h2>
                {clubActivities.length > 0 && (
                  <Link
                    to="#"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                  >
                    查看全部
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {clubActivities.length === 0 ? (
                <div className="card p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无活动记录，敬请期待</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {clubActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/activity/${activity.id}`}
                      className="card card-hover overflow-hidden group"
                    >
                      <div
                        className="h-40 bg-gradient-to-br from-brand-700 to-brand-900 relative"
                        style={
                          activity.cover
                            ? { backgroundImage: `url(${activity.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : undefined
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`badge ${activity.status === 'ended' ? 'bg-gray-100 text-gray-600' : 'bg-accent-500 text-white'}`}>
                            {activity.status === 'ended' ? '已结束' : '进行中'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-brand-700 transition-colors line-clamp-1">
                          {activity.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{dayjs(activity.startTime).format('YYYY年MM月DD日 HH:mm')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{activity.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {activity.registeredCount}/{activity.capacity} 人报名
                          </span>
                          <span className="text-brand-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            查看详情
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <h2 className="section-title">
                <Users className="w-6 h-6 text-brand-600" />
                核心成员
              </h2>

              {coreMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">核心成员信息更新中</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coreMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {getInitials(member.name)}
                        </div>
                        {member.role === 'leader' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                            👑
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{getRoleLabel(member.role)}</p>
                        {member.department && (
                          <p className="text-xs text-gray-400 mt-0.5">{member.department}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-8 bg-gradient-to-br from-brand-900 to-brand-800 text-white animate-fade-in-up overflow-hidden relative" style={{ animationDelay: '250ms' }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <h3 className="font-serif text-xl font-bold mb-2">想加入我们？</h3>
                <p className="text-white/70 text-sm mb-6">
                  成为社团一员，参与精彩活动，结识志同道合的朋友
                </p>
                {isStudent && !alreadyMember ? (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-full transition-all hover:shadow-lg hover:shadow-accent-500/30 inline-flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    立即申请加入
                  </button>
                ) : alreadyMember ? (
                  <div className="w-full py-3 bg-emerald-500/20 text-emerald-300 font-medium rounded-full text-center border border-emerald-400/30">
                    ✓ 已加入本社团
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-full transition-all hover:shadow-lg hover:shadow-accent-500/30 inline-flex items-center justify-center gap-2"
                  >
                    登录后申请
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-8 animate-fade-in-up">
            {applySuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">申请已提交</h3>
                <p className="text-gray-500">请等待社团负责人审核</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">申请加入 {club.name}</h3>
                  <p className="text-sm text-gray-500">请确认以下信息</p>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">姓名</span>
                    <span className="font-medium text-gray-900">{currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">学号</span>
                    <span className="font-medium text-gray-900">{currentUser?.studentId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">学院</span>
                    <span className="font-medium text-gray-900">{currentUser?.department || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">联系电话</span>
                    <span className="font-medium text-gray-900">{currentUser?.phone}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleApply}
                    className="btn-primary flex-1"
                  >
                    确认申请
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
