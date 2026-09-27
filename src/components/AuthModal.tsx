import React, { useState } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { X, Phone, KeyRound, User, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, settings } = useBarbershop();
  const [phone, setPhone] = useState('+998 (90) ');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('4821');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setError('Введите полный номер мобильного телефона (например, +998 90 123-45-67)');
      return;
    }
    setError('');
    const randomOtp = String(Math.floor(1000 + Math.random() * 9000));
    setDemoCode(randomOtp);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== demoCode && otpCode !== '1234') {
      setError('Неверный проверочный код. Проверьте введенные цифры.');
      return;
    }
    loginUser(phone, name.trim() || 'Гость');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-brand text-xl font-bold text-white">
            Вход и регистрация
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Для записи к мастерам и просмотра истории визитов в {settings.appName}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Ваше имя (для мастера):
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Номер мобильного телефона:
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 (90) 123-45-67"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Получить проверочный SMS-код
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300 flex items-center justify-between">
              <div>
                <span>Номер: </span>
                <strong className="text-white font-mono">{phone}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-amber-400 hover:underline text-[11px]"
              >
                Изменить
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Введите 4-значный проверочный код:
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="0000"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-base font-mono tracking-widest text-center focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setOtpCode(demoCode)}
                  className="px-3 py-2.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-amber-300 rounded-xl transition-colors shrink-0"
                >
                  Код: {demoCode}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Войти в личный кабинет
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
