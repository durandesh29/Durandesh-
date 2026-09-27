import React from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Check,
  Star,
  Percent,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export const LocationsSection: React.FC = () => {
  const {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    openBookingModal,
    openReviewModal,
    openChat,
    setIsDiscountsModalOpen,
  } = useBarbershop();

  return (
    <section id="locations" className="py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>Сеть филиалов</span>
          </div>
          <h2 className="font-brand text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Салоны и парикмахерские рядом с вами
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
            Выберите удобную локацию в Ташкенте. В каждом филиале вас ждут комфортная зона отдыха, бесплатные напитки и высокий стандарт сервиса.
          </p>

          <button
            onClick={() => setIsDiscountsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Узнать про программу скидок для постоянных клиентов</span>
          </button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((loc) => {
            const isSelected = loc.id === selectedLocationId;
            const hasDiscounts = loc.discountsEnabled !== false;

            return (
              <div
                key={loc.id}
                className={`group rounded-2xl bg-zinc-900 border transition-all duration-300 flex flex-col overflow-hidden ${
                  isSelected
                    ? 'border-amber-500/80 shadow-xl shadow-amber-500/10'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Branch image */}
                <div className="relative aspect-[16/9] w-full bg-zinc-800 overflow-hidden">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_barbershop_1790180882360.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                  
                  {/* Branch format badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md flex items-center gap-1">
                      {loc.businessType === 'beauty_salon'
                        ? '💅 Салон красоты'
                        : loc.businessType === 'barbershop'
                        ? '💈 Барбершоп'
                        : '✨ Универсальный'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white drop-shadow-md">
                        {loc.brandName || loc.name}
                      </h3>
                      {loc.tagline && (
                        <p className="text-[11px] text-amber-300/90 font-medium drop-shadow line-clamp-1">
                          {loc.tagline}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-zinc-950 shrink-0 ml-2">
                        Выбран
                      </span>
                    )}
                  </div>
                </div>

                {/* Branch Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5 text-xs text-zinc-300">
                    
                    {/* Discount & Rating Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                      {hasDiscounts ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Percent className="w-3 h-3" />
                          <span>Скидки постоянным: до {loc.discountPercentage || 15}%</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                          <span>Фиксированный прайс</span>
                        </span>
                      )}

                      <button
                        onClick={() => openReviewModal({ targetType: 'location', targetId: loc.id })}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold hover:text-amber-300"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{loc.rating || 4.95} ({loc.reviewsCount || 120})</span>
                      </button>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">{loc.address}</div>
                        <div className="text-amber-400 font-medium text-[11px] mt-0.5">{loc.metro}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Ежедневно: {loc.workingHours}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                      <a href={`tel:${loc.phone}`} className="hover:text-amber-400 transition-colors font-mono">
                        {loc.phone}
                      </a>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors border ${
                          isSelected
                            ? 'bg-zinc-800 text-white border-zinc-700'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {isSelected ? 'Активный филиал' : 'Выбрать филиал'}
                      </button>

                      <button
                        onClick={() => openBookingModal({ locationId: loc.id })}
                        className="py-2 px-3.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors whitespace-nowrap"
                      >
                        Записаться сюда
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openChat({ locationId: loc.id })}
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Чат с филиалом</span>
                      </button>

                      <button
                        onClick={() => openReviewModal({ targetType: 'location', targetId: loc.id })}
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>Оставить отзыв</span>
                      </button>
                    </div>

                    <a
                      href="#yandex-map"
                      onClick={() => setSelectedLocationId(loc.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-amber-400 hover:text-amber-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Маршрут и Яндекс Такси на карте</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
