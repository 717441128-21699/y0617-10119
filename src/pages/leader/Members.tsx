import { useState } from 'react';
import { Search, UserPlus, Check, X, Users, Phone, Filter, Download, QrCode, Copy, Check as CheckIcon } from 'lucide-react';
import { useStore } from '@/store';
import type { Member, MemberStatus } from '@/types';
import { QRCodeSVG } from 'qrcode.react';

export default function LeaderMembers() {
  const currentUser = useStore((s) => s.currentUser);
  const clubs = useStore((s) => s.clubs);
  const members = useStore((s) => s.members);
  const approveMember = useStore((s) => s.approveMember);
  const rejectMember = useStore((s) => s.rejectMember);
  const [status, setStatus] = useState<MemberStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const myClub = clubs.find((c) => c.leaderId === currentUser?.id);
  const joinLink = window.location.origin + '/club/' + myClub?.id + '?join=true';

  const handleCopyLink = async () => {
    if (!myClub) return;
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const myMembers = myClub ? members.filter((m) => m.clubId === myClub.id) : [];

  if (!myClub) {
    return <div className="card p-12 text-center text-gray-500">您尚未负责任何社团</div>;
  }

  const filtered = myMembers.filter((m) => {
    if (status !== 'all' && m.status !== status) return false;
    if (keyword && !m.name.includes(keyword) && !m.studentId.includes(keyword)) return false;
    return true;
  });

  const counts = {
    all: myMembers.length,
    approved: myMembers.filter((m) => m.status === 'approved').length,
    pending: myMembers.filter((m) => m.status === 'pending').length,
    rejected: myMembers.filter((m) => m.status === 'rejected').length,
  };

  const exportCSV = () => {
    const approved = myMembers.filter((m) => m.status === 'approved');
    const header = '姓名,学号,手机号,部门,加入时间,角色\n';
    const rows = approved.map((m) => `${m.name},${m.studentId},${m.phone},${m.department || ''},${m.joinDate},${m.role}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${myClub.name}-成员名单.csv`;
    link.click();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                status === s ? 'bg-brand-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {s === 'all' ? '全部' : s === 'approved' ? '已通过' : s === 'pending' ? '待审核' : '已驳回'} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索姓名/学号..." className="input-field pl-10 w-48" />
          </div>
          <button onClick={() => setShowQR(true)} className="btn-secondary !px-3 !py-2">
            <QrCode className="w-4 h-4" /> 招新二维码
          </button>
          <button onClick={exportCSV} className="btn-secondary !px-3 !py-2">
            <Download className="w-4 h-4" /> 导出名单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-xs text-white/70">成员总数</p>
              <p className="text-2xl font-bold">{counts.approved}</p>
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-xs text-white/70">待审核</p>
              <p className="text-2xl font-bold">{counts.pending}</p>
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <Check className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-xs text-white/70">干部人数</p>
              <p className="text-2xl font-bold">{myMembers.filter((m) => m.role !== 'member' && m.status === 'approved').length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-xs text-white/70">学院分布</p>
              <p className="text-2xl font-bold">{new Set(myMembers.filter((m) => m.department).map((m) => m.department)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">成员信息</th>
                <th className="table-header">学号</th>
                <th className="table-header">手机号</th>
                <th className="table-header">学院</th>
                <th className="table-header">角色</th>
                <th className="table-header">加入时间</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m: Member) => (
                <tr key={m.id} className="hover:bg-gray-50/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                        {m.name.slice(-2)}
                      </div>
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-700 font-mono text-sm">{m.studentId}</td>
                  <td className="table-cell text-gray-700">{m.phone}</td>
                  <td className="table-cell text-gray-600">{m.department || '-'}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      m.role === 'leader' ? 'bg-brand-100 text-brand-700' :
                      m.role === 'vice_leader' ? 'bg-accent-100 text-accent-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {m.role === 'leader' ? '社长' : m.role === 'vice_leader' ? '副社长' : '成员'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">{m.joinDate}</td>
                  <td className="table-cell">
                    <span className={`badge ${m.status === 'approved' ? 'badge-approved' : m.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                      {m.status === 'approved' ? '已通过' : m.status === 'pending' ? '待审核' : '已驳回'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    {m.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => approveMember(m.id)} className="btn-success !px-3 !py-1.5 text-xs"><Check className="w-4 h-4" /> 通过</button>
                        <button onClick={() => rejectMember(m.id)} className="btn-danger !px-3 !py-1.5 text-xs"><X className="w-4 h-4" /> 拒绝</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>暂无符合条件的成员</p>
          </div>
        )}
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-sm p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">社团招新二维码</h3>
            <p className="text-sm text-gray-500 mb-5">让学生扫码加入「{myClub.name}」</p>
            <div className="w-52 mx-auto bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center">
              <QRCodeSVG
                value={joinLink}
                size={200}
                fgColor="#1e3a8a"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="btn-secondary w-full mt-4 !py-2.5 inline-flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">链接已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制链接
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-5">学生扫码后需填写学号和联系方式，由您审核后正式加入</p>
            <button onClick={() => setShowQR(false)} className="btn-primary w-full mt-5">
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
