import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  Scissors,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Lock,
  Star,
  Percent,
  MessageCircle,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenMyAppointments: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenMyAppointments }) => {
  const {
    settings,
    locations,
    selectedLocationId,
    setSelectedLocationId,
    openBookingModal,
    setIsAdminOpen,
    currentAdmin,
    user,
    logoutUser,
    appointments,
    reviews,
    setIsDiscountsModalOpen,
    openChat,
  } = useBarbershop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Active appointments for current logged in user
  const userAppointments = user
    ? appointments.filter((a) => a.clientPhone === user.phone && a.status === 'confirmed')
    : [];

  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Brand title (single element wordmark) */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-300">
                <Scissors className="w-5 h-5 rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-brand text-xl sm:text-2xl font-bold tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors uppercase">
                  {currentLocation?.brandName || settings.appName}
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:block tracking-wide -mt-1 font-medium truncate max-w-[280px]">
                  {currentLocation?.tagline || settings.tagline}
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">
              Стрижки и цены
            </a>
            <a href="#masters" className="hover:text-amber-400 transition-colors">
              Мастера и работы
            </a>
            <a href="#locations" className="hover:text-amber-400 transition-colors">
              Филиалы
            </a>
            <a href="#reviews" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Отзывы ({reviews.length})</span>
            </a>
            <button
              onClick={() => setIsDiscountsModalOpen(true)}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 text-emerald-400 font-semibold"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Скидки</span>
            </button>
            <a
              href="#yandex-map"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Карта & Такси</span>
            </a>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-3">
            
            {/* Location selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                title="Выбрать филиал"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="max-w-[140px] truncate">{currentLocation?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Выберите филиал:
                  </div>
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 transition-colors ${
                        selectedLocationId === loc.id
                          ? 'bg-amber-500/10 text-amber-400 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{loc.name}</span>
                      <span className="text-[11px] text-zinc-400">{loc.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin toggle button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                currentAdmin
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/50 shadow-sm shadow-amber-500/10'
                  : 'text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40'
              }`}
              title={
                currentAdmin
                  ? `Вход выполнен: ${currentAdmin.name} (${currentAdmin.role === 'owner' ? 'Владелец' : 'Сотрудник'})`
                  : 'Кабинет владельца (вход по логину и паролю)'
              }
            >
              {currentAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="hidden sm:inline">
                {currentAdmin ? currentAdmin.name : 'Кабинет владельца'}
              </span>
            </button>

            {/* User profile / login */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMyAppointments}
                  className="relative flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                  title="Мои записи"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">{user.name}</span>
                  {userAppointments.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                      {userAppointments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={logoutUser}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Выйти"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Войти</span>
              </button>
            )}

            {/* Primary booking button */}
            <button
              onClick={() => openBookingModal()}
              className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-lg transition-all shadow-md shadow-amber-500/10 whitespace-nowrap"
            >
              Записаться онлайн
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-zinc-300">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-amber-400"
              >
                Стрижки и цены
              </a>
              <a
                href="#masters"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-amber-400"
              >
                Мастера и работы
              </a>
              <a
                href="#locations"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-amber-400"
              >
                Филиалы
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-amber-400 flex items-center gap-2"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Отзывы и оценки ({reviews.length})</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsDiscountsModalOpen(true);
                }}
                className="text-left px-2 py-1.5 hover:text-amber-400 text-emerald-400 font-semibold flex items-center gap-2"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Скидки для постоянных клиентов</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openChat();
                }}
                className="text-left px-2 py-1.5 text-amber-400 font-semibold flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Чат с мастером онлайн</span>
              </button>
              <a
                href="#yandex-map"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-amber-400 font-semibold flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Яндекс Карта & Такси</span>
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-amber-400"
              >
                О салоне
              </a>
            </nav>

            <div className="pt-3 border-t border-zinc-800/60">
              <div className="text-xs font-medium text-zinc-400 mb-2">Текущий филиал:</div>
              <div className="grid grid-cols-1 gap-1.5">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocationId(loc.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 text-xs rounded-lg ${
                      selectedLocationId === loc.id
                        ? 'bg-amber-500/15 text-amber-400 font-semibold'
                        : 'bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {loc.name} — {loc.metro}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
