import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { Service, ServiceCategory } from '../types';
import { Clock, Scissors, Sparkles, Check, ArrowRight } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const { services, settings, openBookingModal } = useBarbershop();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');

  const categories: { key: ServiceCategory; label: string }[] = [
    { key: 'all', label: 'Все услуги' },
    { key: 'hair_women', label: 'Женский зал' },
    { key: 'hair_men', label: 'Мужской зал & Барбер' },
    { key: 'coloring', label: 'Окрашивание' },
    { key: 'nails', label: 'Ногтевой сервис' },
    { key: 'brows_lashes', label: 'Брови & Ресницы' },
    { key: 'cosmetology', label: 'Косметология & СПА' },
    { key: 'combo', label: 'Комплексы' },
  ];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter((s) => {
        if (activeCategory === 'hair_men') {
          return s.category === 'hair_men' || s.category === 'haircut' || s.category === 'beard';
        }
        return s.category === activeCategory;
      });

  return (
    <section id="services" className="py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            <Scissors className="w-4 h-4" />
            <span>Услуги парикмахерской & салона красоты</span>
          </div>
          <h2 className="font-brand text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Каталог услуг и стоимость
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Полный спектр услуг: от модельных женских и мужских стрижек, сложного окрашивания (Airtouch, Balayage) до премиального маникюра, оформления бороды и спа-уходов.
          </p>
        </div>

        {/* Category Filter Tabs (Zero-pill discipline: segmented control buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl mx-auto mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
            >
              {/* Service Photo with fallbacks */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                <img
                  src={service.image}
                  alt={service.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if image path fails
                    (e.currentTarget as HTMLImageElement).src = '/src/assets/images/haircut_fade_1790180920358.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                
                {service.popular && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-500 text-zinc-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-zinc-950" />
                    <span>Популярно</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{service.durationMinutes} мин</span>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                      {service.price.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                    {service.oldPrice && (
                      <span className="text-xs text-zinc-500 line-through font-mono tabular-nums">
                        {service.oldPrice.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openBookingModal({ serviceId: service.id })}
                    className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 group-hover:shadow-md"
                  >
                    <span>Записаться</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center text-xs text-zinc-400">
          Точная стоимость может корректироваться мастером в зависимости от длины волос и сложности моделирования.
        </div>

      </div>
    </section>
  );
};
