import React from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { Calendar, MapPin, Star, Award, Shield, Clock } from 'lucide-react';

export const Hero: React.FC = () => {
  const { settings, locations, selectedLocationId, setSelectedLocationId, openBookingModal } = useBarbershop();

  const activeLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const currentHeroImage = activeLocation?.heroImage || settings.heroImage;
  const currentHeroTitle = activeLocation?.heroTitle || (activeLocation?.brandName ? `${activeLocation.brandName} — Премиальный стиль & уход` : settings.heroTitle);
  const currentHeroSubtitle = activeLocation?.heroSubtitle || (activeLocation?.tagline ? `${activeLocation.tagline}. Онлайн-запись по адресу: ${activeLocation.address}` : settings.heroSubtitle);
  const currentBrandTagline = activeLocation?.tagline || settings.tagline;

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-zinc-800">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentHeroImage}
          alt={activeLocation?.name || settings.appName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-zinc-950/40 to-zinc-950/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        
        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium tracking-widest uppercase mb-6 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{currentBrandTagline || 'Салон красоты & парикмахерская'}</span>
        </div>

        {/* Title with balanced wrap */}
        <h1 className="font-brand text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          {currentHeroTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          {currentHeroSubtitle}
        </p>

        {/* Locations quick switcher bar */}
        <div className="max-w-3xl mx-auto bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-8 shadow-2xl">
          <div className="text-xs text-zinc-400 font-medium mb-3 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Филиалы рядом с вами — выберите для быстрой записи:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {locations.map((loc) => {
              const isSelected = loc.id === selectedLocationId;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`p-3 rounded-xl text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                      : 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-bold truncate">{loc.name}</div>
                    <span className={`text-[10px] shrink-0 font-medium ${isSelected ? 'text-zinc-900/90' : 'text-amber-400'}`}>
                      {loc.businessType === 'beauty_salon'
                        ? '💅 Салон'
                        : loc.businessType === 'barbershop'
                        ? '💈 Барбер'
                        : '✨ Универсал'}
                    </span>
                  </div>
                  <div className={`text-[11px] truncate mt-1 ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {loc.metro}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openBookingModal({ locationId: activeLocation?.id })}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-bold text-sm tracking-wide uppercase rounded-xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Записаться онлайн в {activeLocation?.name || 'салон'}</span>
          </button>
          
          <a
            href="#services"
            className="w-full sm:w-auto px-6 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm rounded-xl border border-zinc-800 transition-colors"
          >
            Смотреть услуги и цены
          </a>
        </div>

        {/* Features row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-8 border-t border-zinc-800/70 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Топ-мастера</div>
              <div className="text-xs text-zinc-500">Опыт от 5 до 10 лет</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">100% стерильность</div>
              <div className="text-xs text-zinc-500">СанПиН стандарт</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Без очередей</div>
              <div className="text-xs text-zinc-500">Точно к назначенному времени</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">3 локации</div>
              <div className="text-xs text-zinc-500">Рядом с метро в центре</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
