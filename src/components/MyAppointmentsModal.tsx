import React from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { X, Calendar, MapPin, Scissors, User, AlertCircle, Clock } from 'lucide-react';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const { user, appointments, cancelAppointment, locations, masters, services, settings } = useBarbershop();

  if (!isOpen) return null;

  // Filter appointments for the current user
  const userAppointments = user
    ? appointments.filter((a) => a.clientPhone === user.phone)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="font-brand text-xl font-bold text-white">Мои записи</h3>
            <div className="text-xs text-zinc-400 mt-0.5">
              Клиент: {user?.name || 'Гость'} · {user?.phone}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {userAppointments.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-sm text-zinc-300 font-semibold">У вас пока нет активных записей</div>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Выберите подходящее время, мастера и филиал для вашей следующей стрижки.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors"
              >
                Записаться на стрижку
              </button>
            </div>
          ) : (
            userAppointments.map((apt) => {
              const location = locations.find((l) => l.id === apt.locationId);
              const master = masters.find((m) => m.id === apt.masterId);
              const service = services.find((s) => s.id === apt.serviceId);

              const statusColor =
                apt.status === 'confirmed'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : apt.status === 'completed'
                  ? 'text-zinc-400 bg-zinc-800 border-zinc-700'
                  : 'text-red-400 bg-red-500/10 border-red-500/30';

              const statusText =
                apt.status === 'confirmed'
                  ? 'Подтверждена'
                  : apt.status === 'completed'
                  ? 'Завершена'
                  : 'Отменена';

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500">#{apt.id}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-zinc-500 text-[11px]">Услуга:</div>
                      <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                        <Scissors className="w-3.5 h-3.5 text-amber-500" />
                        <span>{service?.name || 'Стрижка'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 text-[11px]">Мастер:</div>
                      <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>{master?.name || 'Любой свободный мастер'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 text-[11px]">Дата и время:</div>
                      <div className="text-amber-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{apt.date} в {apt.time}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 text-[11px]">Филиал:</div>
                      <div className="text-white font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{location?.name} ({location?.metro})</span>
                      </div>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
                      Примечание: {apt.notes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-zinc-500">К оплате: </span>
                      <span className="font-bold text-amber-400 font-mono">
                        {apt.totalPrice.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>

                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
                      >
                        Отменить запись
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors"
          >
            + Новая запись
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
