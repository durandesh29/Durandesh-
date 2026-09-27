import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Grid, Check, Image as ImageIcon, Camera, Sparkles } from 'lucide-react';

interface ImagePickerControlProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  category: 'avatar' | 'portfolio' | 'service' | 'branch';
  className?: string;
}

export const AVATAR_PRESETS = [
  {
    name: 'Анна Романова (стилист-колорист)',
    url: '/src/assets/images/beauty_stylist_anna_1790182041832.jpg',
    tag: 'Салон красоты',
  },
  {
    name: 'Алексей Смирнов (шеф-барбер)',
    url: '/src/assets/images/barber_alex_1790180895959.jpg',
    tag: 'Барбершоп',
  },
  {
    name: 'Елена Морозова (мастер маникюра)',
    url: '/src/assets/images/barber_elena_1790180908176.jpg',
    tag: 'Ногтевой сервис',
  },
  {
    name: 'Камилла (топ-стилист)',
    url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    tag: 'Женский зал',
  },
  {
    name: 'Фарход (барбер-эксперт)',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    tag: 'Мужской зал',
  },
  {
    name: 'Диана (колорист Airtouch)',
    url: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=600&q=80',
    tag: 'Колористика',
  },
  {
    name: 'Джасур (мастер геометрии и Fade)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    tag: 'Барбер',
  },
  {
    name: 'Малика (lash & brow мастер)',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    tag: 'Брови и ресницы',
  },
];

export const PORTFOLIO_PRESETS = [
  {
    name: 'Многомерный Balayage & укладка',
    url: '/src/assets/images/beauty_hair_style_1790182007245.jpg',
    tag: 'Окрашивание',
  },
  {
    name: 'Низкий Skin Fade + Crop',
    url: '/src/assets/images/haircut_fade_1790180920358.jpg',
    tag: 'Fade & Кроп',
  },
  {
    name: 'Классическая стрижка Pompadour',
    url: '/src/assets/images/haircut_classic_1790180932139.jpg',
    tag: 'Классика',
  },
  {
    name: 'Премиум маникюр (Luxio)',
    url: '/src/assets/images/beauty_nails_spa_1790182025008.jpg',
    tag: 'Маникюр',
  },
  {
    name: 'Сложное окрашивание Airtouch',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    tag: 'Колористика',
  },
  {
    name: 'Мужская стрижка и моделирование бороды',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    tag: 'Борода & Стрижка',
  },
  {
    name: 'Эстетический дизайн ногтей',
    url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    tag: 'Nail-арт',
  },
  {
    name: 'Оформление контуров бороды',
    url: 'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=600&q=80',
    tag: 'Опасная бритва',
  },
  {
    name: 'Интерьер салона и рабочее место',
    url: '/src/assets/images/beauty_salon_hero_1790181986499.jpg',
    tag: 'Салон',
  },
];

export const SERVICE_PRESETS = [
  {
    name: 'Авторская женская стрижка & укладка',
    url: '/src/assets/images/beauty_hair_style_1790182007245.jpg',
    tag: 'Женский зал',
  },
  {
    name: 'Мужской фейд Fade & текстурный Crop',
    url: '/src/assets/images/haircut_fade_1790180920358.jpg',
    tag: 'Мужской зал',
  },
  {
    name: 'Классическая стрижка Pompadour & Side Part',
    url: '/src/assets/images/haircut_classic_1790180932139.jpg',
    tag: 'Классика',
  },
  {
    name: 'Премиум маникюр Luxio & СПА уход',
    url: '/src/assets/images/beauty_nails_spa_1790182025008.jpg',
    tag: 'Ногти & СПА',
  },
  {
    name: 'Сложное окрашивание Airtouch / Balayage',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    tag: 'Окрашивание',
  },
  {
    name: 'Моделирование бороды и бритьё опасной бритвой',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    tag: 'Борода',
  },
  {
    name: 'Комплекс Стрижка + Моделирование бороды',
    url: 'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=600&q=80',
    tag: 'Комплекс',
  },
  {
    name: 'Архитектура бровей & ламинирование',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    tag: 'Брови & Ресницы',
  },
  {
    name: 'СПА уход за кожей головы и волосами',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    tag: 'СПА & Уход',
  },
  {
    name: 'Детская модельная стрижка',
    url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
    tag: 'Детский зал',
  },
];

