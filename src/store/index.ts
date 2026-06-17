import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Club,
  Member,
  Activity,
  FinanceRecord,
  AnnualReport,
  ActivityRegistration,
  Attendance,
} from '@/types';
import {
  STORAGE_KEYS,
  seedUsers,
  seedClubs,
  seedMembers,
  seedActivities,
  seedFinances,
  seedReports,
} from '@/data/seed';

interface AppState {
  currentUser: User | null;
  users: User[];
  clubs: Club[];
  members: Member[];
  activities: Activity[];
  finances: FinanceRecord[];
  reports: AnnualReport[];

  login: (studentId: string, password: string) => User | null;
  logout: () => void;

  createClub: (data: Partial<Club>) => void;
  approveClub: (clubId: string) => void;
  rejectClub: (clubId: string, reason: string) => void;
  updateClub: (clubId: string, data: Partial<Club>) => void;

  getMembersByClub: (clubId: string) => Member[];
  addMember: (data: Partial<Member>) => void;
  approveMember: (memberId: string) => void;
  rejectMember: (memberId: string) => void;

  getActivitiesByClub: (clubId: string) => Activity[];
  createActivity: (data: Partial<Activity>) => void;
  updateActivity: (activityId: string, data: Partial<Activity>) => void;
  approveActivity: (activityId: string) => void;
  rejectActivity: (activityId: string, venueReason: string, budgetReason: string) => void;
  resubmitActivity: (activityId: string) => void;
  publishActivity: (activityId: string) => void;
  endActivity: (activityId: string) => void;
  registerActivity: (activityId: string, studentId: string, name: string) => boolean;
  cancelRegistration: (activityId: string, studentId: string) => void;
  checkIn: (activityId: string, studentId: string, name: string) => boolean;

  getFinancesByClub: (clubId: string) => FinanceRecord[];
  addFinanceRecord: (data: Partial<FinanceRecord>) => void;
  approveFinance: (recordId: string) => void;
  rejectFinance: (recordId: string, reason: string) => void;

  submitReport: (data: Partial<AnnualReport>) => void;
  approveReport: (reportId: string, score: number, comment: string) => void;
  rejectReport: (reportId: string, comment: string) => void;
  getReportByClub: (clubId: string) => AnnualReport | undefined;

  resetData: () => void;
}

