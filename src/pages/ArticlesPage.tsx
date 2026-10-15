import React, { useState } from 'react';
import { Article } from '../types';
import { ChevronRight, Calendar, User, Clock, Search, ArrowRight, X, BookOpen, Share2 } from 'lucide-react';

interface ArticlesPageProps {
  articles: Article[];
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ articles }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ['ทั้งหมด', 'ประวัติและวัฒนธรรม', 'พฤกษศาสตร์', 'การดูแลรักษา', 'การจัดสวน'];

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== 'ทั้งหมด' && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-body">
      {/* Breadcrumb & Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">บทความและเกร็ดความรู้</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#183D2B]">
          คลังความรู้พฤกษศาสตร์และภูมิปัญญาไทย
        </h1>
        <p className="text-xs text-[#7A746B] max-w-3xl leading-relaxed">
          บทความวิชาการเชิงลึก ประวัติศาสตร์ต้นไม้ในวรรณคดี เทคนิคการปลูกและขยายพันธุ์
          ตลอดจนการดูแลรักษาเพื่อความสวยงามและความปลอดภัย
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#183D2B] text-white'
                  : 'bg-white text-[#7A746B] hover:text-[#183D2B] border border-[#EEE7DA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#C6A96B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อบทความ หรือเนื้อหา..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-[#EEE7DA] text-xs focus:outline-none focus:border-[#C6A96B]"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#EEE7DA] text-center text-xs text-[#7A746B]">
          ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <article
              key={art.articleId}
              onClick={() => setActiveArticle(art)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#EEE7DA] hover:border-[#C6A96B] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden bg-stone-200">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#7A746B]">
                    <span className="font-semibold text-[#183D2B]">{art.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#183D2B] group-hover:text-[#A48545] transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h2>
                  <p className="text-xs text-[#49382C] line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#EEE7DA] mt-4 flex items-center justify-between text-xs text-[#7A746B]">
                <span className="truncate max-w-[180px]">{art.author}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#183D2B] group-hover:text-[#A48545]">
                  <span>อ่านฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6A96B]" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#FAF7F0] rounded-2xl shadow-2xl border border-[#C6A96B]/40 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#183D2B] text-white flex items-center justify-between border-b border-[#C6A96B]/30 shrink-0">
              <span className="text-xs text-[#C6A96B] font-semibold tracking-wider uppercase">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 font-body">
              <div className="aspect-[21/9] w-full rounded-xl overflow-hidden bg-stone-200 shadow-md">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-[#7A746B] flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#C6A96B]" />
                    {activeArticle.author}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C6A96B]" />
                    เผยแพร่ {activeArticle.publishedAt}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C6A96B]" />
                    เวลาอ่าน {activeArticle.readTime}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] leading-tight">
                  {activeArticle.title}
                </h1>
              </div>

              {/* Formatted Article Content */}
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-[#49382C] leading-relaxed whitespace-pre-line border-t border-[#EEE7DA] pt-4">
                {activeArticle.content}
              </div>
              {activeArticle.referenceUrl && (
                <div className="rounded-xl border border-[#EEE7DA] bg-[#FAF7F0] p-4 text-xs">
                  <strong className="text-[#183D2B]">แหล่งอ้างอิงภายนอก</strong>
                  <p className="mt-1"><a href={activeArticle.referenceUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all" onClick={(event) => event.stopPropagation()}>{activeArticle.referenceUrl}</a></p>
                </div>
              )}

              <div className="pt-6 border-t border-[#EEE7DA] flex items-center justify-between text-xs text-[#7A746B]">
                <span>จัดทำโดย SACRED CANOPY บทความทางวิชาการ</span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 bg-[#183D2B] text-white rounded-lg font-semibold hover:bg-[#25523B]"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
