import React, { useState, useEffect } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  X,
  Star,
  MapPin,
  User,
  CheckCircle,
  Sparkles,
  Scissors,
  Phone,
} from 'lucide-react';
import { ReviewTargetType } from '../types';

export const ReviewModal: React.FC = () => {
  const {
    isReviewModalOpen,
    closeReviewModal,
    reviewPreselect,
    locations,
    masters,
    services,
    user,
    addReview,
  } = useBarbershop();

  const [targetType, setTargetType] = useState<ReviewTargetType>('location');
  const [targetId, setTargetId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [atmosphere, setAtmosphere] = useState<number>(5);
  const [quality, setQuality] = useState<number>(5);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isReviewModalOpen) {
      setIsSuccess(false);
      setError('');
      if (reviewPreselect.targetType) {
        setTargetType(reviewPreselect.targetType);
      } else {
        setTargetType('location');
      }

      if (reviewPreselect.targetId) {
        setTargetId(reviewPreselect.targetId);
      } else {
        if (reviewPreselect.targetType === 'master' && masters.length > 0) {
          setTargetId(masters[0].id);
        } else if (locations.length > 0) {
          setTargetId(locations[0].id);
        }
      }

      if (user) {
        setClientName(user.name);
        setClientPhone(user.phone);
      } else {
        setClientName('');
        setClientPhone('');
      }

      setComment('');
      setRating(5);
      setCleanliness(5);
      setAtmosphere(5);
      setQuality(5);
      setServiceName(services[0]?.name || '');
    }
  }, [isReviewModalOpen, reviewPreselect, locations, masters, services, user]);

  if (!isReviewModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Пожалуйста, укажите ваше имя');
      return;
    }
    if (!comment.trim()) {
      setError('Пожалуйста, напишите пару слов о вашем впечатлении');
      return;
    }

    let targetName = '';
    if (targetType === 'location') {
      const loc = locations.find((l) => l.id === targetId) || locations[0];
      targetName = loc?.name || 'Филиал салона';
    } else {
      const m = masters.find((master) => master.id === targetId) || masters[0];
      targetName = m?.name || 'Мастер салона';
    }

    addReview({
      targetType,
      targetId: targetId || (targetType === 'location' ? locations[0]?.id : masters[0]?.id),
      targetName,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      rating,
      aspects: {
        cleanliness,
        atmosphere,
        quality,
      },
      comment: comment.trim(),
      verifiedBooking: true,
      serviceName: serviceName || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      closeReviewModal();
    }, 2000);
  };

  const quickChips = [
    '🔥 Идеальная стрижка и переход!',
    '☕ Очень уютно, вкусный кофе и заботливый сервис',
    '✨ Превосходная чистота и стерильность',
    '👌 Мастер понял всё с полуслова',
    '💎 Цвет волос получился роскошным!',
    '🚀 Быстро, профессионально и по честной цене',
  ];

  const handleAddChip = (chip: string) => {
    if (!comment) {
      setComment(chip);
    } else {
      setComment((prev) => `${prev} ${chip}`);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '⭐ Великолепно, рекомендую!';
      case 4:
        return '👍 Хорошо, остался доволен';
      case 3:
        return '👌 Нормально, всё в порядке';
      case 2:
        return '👎 Есть замечания';
      case 1:
        return '⚠️ Не понравилось';
      default:
        return 'Оценка';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                Оценка и впечатления
              </div>
              <h2 className="text-sm font-bold text-white">
                Оставить отзыв о филиале или мастере
              </h2>
            </div>
          </div>

          <button
            onClick={closeReviewModal}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-brand text-2xl font-bold text-white">
                Спасибо за ваш отзыв!
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Ваша оценка опубликована и поможет другим гостям сделать правильный выбор.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Target Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Кого или что вы хотите оценить:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('location');
                      if (locations.length > 0) setTargetId(locations[0].id);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      targetType === 'location'
                        ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                        : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Филиал (локацию)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('master');
                      if (masters.length > 0) setTargetId(masters[0].id);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      targetType === 'master'
                        ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                        : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Мастера (стилиста / барбера)</span>
                  </button>
                </div>
              </div>

              {/* Target Entity Select */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {targetType === 'location' ? 'Выберите филиал:' : 'Выберите мастера:'}
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  {targetType === 'location'
                    ? locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} — {loc.address}
                        </option>
                      ))
                    : masters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.title})
                        </option>
                      ))}
                </select>
              </div>

              {/* Star Rating Interactive Selector */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <div className="text-xs text-zinc-400">Ваша общая оценка:</div>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                            : 'fill-zinc-800 text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-amber-400">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              </div>

              {/* Criteria Sub-ratings */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Оцените отдельные критерии:
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Чистота и гигиена:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCleanliness(s)}
                        className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold ${
                          cleanliness >= s ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Атмосфера и вежливость:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAtmosphere(s)}
                        className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold ${
                          atmosphere >= s ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Качество стрижки / работы:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuality(s)}
                        className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold ${
                          quality >= s ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Ваше имя <span className="text-amber-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Например, Сардор"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Номер телефона (для отметки «Визит подтвержден»):
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+998 (90) 000-00-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Service Received */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Какую услугу вы делали (опционально):
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Например: Модельная стрижка Fade & Crop или Airtouch"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Ваш подробный отзыв <span className="text-amber-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите, как прошла стрижка, понравился ли результат, напитки и отношение мастера..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Quick Chips */}
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5">Быстрые тезисы (нажмите для добавления):</div>
                <div className="flex flex-wrap gap-1.5">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddChip(chip)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700/60 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-2.5 text-xs rounded-xl bg-red-950/60 border border-red-800 text-red-300">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10"
                >
                  Опубликовать отзыв
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