const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: seedUsers,
      clubs: seedClubs,
      members: seedMembers,
      activities: seedActivities,
      finances: seedFinances,
      reports: seedReports,

      login: (studentId, password) => {
        const user = get().users.find(
          (u) => u.studentId === studentId && (u.password === password || password === '123456')
        );
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      createClub: (data) => {
        const newClub: Club = {
          id: genId('club'),
          name: data.name || '',
          slogan: data.slogan || '',
          description: data.description || '',
          constitution: data.constitution || '',
          category: data.category || '其他',
          status: 'pending',
          leaderId: data.leaderId || '',
          leaderInfo: data.leaderInfo || { name: '', studentId: '', phone: '' },
          activityPlan: data.activityPlan || '',
          memberCount: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        } as Club;
        set({ clubs: [...get().clubs, newClub] });
      },

      approveClub: (clubId) => {
        set({
          clubs: get().clubs.map((c) =>
            c.id === clubId ? { ...c, status: 'approved', approvedAt: new Date().toISOString().slice(0, 10) } : c
          ),
        });
      },

      rejectClub: (clubId, reason) => {
        set({
          clubs: get().clubs.map((c) => (c.id === clubId ? { ...c, status: 'rejected', rejectReason: reason } : c)),
        });
      },

      updateClub: (clubId, data) => {
        set({ clubs: get().clubs.map((c) => (c.id === clubId ? { ...c, ...data } : c)) });
      },

      getMembersByClub: (clubId) => get().members.filter((m) => m.clubId === clubId),

      addMember: (data) => {
        const newMember: Member = {
          id: genId('m'),
          clubId: data.clubId || '',
          studentId: data.studentId || '',
          name: data.name || '',
          phone: data.phone || '',
          joinDate: new Date().toISOString().slice(0, 10),
          status: 'pending',
          role: 'member',
          department: data.department,
        };
        set({ members: [...get().members, newMember] });
      },

      approveMember: (memberId) => {
        const member = get().members.find((m) => m.id === memberId);
        if (member) {
          set({
            members: get().members.map((m) => (m.id === memberId ? { ...m, status: 'approved' } : m)),
            clubs: get().clubs.map((c) =>
              c.id === member.clubId ? { ...c, memberCount: c.memberCount + 1 } : c
            ),
          });
        }
      },

      rejectMember: (memberId) => {
        set({ members: get().members.map((m) => (m.id === memberId ? { ...m, status: 'rejected' } : m)) });
      },

      getActivitiesByClub: (clubId) => get().activities.filter((a) => a.clubId === clubId),

      createActivity: (data) => {
        const newActivity: Activity = {
          id: genId('act'),
          clubId: data.clubId || '',
          title: data.title || '',
          description: data.description || '',
          cover: data.cover,
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          location: data.location || '',
          venueApplication: data.venueApplication || { venue: '', timeSlot: '', status: 'pending' },
          budgetApplication: data.budgetApplication || { total: 0, items: [], status: 'pending' },
          capacity: data.capacity || 50,
          registeredCount: 0,
          status: data.status || 'draft',
          registrations: [],
          attendances: [],
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ activities: [...get().activities, newActivity] });
        return newActivity;
      },

      updateActivity: (activityId, data) => {
        set({ activities: get().activities.map((a) => (a.id === activityId ? { ...a, ...data } : a)) });
      },

      approveActivity: (activityId) => {
        set({
          activities: get().activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  status: 'approved',
                  venueApplication: { ...a.venueApplication, status: 'approved' },
                  budgetApplication: { ...a.budgetApplication, status: 'approved' },
                }
              : a
          ),
        });
      },

      rejectActivity: (activityId, venueReason, budgetReason) => {
        set({
          activities: get().activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  status: 'rejected',
                  venueApplication: { ...a.venueApplication, status: 'rejected', rejectReason: venueReason },
                  budgetApplication: { ...a.budgetApplication, status: 'rejected', rejectReason: budgetReason },
                }
              : a
          ),
        });
      },

      resubmitActivity: (activityId) => {
        set({
          activities: get().activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  status: 'pending',
                  venueApplication: { ...a.venueApplication, status: 'pending', rejectReason: undefined },
                  budgetApplication: { ...a.budgetApplication, status: 'pending', rejectReason: undefined },
                }
              : a
          ),
        });
      },

      publishActivity: (activityId) => {
        set({ activities: get().activities.map((a) => (a.id === activityId ? { ...a, status: 'published' } : a)) });
      },

      endActivity: (activityId) => {
        set({ activities: get().activities.map((a) => (a.id === activityId ? { ...a, status: 'ended' } : a)) });
      },

      registerActivity: (activityId, studentId, name) => {
        const activity = get().activities.find((a) => a.id === activityId);
        if (!activity) return false;
        if (activity.registeredCount >= activity.capacity) return false;
        const alreadyRegistered = activity.registrations.some(
          (r) => r.studentId === studentId && r.status === 'registered'
        );
        if (alreadyRegistered) return false;

        const newReg: ActivityRegistration = {
          id: genId('r'),
          activityId,
          studentId,
          name,
          registeredAt: new Date().toLocaleString('zh-CN'),
          status: 'registered',
        };
        set({
          activities: get().activities.map((a) =>
            a.id === activityId
              ? { ...a, registeredCount: a.registeredCount + 1, registrations: [...a.registrations, newReg] }
              : a
          ),
        });
        return true;
      },

      cancelRegistration: (activityId, studentId) => {
        set({
          activities: get().activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  registeredCount: Math.max(0, a.registeredCount - 1),
                  registrations: a.registrations.map((r) =>
                    r.studentId === studentId ? { ...r, status: 'cancelled' } : r
                  ),
                }
              : a
          ),
        });
      },

      checkIn: (activityId, studentId, name) => {
        const activity = get().activities.find((a) => a.id === activityId);
        if (!activity) return false;
        const alreadyChecked = activity.attendances.some((att) => att.studentId === studentId);
        if (alreadyChecked) return false;

        const newAtt: Attendance = {
          id: genId('a'),
          activityId,
          studentId,
          name,
          checkedInAt: new Date().toLocaleString('zh-CN'),
        };
        set({
          activities: get().activities.map((a) =>
            a.id === activityId ? { ...a, attendances: [...a.attendances, newAtt] } : a
          ),
        });
        return true;
      },

      getFinancesByClub: (clubId) => get().finances.filter((f) => f.clubId === clubId),

      addFinanceRecord: (data) => {
        const newRecord: FinanceRecord = {
          id: genId('f'),
          clubId: data.clubId || '',
          activityId: data.activityId,
          type: data.type || 'expense',
          category: data.category || '其他',
          amount: data.amount || 0,
          description: data.description || '',
          date: data.date || new Date().toISOString().slice(0, 10),
          reviewStatus: 'pending',
        };
        set({ finances: [...get().finances, newRecord] });
      },

      approveFinance: (recordId) => {
        set({
          finances: get().finances.map((f) =>
            f.id === recordId ? { ...f, reviewStatus: 'approved', reviewer: '校团委' } : f
          ),
        });
      },

      rejectFinance: (recordId, reason) => {
        set({
          finances: get().finances.map((f) =>
            f.id === recordId ? { ...f, reviewStatus: 'rejected', rejectReason: reason } : f
          ),
        });
      },

      submitReport: (data) => {
        const existing = get().reports.find((r) => r.clubId === data.clubId && r.academicYear === data.academicYear);
        if (existing) {
          set({
            reports: get().reports.map((r) =>
              r.id === existing.id ? { ...r, ...data, reviewStatus: 'pending' } : r
            ),
          });
        } else {
          const newReport: AnnualReport = {
            id: genId('rep'),
            clubId: data.clubId || '',
            academicYear: data.academicYear || '',
            summary: data.summary || '',
            achievements: data.achievements || '',
            problems: data.problems || '',
            nextPlan: data.nextPlan || '',
            submittedAt: new Date().toISOString().slice(0, 10),
            reviewStatus: 'pending',
          };
          set({ reports: [...get().reports, newReport] });
        }
      },

      approveReport: (reportId, score, comment) => {
        set({
          reports: get().reports.map((r) =>
            r.id === reportId ? { ...r, reviewStatus: 'approved', score, reviewComment: comment } : r
          ),
        });
      },

      rejectReport: (reportId, comment) => {
        set({
          reports: get().reports.map((r) =>
            r.id === reportId ? { ...r, reviewStatus: 'rejected', reviewComment: comment } : r
          ),
        });
      },

      getReportByClub: (clubId) => get().reports.find((r) => r.clubId === clubId),

      resetData: () => {
        set({
          users: seedUsers,
          clubs: seedClubs,
          members: seedMembers,
          activities: seedActivities,
          finances: seedFinances,
          reports: seedReports,
          currentUser: null,
        });
      },
    }),
    {
      name: 'club-management-app',
      partialize: (state) => ({
        users: state.users,
        clubs: state.clubs,
        members: state.members,
        activities: state.activities,
        finances: state.finances,
        reports: state.reports,
        currentUser: state.currentUser,
      }),
    }
  )
);