export const BRANCH_PRESETS = [
  {
    name: 'Премиальный зал и интерьер салона красоты',
    url: '/src/assets/images/beauty_salon_hero_1790181986499.jpg',
    tag: 'Салон красоты',
  },
  {
    name: 'Атмосферный зал барбершопа (лофт стиль)',
    url: '/src/assets/images/hero_barbershop_1790180882360.jpg',
    tag: 'Барбершоп',
  },
  {
    name: 'Просторный парикмахерский зал и кресла',
    url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    tag: 'Зал стрижек',
  },
  {
    name: 'Кожаные барберские кресла и рабочие места',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    tag: 'Рабочие места',
  },
  {
    name: 'Зона ресепшн, отдыха и ожидания клиентов',
    url: 'https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?auto=format&fit=crop&w=800&q=80',
    tag: 'Ресепшн',
  },
  {
    name: 'Моечная зона и спа-кабинет',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    tag: 'Мойка & СПА',
  },
  {
    name: 'Уютный кабинет маникюра и педикюра',
    url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80',
    tag: 'Ногтевой зал',
  },
  {
    name: 'Фасад и входная группа филиала',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    tag: 'Фасад филиала',
  },
];

export const ImagePickerControl: React.FC<ImagePickerControlProps> = ({
  label,
  value,
  onChange,
  category,
  className = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets =
    category === 'avatar'
      ? AVATAR_PRESETS
      : category === 'branch'
      ? BRANCH_PRESETS
      : category === 'service'
      ? SERVICE_PRESETS
      : PORTFOLIO_PRESETS;

  const categoryLabel =
    category === 'avatar'
      ? 'Фото мастера'
      : category === 'branch'
      ? 'Фото помещения'
      : category === 'service'
      ? 'Фото стрижки / услуги'
      : 'Фото работы';

  const defaultFallback =
    category === 'avatar'
      ? '/src/assets/images/beauty_stylist_anna_1790182041832.jpg'
      : category === 'branch'
      ? '/src/assets/images/hero_barbershop_1790180882360.jpg'
      : category === 'service'
      ? '/src/assets/images/haircut_fade_1790180920358.jpg'
      : '/src/assets/images/beauty_hair_style_1790182007245.jpg';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите файл изображения (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Файл слишком большой (макс. 8 МБ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        onChange(result);
        setUrlInput(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Ошибка чтения файла. Попробуйте другой файл.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className={`space-y-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-300">{label}</label>
          <span className="text-[10px] text-amber-400 font-medium">
            {categoryLabel}
          </span>
        </div>
      )}

      {/* Preview & Current selection summary */}
      <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-amber-500/40 shadow-sm">
          {value ? (
            <img
              src={value}
              alt="Превью"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultFallback;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Camera className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">
            {value.startsWith('data:') ? 'Файл загружен с устройства' : value || 'Фотография не выбрана'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {value ? 'Фото готово к сохранению' : 'Выберите способ загрузки ниже'}
          </div>
        </div>

        {value && (
          <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-md flex items-center gap-1 shrink-0">
            <Check className="w-3 h-3" />
            <span>Выбрано</span>
          </div>
        )}
      </div>

      {/* Tabs for choosing method */}
      <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'upload'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>С устройства</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('presets')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'presets'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Галерея</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'url'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Ссылка URL</span>
        </button>
      </div>

      {/* Tab 1: Upload from device */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-400 flex items-center justify-center transition-colors">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white">
              Нажмите, чтобы выбрать фото с телефона или компьютера
            </div>
            <div className="text-[10px] text-zinc-400">
              Поддерживаются JPG, PNG, WEBP (до 8 МБ)
            </div>
          </button>
          {uploadError && (
            <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-800">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Gallery Presets */}
      {mode === 'presets' && (
        <div className="space-y-2">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Выберите из каталога качественных фотографий:</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput(preset.url);
                  }}
                  className={`group relative rounded-lg overflow-hidden border aspect-square text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/40'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = defaultFallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-[9px] font-medium text-white truncate leading-tight">
                      {preset.tag}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: URL link */}
      {mode === 'url' && (
        <form onSubmit={handleApplyUrl} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              Применить
            </button>
          </div>
          <div className="text-[10px] text-zinc-500">
            Вставьте прямую ссылку на фото из интернета, соцсетей или облака.
          </div>
        </form>
      )}
    </div>
  );
};
