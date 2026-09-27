import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  X,
  Tag,
  Percent,
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export const DiscountsModal: React.FC = () => {
  const {
    isDiscountsModalOpen,
    setIsDiscountsModalOpen,
    loyaltyTiers,
    locations,
    user,
    appointments,
    openBookingModal,
  } = useBarbershop();

  const [checkPhone, setCheckPhone] = useState(user?.phone || '+998 (90) ');
  const [hasChecked, setHasChecked] = useState(false);

  if (!isDiscountsModalOpen) return null;

  // Calculate client visits
  const cleanPhone = checkPhone.replace(/\D/g, '');
  const matchingApts = appointments.filter(
    (a) => a.clientPhone.replace(/\D/g, '') === cleanPhone && a.status !== 'cancelled'
  );
  const visits = matchingApts.length;

  let currentTier = loyaltyTiers[0];
  if (visits >= 10) currentTier = loyaltyTiers[3];
  else if (visits >= 6) currentTier = loyaltyTiers[2];
  else if (visits >= 3) currentTier = loyaltyTiers[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-500 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                Программа лояльности
              </div>
              <h2 className="text-base font-bold text-white">
                Скидки для постоянных клиентов
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsDiscountsModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Каждый визит делает ваши стрижки выгоднее</span>
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              Мы благодарим наших постоянных гостей. Чем чаще вы посещаете салоны и барбершопы DURANDESH, тем выше ваш статус и процент скидки на все стрижки, бритье, маникюр и окрашивание!
            </p>
          </div>

          {/* Loyalty Tiers Grid */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Уровни скидок для постоянных гостей:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loyaltyTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{tier.badge}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold text-xs">
                      -{tier.discountPercent}%
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 font-medium">
                    Условие: {tier.minVisits === 0 ? 'Первый визит в салон' : `От ${tier.minVisits} завершенных визитов`}
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Phone Checker */}
          <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Проверить вашу личную скидку по номеру:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={checkPhone}
                onChange={(e) => {
                  setCheckPhone(e.target.value);
                  setHasChecked(false);
                }}
                placeholder="+998 (90) 000-00-00"
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setHasChecked(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
              >
                Рассчитать статус
              </button>
            </div>

            {hasChecked && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-zinc-400 text-[11px]">История записей:</div>
                  <div className="font-bold text-white text-xs">{visits} подтвержденных визитов</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-[11px]">Ваш уровень:</div>
                  <div className="font-bold text-amber-400 text-xs">{currentTier.badge} (-{currentTier.discountPercent}%)</div>
                </div>
              </div>
            )}
          </div>

          {/* Branch Participation Breakdown */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Где действуют скидки (филиалы сети):</span>
            </div>

            <div className="space-y-2">
              {locations.map((loc) => {
                const isEnabled = loc.discountsEnabled !== false;

                return (
                  <div
                    key={loc.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-white">{loc.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {loc.discountDescription || (isEnabled ? `Скидки для постоянных клиентов до ${loc.discountPercentage || 15}%` : 'Стандартный прайс')}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {isEnabled ? `✓ Скидки активны (до ${loc.discountPercentage || 15}%)` : 'Фиксированный прайс'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">
              Скидка применяется автоматически при онлайн-записи
            </span>
            <button
              onClick={() => {
                setIsDiscountsModalOpen(false);
                openBookingModal();
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Записаться со скидкой</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
