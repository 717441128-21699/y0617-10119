import { useMemo, useState } from 'react';
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
  LogIn,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';
import type { Member, Activity, ActivityRegistration, Attendance, Club } from '@/types';

type TimelineType = 'club' | 'registration' | 'attendance';
type FilterType = 'all' | 'club' | 'registration' | 'attendance';

interface TimelineItem {
  id: string;
  type: TimelineType;
  title: string;
  time: string;
  timeForSort: number;
  status: string;
  statusBadgeClass: string;
  detail: string;
  navigatePath: string;
  clubName?: string;
  location?: string;
}

export default function StudentMyClubs() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const members = useStore((s) => s.members);
  const activities = useStore((s) => s.activities);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    if (!currentUser) return { clubs: 0, activities: 0, checkIns: 0 };

    const joinedClubs = members.filter(
      (m) => m.studentId === currentUser.studentId && m.status === 'approved'
    ).length;

    let activityCount = 0;
    let checkInCount = 0;

    activities.forEach((activity) => {
      const reg = activity.registrations.find(
        (r) => r.studentId === currentUser.studentId && r.status === 'registered'
      );
      if (reg) activityCount++;

      const att = activity.attendances.find((a) => a.studentId === currentUser.studentId);
      if (att) checkInCount++;
    });

    return { clubs: joinedClubs, activities: activityCount, checkIns: checkInCount };
  }, [currentUser, members, activities]);

  const getClubById = (clubId: string): Club | undefined => {
    return clubs.find((c) => c.id === clubId);
  };

  const parseDate = (dateStr: string): number => {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return parsed;
    const normalized = dateStr.replace(/\//g, '-');
    const parsed2 = Date.parse(normalized);
    if (!isNaN(parsed2)) return parsed2;
    return 0;
  };

  const timelineItems = useMemo((): TimelineItem[] => {
    if (!currentUser) return [];
    const items: TimelineItem[] = [];

    members
      .filter((m) => m.studentId === currentUser.studentId)
      .forEach((member) => {
        const club = getClubById(member.clubId);
        if (!club) return;

        let status = '';
        let statusBadgeClass = '';
        let detail = '';

        if (member.status === 'approved') {
          status = '已通过';
          statusBadgeClass = 'bg-emerald-100 text-emerald-700';
          if (member.role === 'leader') {
            detail = `你以"会长"身份加入了${club.name}社团`;
          } else if (member.role === 'vice_leader') {
            detail = `你以"副会长"身份加入了${club.name}社团`;
          } else {
            detail = `你成功加入了${club.name}社团，成为社团一员`;
          }
        } else if (member.status === 'pending') {
          status = '审核中';
          statusBadgeClass = 'bg-amber-100 text-amber-700';
          detail = `你的加入申请正在审核中，请耐心等待`;
        } else if (member.status === 'rejected') {
          status = '已拒绝';
          statusBadgeClass = 'bg-rose-100 text-rose-700';
          detail = `很遗憾，你的加入申请未通过审核`;
        }

        items.push({
          id: `club-${member.id}`,
          type: 'club',
          title: `${club.name} - 加入申请`,
          time: member.joinDate,
          timeForSort: parseDate(member.joinDate),
          status,
          statusBadgeClass,
          detail,
          navigatePath: `/club/${club.id}`,
          clubName: club.name,
        });
      });

    activities.forEach((activity) => {
      const reg = activity.registrations.find(
        (r) => r.studentId === currentUser!.studentId && r.status === 'registered'
      );
      if (reg) {
        const club = getClubById(activity.clubId);
        items.push({
          id: `reg-${reg.id}`,
          type: 'registration',
          title: activity.title,
          time: reg.registeredAt,
          timeForSort: parseDate(reg.registeredAt),
          status: '已报名',
          statusBadgeClass: 'bg-accent-100 text-accent-700',
          detail: `你已报名参加${club?.name || '未知社团'}的活动，地点：${activity.location}`,
          navigatePath: `/activity/${activity.id}`,
          clubName: club?.name,
          location: activity.location,
        });
      }

      const att = activity.attendances.find((a) => a.studentId === currentUser!.studentId);
      if (att) {
        const club = getClubById(activity.clubId);
        items.push({
          id: `att-${att.id}`,
          type: 'attendance',
          title: activity.title,
          time: att.checkedInAt,
          timeForSort: parseDate(att.checkedInAt),
          status: '已签到',
          statusBadgeClass: 'bg-emerald-100 text-emerald-700',
          detail: `你已完成${club?.name || '未知社团'}活动的签到`,
          navigatePath: `/activity/${activity.id}`,
          clubName: club?.name,
          location: activity.location,
        });
      }
    });

    return items.sort((a, b) => b.timeForSort - a.timeForSort);
  }, [members, activities, currentUser, clubs]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return timelineItems;
    return timelineItems.filter((item) => item.type === activeFilter);
  }, [timelineItems, activeFilter]);

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: timelineItems.length },
    { key: 'club', label: '社团', count: timelineItems.filter((i) => i.type === 'club').length },
    {
      key: 'registration',
      label: '活动报名',
      count: timelineItems.filter((i) => i.type === 'registration').length,
    },
    {
      key: 'attendance',
      label: '签到记录',
      count: timelineItems.filter((i) => i.type === 'attendance').length,
    },
  ];

  const getDotColor = (type: TimelineType): string => {
    switch (type) {
      case 'club':
        return 'bg-brand-500 border-brand-500';
      case 'registration':
        return 'bg-accent-500 border-accent-500';
      case 'attendance':
        return 'bg-emerald-500 border-emerald-500';
    }
  };

  const getTypeIcon = (type: TimelineType) => {
    switch (type) {
      case 'club':
        return Building2;
      case 'registration':
        return CalendarDays;
      case 'attendance':
        return CheckCircle2;
    }
  };

  const getTypeLabel = (type: TimelineType): string => {
    switch (type) {
      case 'club':
        return '社团申请';
      case 'registration':
        return '活动报名';
      case 'attendance':
        return '活动签到';
    }
  };

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
            <p className="text-white/70">查看你的社团活动时间线，记录每一次成长</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{stats.clubs}</p>
              <p className="text-xs text-white/60">已加入社团</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{stats.activities}</p>
              <p className="text-xs text-white/60">活动报名</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{stats.checkIns}</p>
              <p className="text-xs text-white/60">签到次数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-2">
        <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeFilter === tab.key
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-400 via-accent-400 to-emerald-400 rounded-full" />

        {filteredItems.length > 0 ? (
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="relative pl-14 md:pl-16 cursor-pointer group"
                  onClick={() => navigate(item.navigatePath)}
                >
                  <div
                    className={`absolute left-2 md:left-3 top-5 w-7 h-7 rounded-full border-4 bg-white ${getDotColor(
                      item.type
                    )} z-10 transition-transform group-hover:scale-125`}
                  />

                  <div className="card card-hover p-5 transition-all group-hover:-translate-y-0.5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          item.type === 'club'
                            ? 'bg-brand-100 text-brand-600'
                            : item.type === 'registration'
                            ? 'bg-accent-100 text-accent-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        <TypeIcon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.type === 'club'
                                ? 'bg-brand-50 text-brand-600'
                                : item.type === 'registration'
                                ? 'bg-accent-50 text-accent-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {getTypeLabel(item.type)}
                          </span>
                          <span className={`badge ${item.statusBadgeClass}`}>
                            {item.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-brand-700 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">{item.detail}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                          {item.clubName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {item.clubName}
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center relative">
            <div className="absolute left-5 md:left-6 top-0 bottom-0 w-0.5 bg-gray-100 rounded-full" />
            <div className="relative">
              <Sparkles className="w-14 h-14 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">暂无记录</h3>
              <p className="text-gray-400 text-sm mb-5">
                快去探索精彩的社团活动吧，你的时间线将在这里记录每一次成长
              </p>
              <button onClick={() => navigate('/student/home')} className="btn-primary">
                开始探索
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
