import React, { useState, useEffect } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  X,
  MapPin,
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  Phone,
  ShieldCheck,
  Percent,
  Award,
  Sparkles,
  Tag,
} from 'lucide-react';

interface BookingModalProps {
  onOpenMyAppointments: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ onOpenMyAppointments }) => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingPreselect,
    locations,
    services,
    masters,
    appointments,
    createAppointment,
    user,
    loginUser,
    settings,
    calculateLoyaltyDiscount,
  } = useBarbershop();

  // Wizard step: 1 (Branch) -> 2 (Service) -> 3 (Master) -> 4 (Date & Time) -> 5 (Client Phone & Confirmation) -> 6 (Success Ticket)
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedMasterId, setSelectedMasterId] = useState<string>(''); // '' means any available master
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+998 (90) ');
  const [notes, setNotes] = useState<string>('');
  const [smsCode, setSmsCode] = useState<string>('');
  const [isSmsSent, setIsSmsSent] = useState<boolean>(false);
  const [generatedSmsCode, setGeneratedSmsCode] = useState<string>('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Handle preselects when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setValidationError('');
      setIsSmsSent(false);

      if (bookingPreselect.locationId) {
        setSelectedLocId(bookingPreselect.locationId);
      } else if (locations.length > 0) {
        setSelectedLocId(locations[0].id);
      }

      if (bookingPreselect.serviceId) {
        setSelectedServiceId(bookingPreselect.serviceId);
        setStep(2);
      } else {
        setSelectedServiceId(services[0]?.id || '');
      }

      if (bookingPreselect.masterId) {
        setSelectedMasterId(bookingPreselect.masterId);
        setStep(3);
      } else {
        setSelectedMasterId('');
      }

      // Default to tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      setSelectedTime('14:00');

      if (user) {
        setClientName(user.name);
        setClientPhone(user.phone);
      }
    }
  }, [isBookingModalOpen, bookingPreselect, locations, services, user]);

  if (!isBookingModalOpen) return null;

  const currentLocation = locations.find((l) => l.id === selectedLocId) || locations[0];
  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentMaster = masters.find((m) => m.id === selectedMasterId);

  // Loyalty and regular customer discount calculation
  const loyaltyData = calculateLoyaltyDiscount(clientPhone || user?.phone || 0, selectedLocId);
  const discountAmount = loyaltyData.discountAmount(currentService?.price || 0);
  const finalTotalPrice = Math.max(0, (currentService?.price || 0) - discountAmount);

  // Masters available at selected location
  const availableMasters = masters.filter(
    (m) => !selectedLocId || m.locationIds.includes(selectedLocId)
  );

  // Next 14 days dates generator
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('ru-RU', { month: 'short' });
      days.push({ iso, weekday, dayNum, month, isToday: i === 0 });
    }
    return days;
  };

  const timeSlots = [
    '10:00', '10:45', '11:30', '12:15', '13:00', '14:00',
    '15:00', '15:45', '16:30', '17:15', '18:00', '19:00', '20:00', '21:00'
  ];

  // Check if slot is booked
  const isSlotBooked = (time: string) => {
    return appointments.some(
      (a) =>
        a.locationId === selectedLocId &&
        a.date === selectedDate &&
        a.time === time &&
        (selectedMasterId === '' || a.masterId === selectedMasterId) &&
        a.status === 'confirmed'
    );
  };

  // Trigger simulated SMS verification
  const handleSendSms = () => {
    const rawDigits = clientPhone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setValidationError('Пожалуйста, введите корректный номер телефона (не менее 10 цифр)');
      return;
    }
    setValidationError('');
    const mockCode = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedSmsCode(mockCode);
    setIsSmsSent(true);
  };

  const handleConfirmBooking = () => {
    if (!user) {
      if (!isSmsSent) {
        handleSendSms();
        return;
      }
      if (smsCode !== generatedSmsCode && smsCode !== '1234') {
        setValidationError('Неверный проверочный SMS-код. Введите код из подсказки.');
        return;
      }
      // Log user in
      loginUser(clientPhone, clientName || 'Гость');
    }

    // Determine master if "any" was selected
    const assignedMaster =
      currentMaster ||
      availableMasters[0] ||
      masters[0];

    const newApt = createAppointment({
      clientName: clientName.trim() || 'Клиент',
      clientPhone: clientPhone.trim(),
      locationId: selectedLocId,
      masterId: assignedMaster.id,
      serviceId: selectedServiceId,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmed',
      totalPrice: finalTotalPrice,
      notes: notes.trim(),
    });

    setCreatedAppointmentId(newApt.id);
    setStep(6); // Success
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div>
            <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              Онлайн-запись в {settings.appName}
            </div>
            <div className="text-sm font-bold text-white">
              {step === 1 && 'Шаг 1 из 5: Выбор филиала'}
              {step === 2 && 'Шаг 2 из 5: Выбор стрижки или услуги'}
              {step === 3 && 'Шаг 3 из 5: Выбор мастера'}
              {step === 4 && 'Шаг 4 из 5: Дата и время записи'}
              {step === 5 && 'Шаг 5 из 5: Номер телефона и подтверждение'}
              {step === 6 && 'Запись успешно подтверждена!'}
            </div>
          </div>

          <button
            onClick={closeBookingModal}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 6 && (
          <div className="w-full bg-zinc-800 h-1 shrink-0">
            <div
              className="bg-amber-500 h-1 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body with internal scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: CHOOSE BRANCH */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 mb-2">
                Выберите ближайший филиал парикмахерской для визита:
              </div>

              <div className="space-y-3">
                {locations.map((loc) => {
                  const isSelected = loc.id === selectedLocId;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocId(loc.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{loc.name}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{loc.address}</div>
                          <div className="text-[11px] text-amber-400 mt-1">{loc.metro} · {loc.workingHours}</div>
                          
                          {/* Discount badge */}
                          <div className="mt-1.5">
                            {loc.discountsEnabled !== false ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <Percent className="w-2.5 h-2.5" />
                                <span>Скидки для постоянных гостей (до {loc.discountPercentage || 15}%)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] text-zinc-500 px-2 py-0.5 rounded-md bg-zinc-800/80">
                                🔒 Фиксированный прайс
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE SERVICE / HAIRCUT */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 mb-2">
                Выберите услугу парикмахерской или салона красоты:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = srv.id === selectedServiceId;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="flex gap-3 items-start mb-2">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                          <img
                            src={srv.image}
                            alt={srv.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/src/assets/images/haircut_fade_1790180920358.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-xs text-white line-clamp-1">{srv.name}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{srv.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{srv.durationMinutes} мин</span>
                        </div>
                        <div className="font-bold text-amber-400 font-mono tabular-nums">
                          {srv.price.toLocaleString('ru-RU')} {settings.currency}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE MASTER */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 mb-2">
                Выберите специалиста для филиала «{currentLocation?.name}»:
              </div>

              {/* Option: Any Master */}
              <div
                onClick={() => setSelectedMasterId('')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedMasterId === ''
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-600 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Любой свободный мастер</div>
                    <div className="text-xs text-zinc-400">Назначим ближайшего доступного специалиста</div>
                  </div>
                </div>
                {selectedMasterId === '' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {availableMasters.map((master) => {
                  const isSelected = master.id === selectedMasterId;
                  return (
                    <div
                      key={master.id}
                      onClick={() => setSelectedMasterId(master.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
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
                        <div>
                          <div className="font-bold text-sm text-white">{master.name}</div>
                          <div className="text-xs text-amber-400">{master.title}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{master.rating}</span>
                            <span>·</span>
                            <span>{master.experienceYears} лет стажа</span>
                            <span>·</span>
                            <span>{master.portfolio?.length || 0} фото работ</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DATE & TIME */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Выберите дату визита:</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {getNextDays().map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        onClick={() => setSelectedDate(day.iso)}
                        className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <span className={`text-[10px] uppercase ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          {day.weekday}
                        </span>
                        <span className="text-base font-bold my-0.5">{day.dayNum}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                          {day.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Выберите удобное время (слоты по 45 мин):</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {timeSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        disabled={booked}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-all ${
                          booked
                            ? 'bg-zinc-950 text-zinc-600 border-zinc-900 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                            : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CLIENT PHONE & CONFIRMATION */}
          {step === 5 && (
            <div className="space-y-5">
              
              {/* Summary card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <div className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-2">
                  Параметры вашей записи:
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Филиал:</span>
                  <span className="font-semibold text-white">{currentLocation?.name}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Стрижка / услуга:</span>
                  <span className="font-semibold text-white">{currentService?.name}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Мастер:</span>
                  <span className="font-semibold text-white">
                    {currentMaster ? currentMaster.name : 'Любой свободный мастер'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Дата и время:</span>
                  <span className="font-semibold text-amber-400">
                    {selectedDate}, в {selectedTime}
                  </span>
                </div>

                {/* Loyalty and Discount Breakdown */}
                {loyaltyData.isEligibleAtBranch && discountAmount > 0 ? (
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>Базовая стоимость:</span>
                      <span className="line-through font-mono">
                        {currentService?.price.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Скидка ({loyaltyData.tier.badge} -{loyaltyData.discountPercent}%):</span>
                      </span>
                      <span className="font-mono font-bold">
                        -{discountAmount.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-200 pt-1 text-sm font-bold">
                      <span className="text-white">Итого к оплате в салоне:</span>
                      <span className="text-amber-400 font-mono text-base">
                        {finalTotalPrice.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    {!loyaltyData.isEligibleAtBranch && (
                      <div className="text-[11px] text-zinc-500 italic pb-1">
                        🔒 В данном филиале действуют фиксированные цены (скидки не применяются)
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-300 text-sm">
                      <span className="text-zinc-400">К оплате в салоне:</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {currentService?.price.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration / verification via phone number */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Регистрация и подтверждение через номер телефона:</span>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Ваше имя:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Например, Александр"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Номер мобильного телефона:</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+998 (90) 123-45-67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* SMS Code verification row */}
                {!user && (
                  <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-300 font-medium">Код подтверждения из SMS:</span>
                      {!isSmsSent ? (
                        <button
                          type="button"
                          onClick={handleSendSms}
                          className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                        >
                          Отправить SMS с кодом
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400">Код отправлен!</span>
                      )}
                    </div>

                    {isSmsSent && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            placeholder="4 цифры"
                            className="w-32 px-3 py-2 text-center rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono tracking-widest text-sm focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setSmsCode(generatedSmsCode)}
                            className="px-2.5 py-2 text-[11px] bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
                          >
                            Подставить: {generatedSmsCode}
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          (Имитация SMS: используйте код <strong className="text-amber-400">{generatedSmsCode}</strong> или 1234)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Пожелания или комментарий (опционально):</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Например: хочу переход с нуля, или чай без сахара"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {validationError && (
                  <div className="p-2.5 text-xs rounded-lg bg-red-950/60 border border-red-800 text-red-300">
                    {validationError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS TICKET */}
          {step === 6 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-brand text-2xl font-bold text-white mb-1">
                  Вы успешно записаны!
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Мы отправили подтверждение на ваш номер {clientPhone}. Ждем вас вовремя!
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-zinc-400">
                  <span>Номер записи:</span>
                  <span className="font-mono font-bold text-white">#{createdAppointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Филиал:</span>
                  <span className="text-white font-medium">{currentLocation?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Адрес:</span>
                  <span className="text-white font-medium">{currentLocation?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Дата и время:</span>
                  <span className="text-amber-400 font-bold">{selectedDate}, {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Услуга:</span>
                  <span className="text-white font-medium">{currentService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">К оплате в салоне:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {finalTotalPrice.toLocaleString('ru-RU')} {settings.currency}
                  </span>
                </div>
                {loyaltyData.isEligibleAtBranch && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Скидка постоянного клиента ({loyaltyData.tier.badge}):</span>
                    <span className="font-mono font-bold">
                      -{discountAmount.toLocaleString('ru-RU')} {settings.currency}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    closeBookingModal();
                    onOpenMyAppointments();
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Посмотреть в «Мои записи»
                </button>
                <button
                  onClick={closeBookingModal}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors"
                >
                  Закрыть окно
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        {step < 6 && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Завершить запись</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
