export type UserRole = 'admin' | 'leader' | 'student';

export interface User {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  password?: string;
}

export type ClubStatus = 'pending' | 'approved' | 'rejected';
export type ClubCategory = '科技类' | '文艺类' | '体育类' | '学术类' | '公益类' | '其他';

export interface Club {
  id: string;
  name: string;
  logo?: string;
  slogan: string;
  description: string;
  constitution: string;
  category: ClubCategory;
  status: ClubStatus;
  leaderId: string;
  leaderInfo: {
    name: string;
    studentId: string;
    phone: string;
  };
  activityPlan: string;
  memberCount: number;
  createdAt: string;
  approvedAt?: string;
  rejectReason?: string;
  coverImage?: string;
}

export type MemberStatus = 'pending' | 'approved' | 'rejected';
export type MemberRole = 'member' | 'vice_leader' | 'leader';

export interface Member {
  id: string;
  clubId: string;
  studentId: string;
  name: string;
  phone: string;
  joinDate: string;
  status: MemberStatus;
  role: MemberRole;
  department?: string;
}

export type ActivityStatus = 'draft' | 'pending' | 'approved' | 'published' | 'ended' | 'rejected';

export interface Activity {
  id: string;
  clubId: string;
  title: string;
  description: string;
  cover?: string;
  startTime: string;
  endTime: string;
  location: string;
  venueApplication: {
    venue: string;
    timeSlot: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectReason?: string;
    reviewComment?: string;
  };
  budgetApplication: {
    total: number;
    items: { name: string; amount: number; remark?: string }[];
    status: 'pending' | 'approved' | 'rejected';
    rejectReason?: string;
    reviewComment?: string;
  };
  capacity: number;
  registeredCount: number;
  status: ActivityStatus;
  registrations: ActivityRegistration[];
  attendances: Attendance[];
  createdAt: string;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  studentId: string;
  name: string;
  registeredAt: string;
  status: 'registered' | 'cancelled';
}

export interface Attendance {
  id: string;
  activityId: string;
  studentId: string;
  name: string;
  checkedInAt: string;
}

export type FinanceType = 'income' | 'expense';
export type FinanceCategory =
  | '会费收入'
  | '赞助收入'
  | '学校拨款'
  | '场地费'
  | '物料费'
  | '餐饮费'
  | '奖品费'
  | '宣传费'
  | '活动预算'
  | '其他';

export interface FinanceRecord {
  id: string;
  clubId: string;
  activityId?: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  description: string;
  date: string;
  reviewer?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
}

export interface AnnualReport {
  id: string;
  clubId: string;
  academicYear: string;
  summary: string;
  achievements: string;
  problems: string;
  nextPlan: string;
  submittedAt: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  score?: number;
  reviewComment?: string;
}

export interface FinanceReport {
  clubId: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  records: FinanceRecord[];
  byCategory: Record<string, number>;
}
