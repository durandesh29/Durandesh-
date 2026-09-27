import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  Filter,
  PlusCircle,
  MessageCircle,
} from 'lucide-react';
import { ReviewTargetType } from '../types';

export const ReviewsSection: React.FC = () => {
  const {
    reviews,
    locations,
    masters,
    likeReview,
    openReviewModal,
    openChat,
  } = useBarbershop();

  const [activeTab, setActiveTab] = useState<'all' | ReviewTargetType>('all');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (activeTab !== 'all' && rev.targetType !== activeTab) return false;
    if (selectedTargetId !== 'all' && rev.targetId !== selectedTargetId) return false;
    if (minRating > 0 && rev.rating < minRating) return false;
    return true;
  });

  // Calculate statistics
  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(2)
    : '5.0';
  const fiveStarPercentage = totalCount > 0
    ? Math.round((reviews.filter((r) => r.rating === 5).length / totalCount) * 100)
    : 100;

  return (
    <section id="reviews" className="py-20 bg-zinc-950 border-b border-zinc-800 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>Честные отзывы клиентов</span>
          </div>
          <h2 className="font-brand text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Оценки локаций и любимых мастеров
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Мы ценим доверие наших гостей. Читайте реальные впечатления о чистоте залов, атмосфере в филиалах и качестве работы колористов и барберов.
          </p>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl shadow-zinc-950/40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Score block */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-zinc-800 pb-6 md:pb-0 md:pr-8">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono">
                  {avgRating}
                </span>
                <span className="text-lg text-zinc-500 font-semibold">/ 5.0</span>
              </div>
              
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="text-xs text-zinc-400">
                На основе <span className="font-semibold text-white">{totalCount} отзывов</span> реальных клиентов
              </div>
              
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>99% гостей рекомендуют нас друзьям</span>
              </div>
            </div>

            {/* Criteria breakdown & benefits */}
            <div className="md:col-span-5 space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Чистота и стерильность:</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '99%' }} />
                  </div>
                  <span className="font-mono font-bold text-white">5.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Атмосфера и комфорт в филиалах:</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                  <span className="font-mono font-bold text-white">4.9</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Качество стрижек и окрашивания:</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="font-mono font-bold text-white">5.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Сервис и программа лояльности:</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '97%' }} />
                  </div>
                  <span className="font-mono font-bold text-white">4.9</span>
                </div>
              </div>
            </div>

            {/* Call to action: Write review */}
            <div className="md:col-span-3 flex flex-col gap-3 justify-center items-stretch md:items-end">
              <button
                onClick={() => openReviewModal()}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Оставить свой отзыв</span>
              </button>

              <button
                onClick={() => openChat()}
                className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>Задать вопрос в чате</span>
              </button>
            </div>

          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          
          {/* Target Type Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedTargetId('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Все отзывы ({reviews.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('location');
                setSelectedTargetId('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'location'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>О филиалах ({reviews.filter((r) => r.targetType === 'location').length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('master');
                setSelectedTargetId('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'master'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>О мастерах ({reviews.filter((r) => r.targetType === 'master').length})</span>
            </button>
          </div>

          {/* Sub-filters: Select specific entity */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {activeTab === 'location' && (
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Все филиалы</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === 'master' && (
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Все мастера</option>
                {masters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setMinRating(minRating === 5 ? 0 : 5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                minRating === 5
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Только 5 звёзд</span>
            </button>
          </div>

        </div>

        {/* Reviews Cards Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  
                  {/* Top Bar: Target badge & Date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          rev.targetType === 'location'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {rev.targetType === 'location' ? (
                          <MapPin className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        <span>{rev.targetName}</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 shrink-0 font-mono">
                      {rev.date}
                    </span>
                  </div>

                  {/* Rating Stars & Verified check */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-zinc-800 text-zinc-700'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 font-bold text-xs text-white">
                        {rev.rating}.0
                      </span>
                    </div>

                    {rev.verifiedBooking && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Визит подтвержден</span>
                      </div>
                    )}
                  </div>

                  {/* Service tag if available */}
                  {rev.serviceName && (
                    <div className="text-[11px] font-medium text-amber-400/90 mb-2">
                      Услуга: {rev.serviceName}
                    </div>
                  )}

                  {/* Comment Body */}
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    "{rev.comment}"
                  </p>

                  {/* Aspects criteria pills if defined */}
                  {rev.aspects && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rev.aspects.cleanliness && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                          Чистота: {rev.aspects.cleanliness}/5
                        </span>
                      )}
                      {rev.aspects.atmosphere && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                          Атмосфера: {rev.aspects.atmosphere}/5
                        </span>
                      )}
                      {rev.aspects.quality && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                          Качество: {rev.aspects.quality}/5
                        </span>
                      )}
                    </div>
                  )}

                  {/* Admin Reply if present */}
                  {rev.adminReply && (
                    <div className="mt-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-amber-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" />
                          <span>{rev.adminReply.author}</span>
                        </span>
                        <span className="text-zinc-600 text-[10px] font-mono">{rev.adminReply.date}</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        {rev.adminReply.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Client Name + Like button */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      {rev.clientName.charAt(0)}
                    </div>
                    <span className="font-semibold text-zinc-200">
                      {rev.clientName}
                    </span>
                  </div>

                  <button
                    onClick={() => likeReview(rev.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-amber-400 transition-colors"
                    title="Полезный отзыв"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">{rev.likes || 0}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl p-8">
            <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <div className="text-sm font-semibold text-zinc-300 mb-1">
              По выбранным фильтрам пока нет отзывов
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Будьте первым, кто поделится своими впечатлениями о филиале или мастере!
            </p>
            <button
              onClick={() => openReviewModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all"
            >
              Написать первый отзыв
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
