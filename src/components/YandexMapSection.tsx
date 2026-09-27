import React, { useState, useEffect, useMemo } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import { Location } from '../types';
import {
  MapPin,
  Navigation,
  Car,
  Compass,
  Crosshair,
  ExternalLink,
  Phone,
  Clock,
  Calendar,
  Check,
  Footprints,
  Bus,
  Layers,
  Sparkles,
} from 'lucide-react';

// Haversine formula for distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const YandexMapSection: React.FC = () => {
  const { locations, selectedLocationId, setSelectedLocationId, openBookingModal } = useBarbershop();

  // Selected branch for route and details
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return selectedLocationId || (locations[0] ? locations[0].id : '');
  });

  // Client's geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [geoErrorMsg, setGeoErrorMsg] = useState<string>('');

  // Travel mode for Yandex Maps link
  const [travelMode, setTravelMode] = useState<'taxi' | 'auto' | 'mt' | 'pd'>('taxi');

  // Map view mode: embedded Yandex widget or interactive vector map
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Sync with selected location
  useEffect(() => {
    if (selectedLocationId) {
      setActiveBranchId(selectedLocationId);
    }
  }, [selectedLocationId]);

  const activeBranch: Location | undefined = useMemo(() => {
    return locations.find((l) => l.id === activeBranchId) || locations[0];
  }, [locations, activeBranchId]);

  // Request user geolocation to find closest branch
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoErrorMsg('Геолокация не поддерживается вашим браузером');
      return;
    }

    setGeoStatus('locating');
    setGeoErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setGeoStatus('success');

        // Automatically select the nearest branch in Tashkent
        let nearestLoc: Location | null = null;
        let minDistance = Infinity;

        locations.forEach((loc) => {
          if (loc.coordinates) {
            const dist = calculateDistance(
              coords.lat,
              coords.lng,
              loc.coordinates.lat,
              loc.coordinates.lng
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestLoc = loc;
            }
          }
        });

        if (nearestLoc) {
          const nearestId = (nearestLoc as Location).id;
          setActiveBranchId(nearestId);
          setSelectedLocationId(nearestId);
        }
      },
      (err) => {
        setGeoStatus('error');
        if (err.code === 1) {
          setGeoErrorMsg('Доступ к геопозиции отклонен. Вы можете выбрать филиал вручную.');
        } else {
          setGeoErrorMsg('Не удалось определить координаты.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate distance & estimated taxi time
  const getBranchDistanceInfo = (loc: Location) => {
    if (!loc.coordinates) return null;

    // If user position is detected, calculate from user, else from Tashkent center (41.3110, 69.2405)
    const originLat = userCoords ? userCoords.lat : 41.3110;
    const originLng = userCoords ? userCoords.lng : 69.2405;

    const km = calculateDistance(
      originLat,
      originLng,
      loc.coordinates.lat,
      loc.coordinates.lng
    );

    const taxiMinutes = Math.max(4, Math.round(km * 2.8 + 3));
    const walkMinutes = Math.round(km * 13);
    const estimatedFareSums = Math.round((14000 + km * 2200) / 1000) * 1000;

    return {
      km: km.toFixed(1),
      taxiMinutes,
      walkMinutes,
      estimatedFareSums: estimatedFareSums.toLocaleString('ru-RU'),
      isUserCoords: Boolean(userCoords),
    };
  };

  // URLs for Yandex Maps and Yandex Taxi / Go
  const getYandexMapsRouteUrl = (loc: Location, mode: 'auto' | 'taxi' | 'mt' | 'pd') => {
    const dest = loc.coordinates
      ? `${loc.coordinates.lat},${loc.coordinates.lng}`
      : '41.3134,69.2452';

    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : '';
    const rtext = origin ? `${origin}~${dest}` : `~${dest}`;

    return `https://yandex.uz/maps/?rtext=${rtext}&rtt=${mode}`;
  };

  const getYandexTaxiUrl = (loc: Location) => {
    const lat = loc.coordinates ? loc.coordinates.lat : 41.3134;
    const lon = loc.coordinates ? loc.coordinates.lng : 69.2452;

    // AppMetrica deep link with fallback to Yandex Go / Taxi web
    return `https://3.redirect.appmetrica.yandex.com/route?end-lat=${lat}&end-lon=${lon}&tariffClass=econom&appmetrica_tracking_id=1178268795219780156&ref=durandesh_tashkent`;
  };

  const getYandexTaxiWebFallbackUrl = (loc: Location) => {
    const lat = loc.coordinates ? loc.coordinates.lat : 41.3134;
    const lon = loc.coordinates ? loc.coordinates.lng : 69.2452;
    return `https://yandex.uz/maps/?rtext=~${lat},${lon}&rtt=taxi`;
  };

  // Yandex Maps embed widget URL centered on active branch or all Tashkent
  const yandexEmbedUrl = useMemo(() => {
    const targetLat = activeBranch?.coordinates?.lat || 41.3134;
    const targetLng = activeBranch?.coordinates?.lng || 69.2452;

    // Generate points for all branches on the map
    const pointsParam = locations
      .filter((l) => l.coordinates)
      .map((l) => `${l.coordinates!.lng},${l.coordinates!.lat},pm2am`)
      .join('~');

    return `https://yandex.uz/map-widget/v1/?ll=${targetLng},${targetLat}&z=${mapZoom}&pt=${pointsParam || `${targetLng},${targetLat},pm2am`}&l=map`;
  }, [activeBranch, locations, mapZoom]);

  const activeDistance = activeBranch ? getBranchDistanceInfo(activeBranch) : null;

  return (
    <section id="yandex-map" className="py-20 bg-zinc-950 border-b border-zinc-800 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Яндекс Карты & Яндекс Go</span>
          </div>

          <h2 className="font-brand text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Интерактивная карта филиалов в Ташкенте
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Нажмите на любой филиал на карте или в списке ниже, чтобы мгновенно проложить быстрый маршрут, рассчитать время в пути или вызвать Яндекс Такси в один клик.
          </p>
        </div>

        {/* Location Selector Tabs & Geolocation Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          
          {/* Branch Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {locations.map((loc) => {
              const isActive = loc.id === activeBranchId;
              const dist = getBranchDistanceInfo(loc);

              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveBranchId(loc.id);
                    setSelectedLocationId(loc.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950 fill-zinc-950' : 'text-amber-500'}`} />
                  <span>{loc.name.replace('DURANDESH ', '')}</span>
                  {dist && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-amber-400'
                      }`}
                    >
                      ~{dist.km} км
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* GPS Auto-detect Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDetectLocation}
              disabled={geoStatus === 'locating'}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 text-zinc-200 hover:text-amber-400 text-xs font-semibold transition-all flex items-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 text-amber-500 ${geoStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>
                {geoStatus === 'locating'
                  ? 'Определяем GPS...'
                  : geoStatus === 'success'
                  ? 'Моя геопозиция активна'
                  : 'Найти ближайший филиал ко мне'}
              </span>
            </button>
          </div>
        </div>

        {geoErrorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <span>{geoErrorMsg}</span>
            <button
              onClick={() => setGeoErrorMsg('')}
              className="text-zinc-400 hover:text-white text-xs underline"
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Main Map Box Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* MAP CANVAS & EMBED CONTAINER (lg: 8 cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-2xl flex flex-col min-h-[460px] sm:min-h-[540px]">
            
            {/* Top Interactive Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Яндекс Карты: Ташкент</span>
              </div>

              {/* Zoom & View Controls */}
              <div className="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-lg">
                <button
                  onClick={() => setMapZoom((z) => Math.min(z + 1, 17))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors text-sm"
                  title="Приблизить карту"
                >
                  +
                </button>
                <button
                  onClick={() => setMapZoom((z) => Math.max(z - 1, 10))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors text-sm"
                  title="Отдалить карту"
                >
                  −
                </button>
              </div>
            </div>

            {/* Embedded Yandex Map iframe */}
            <div className="relative w-full h-full flex-1 min-h-[380px] bg-zinc-950">
              <iframe
                title="Яндекс Карта филиалов DURANDESH в Ташкенте"
                src={yandexEmbedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                className="w-full h-full border-0 filter contrast-[1.05] opacity-95"
                loading="lazy"
              />

              {/* Floating Quick Markers Overlay for instant click routing */}
              <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap gap-2">
                {locations.map((loc) => {
                  const isCur = loc.id === activeBranchId;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setActiveBranchId(loc.id);
                        setSelectedLocationId(loc.id);
                      }}
                      className={`pointer-events-auto px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 ${
                        isCur
                          ? 'bg-amber-500 text-zinc-950 font-bold border border-amber-400'
                          : 'bg-zinc-950/80 text-zinc-300 border border-zinc-700/80 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{loc.name.replace('DURANDESH ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom quick actions banner */}
            <div className="p-3 bg-zinc-950/95 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 px-5">
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Кликните на филиал для построения точного авто/пешего маршрута</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`https://yandex.uz/maps/?text=${encodeURIComponent(
                    activeBranch?.address || 'Ташкент'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Открыть в приложении Яндекс Карт</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* ACTIVE BRANCH DETAILS & DIRECT ROUTE / YANDEX TAXI CARD (lg: 4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
            
            {/* Top Badge & Branch Status */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                  Выбранный филиал
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Открыто сейчас
                </span>
              </div>

              {/* Branch Title & Image Preview */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 border border-zinc-800 bg-zinc-950">
                <img
                  src={activeBranch?.image || '/src/assets/images/beauty_salon_hero_1790181986499.jpg'}
                  alt={activeBranch?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/src/assets/images/beauty_salon_hero_1790181986499.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold drop-shadow-md">
                    {activeBranch?.name}
                  </h3>
                  <div className="text-amber-400 text-xs font-medium mt-0.5">
                    {activeBranch?.metro}
                  </div>
                </div>
              </div>

              {/* Address & Hours info */}
              <div className="space-y-3 text-xs text-zinc-300 pb-4 border-b border-zinc-800/80">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-200">{activeBranch?.address}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>График: {activeBranch?.workingHours} (Ежедневно)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <a
                    href={`tel:${activeBranch?.phone}`}
                    className="text-amber-400 hover:underline font-mono"
                  >
                    {activeBranch?.phone}
                  </a>
                </div>
              </div>

              {/* Distance & Taxi Fare Estimation */}
              {activeDistance && (
                <div className="my-4 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      {activeDistance.isUserCoords ? 'Расстояние от вас:' : 'От центра Ташкента:'}
                    </span>
                    <span className="font-bold text-white font-mono">
                      ~{activeDistance.km} км
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      <span>Яндекс Такси:</span>
                    </span>
                    <span className="font-semibold text-amber-400">
                      ~{activeDistance.taxiMinutes} мин ({activeDistance.estimatedFareSums} сум)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Пешком:</span>
                    </span>
                    <span>~{activeDistance.walkMinutes} мин</span>
                  </div>
                </div>
              )}

              {/* Travel mode buttons */}
              <div className="space-y-1.5 my-3">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Способ передвижения:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTravelMode('taxi')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                      travelMode === 'taxi'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Такси</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('auto')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                      travelMode === 'auto'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>На авто</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('pd')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                      travelMode === 'pd'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Footprints className="w-4 h-4" />
                    <span>Пешком</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (Route & Yandex Taxi) */}
            <div className="space-y-2.5 pt-4">
              
              {/* PRIMARY 1: Open in Yandex Taxi (Go) */}
              {activeBranch && (
                <a
                  href={getYandexTaxiUrl(activeBranch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 active:scale-98"
                >
                  <Car className="w-4 h-4 fill-zinc-950" />
                  <span>Вызвать Яндекс Такси / Go</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* PRIMARY 2: Build Route in Yandex Maps */}
              {activeBranch && (
                <a
                  href={getYandexMapsRouteUrl(activeBranch, travelMode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <Navigation className="w-4 h-4 text-amber-500" />
                  <span>Построить маршрут в Яндекс Картах</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              )}

              {/* ONLINE BOOKING IN THIS BRANCH */}
              <button
                onClick={() => {
                  if (activeBranch) {
                    openBookingModal({ locationId: activeBranch.id });
                  }
                }}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/40 text-amber-400 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Записаться онлайн в этот филиал</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
