import React from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { Scissors, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, locations, setIsAdminOpen } = useBarbershop();

  return (
    <footer id="about" className="bg-zinc-950 border-t border-zinc-800/80 py-16 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Scissors className="w-4 h-4 rotate-45" />
              </div>
              <span className="font-brand text-lg font-bold uppercase tracking-wider text-amber-400">
                {settings.appName}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              {settings.tagline}. Создаем безупречные образы, стрижем по классическим и современным канонам мужского стиля.
            </p>
          </div>

          {/* Locations */}
          <div className="space-y-3 md:col-span-2">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Наши локации и филиалы:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locations.map((loc) => (
                <div key={loc.id} className="text-xs space-y-1">
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-zinc-500 pl-5">{loc.address} ({loc.metro})</div>
                  <div className="text-zinc-500 pl-5">{loc.workingHours} · {loc.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links & Admin access */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Сервис и управление:
            </div>
            <ul className="text-xs space-y-2">
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Каталог стрижек и услуг
                </a>
              </li>
              <li>
                <a href="#masters" className="hover:text-amber-400 transition-colors">
                  Портфолио работ мастеров
                </a>
              </li>
              <li>
                <a href="#locations" className="hover:text-amber-400 transition-colors">
                  Выбрать филиал рядом
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Кабинет создателя приложения</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div>
            © {new Date().getFullYear()} {settings.appName}. Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono">{settings.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
