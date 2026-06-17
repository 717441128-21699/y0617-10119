import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Sparkles, ArrowRight, Filter, Building2 } from 'lucide-react';
import { useStore } from '@/store';
import type { ClubCategory } from '@/types';

const categories: (ClubCategory | '全部')[] = ['全部', '科技类', '文艺类', '体育类', '学术类', '公益类', '其他'];

const categoryColors: Record<string, string> = {
  科技类: 'bg-blue-100 text-blue-700',
  文艺类: 'bg-purple-100 text-purple-700',
  体育类: 'bg-emerald-100 text-emerald-700',
  学术类: 'bg-amber-100 text-amber-700',
  公益类: 'bg-rose-100 text-rose-700',
  其他: 'bg-gray-100 text-gray-700',
};

export default function StudentHome() {
  const navigate = useNavigate();
  const clubs = useStore((s) => s.clubs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | '全部'>('全部');

  const approvedClubs = useMemo(() => clubs.filter((c) => c.status === 'approved'), [clubs]);

  const filteredClubs = useMemo(() => {
    return approvedClubs.filter((club) => {
      const matchesCategory = selectedCategory === '全部' || club.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.slogan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedClubs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="card p-8 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-grid" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-400 rounded-full blur-3xl opacity-20" />

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm mb-5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span className="text-white/80">发现属于你的社团</span>
            </div>
            <h1 className="hero-title text-5xl md:text-6xl mb-4">探索校园社团生活</h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              汇聚全校优秀社团，找到志同道合的伙伴，开启精彩的大学之旅
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索社团名称、口号或介绍..."
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-900 placeholder:text-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-accent-500/30 transition-all"
              />
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{approvedClubs.length} 个认证社团</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{approvedClubs.reduce((sum, c) => sum + c.memberCount, 0)} 名活跃成员</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-brand-700 to-brand-900 text-white shadow-lg shadow-brand-900/25'
                  : 'bg-white text-gray-600 hover:bg-brand-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">
              <Building2 className="w-6 h-6 text-brand-600" />
              {selectedCategory === '全部' ? '全部社团' : selectedCategory}
              <span className="ml-2 text-sm font-normal text-gray-400">共 {filteredClubs.length} 个</span>
            </h2>
          </div>

          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className="card card-hover overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => navigate(`/club/${club.id}`)}
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand-100 to-accent-100">
                    {club.coverImage ? (
                      <img
                        src={club.coverImage}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-brand-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${categoryColors[club.category] || categoryColors['其他']}`}>
                        {club.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-white/90 text-gray-700 backdrop-blur-sm">
                        <Users className="w-3 h-3" />
                        {club.memberCount}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1.5 group-hover:text-brand-700 transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-sm text-brand-600 font-medium mb-3">"{club.slogan}"</p>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{club.description}</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/club/${club.id}`);
                      }}
                      className="btn-primary w-full !py-2.5 text-sm group/btn"
                    >
                      查看详情
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">暂无匹配的社团</h3>
              <p className="text-gray-400">换个关键词或分类试试吧</p>
            </div>
          )}
        </div>
      </div>
  );
}
