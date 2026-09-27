import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { Master, MasterPortfolioItem } from '../types';
import { Star, Award, Calendar, Scissors, Eye, X, ChevronRight, MessageCircle } from 'lucide-react';

export const MastersSection: React.FC = () => {
  const { masters, locations, openBookingModal, openChat, openReviewModal } = useBarbershop();

  // Selected portfolio item for lightbox preview
  const [activePortfolioModal, setActivePortfolioModal] = useState<{
    master: Master;
    item: MasterPortfolioItem;
  } | null>(null);

  return (
    <section id="masters" className="py-20 bg-zinc-900/40 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            <Award className="w-4 h-4" />
            <span>Команда профессионалов & Портфолио</span>
          </div>
          <h2 className="font-brand text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Мастера и примеры реальных работ
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Посмотрите фотографии стрижек, сложного окрашивания, маникюра и оформления бороды, выполненных нашими стилистами на реальных людях.
          </p>
        </div>

        {/* Masters List */}
        <div className="space-y-12">
          {masters.map((master) => {
            const masterLocations = locations.filter((l) => master.locationIds.includes(l.id));

            return (
              <div
                key={master.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 transition-all hover:border-zinc-700"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Master Profile (Avatar, details, bio) - 5 cols */}
                  <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-6 items-start">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 shadow-lg">
                      <img
                        src={master.avatar}
                        alt={master.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/src/assets/images/barber_alex_1790180895959.jpg';
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{master.name}</h3>
                      </div>
                      <div className="text-xs font-medium text-amber-400 mb-3">{master.title}</div>

                      {/* Stats: unboxed text with subtle typographic separators */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openReviewModal({ targetType: 'master', targetId: master.id })}
                          className="flex items-center gap-1 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                          title="Посмотреть отзывы или оценить мастера"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{master.rating}</span>
                          <span className="text-zinc-500 font-normal">({master.reviewsCount} отзывов)</span>
                        </button>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span>Опыт {master.experienceYears} лет</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                        {master.bio}
                      </p>

                      <div className="text-[11px] text-zinc-500 mb-5">
                        <span className="font-semibold text-zinc-400">Принимает в филиалах: </span>
                        {masterLocations.map((l) => l.name).join(', ') || 'Все филиалы'}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        <button
                          onClick={() => openBookingModal({ masterId: master.id })}
                          className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Записаться к {master.name.split(' ')[0]}</span>
                        </button>

                        <button
                          onClick={() => openChat({ masterId: master.id })}
                          className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          title="Задать вопрос мастеру в чате"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Чат</span>
                        </button>

                        <button
                          onClick={() => openReviewModal({ targetType: 'master', targetId: master.id })}
                          className="px-3 py-2.5 bg-zinc-800/80 hover:bg-zinc-750 text-amber-400 text-xs font-semibold rounded-xl border border-zinc-700/60 transition-colors flex items-center justify-center gap-1"
                          title="Написать отзыв о мастере"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Отзыв</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio of haircuts done by this master - 7 cols */}
                  <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                        <Scissors className="w-3.5 h-3.5 text-amber-500" />
                        <span>Примеры работ мастера ({master.portfolio?.length || 0})</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">Нажмите на фото для просмотра</span>
                    </div>

                    {master.portfolio && master.portfolio.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {master.portfolio.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setActivePortfolioModal({ master, item })}
                            className="group/photo relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/haircut_fade_1790180920358.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-80 group-hover/photo:opacity-100 transition-opacity" />
                            
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-[11px] font-semibold text-white truncate">
                                {item.haircutType || item.title}
                              </div>
                            </div>

                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center text-zinc-300 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        Портфолио мастера наполняется новыми фотографиями стрижек.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox / Modal for inspecting haircut photo */}
        {activePortfolioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              
              <button
                onClick={() => setActivePortfolioModal(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-zinc-950/70 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                <img
                  src={activePortfolioModal.item.imageUrl}
                  alt={activePortfolioModal.item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Работа мастера: {activePortfolioModal.master.name}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {activePortfolioModal.item.title}
                </h3>

                {activePortfolioModal.item.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                    {activePortfolioModal.item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="text-xs text-zinc-400">
                    Вид стрижки: <span className="text-white font-medium">{activePortfolioModal.item.haircutType || 'Индивидуальная форма'}</span>
                  </div>

                  <button
                    onClick={() => {
                      const masterId = activePortfolioModal.master.id;
                      setActivePortfolioModal(null);
                      openBookingModal({ masterId });
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Хочу такую же стрижку</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
