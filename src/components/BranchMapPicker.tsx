import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Sparkles, Check, Loader2, Info } from 'lucide-react';
import { Location } from '../types';

interface TashkentMetro {
  name: string;
  lat: number;
  lng: number;
}

const TASHKENT_METRO_STATIONS: TashkentMetro[] = [
  { name: 'м. Амир Темур Хиёбони', lat: 41.3122, lng: 69.2796 },
  { name: 'м. Ойбек', lat: 41.2988, lng: 69.2742 },
  { name: 'м. Пахтакор', lat: 41.3138, lng: 69.2552 },
  { name: 'м. Мустакиллик Майдони', lat: 41.3155, lng: 69.2685 },
  { name: 'м. Минор', lat: 41.3323, lng: 69.2818 },
  { name: 'м. Шахристан', lat: 41.3533, lng: 69.2882 },
  { name: 'м. Юнусабад', lat: 41.3654, lng: 69.2905 },
  { name: 'м. Туркистон', lat: 41.3789, lng: 69.2965 },
  { name: 'м. Чиланзар', lat: 41.2721, lng: 69.2045 },
  { name: 'м. Мирзо Улугбек', lat: 41.2829, lng: 69.2144 },
  { name: 'м. Новза', lat: 41.2917, lng: 69.2274 },
  { name: 'м. Дружба Народов', lat: 41.3095, lng: 69.2435 },
  { name: 'м. Беруни', lat: 41.3444, lng: 69.2064 },
  { name: 'м. Тинчлик', lat: 41.3315, lng: 69.2227 },
  { name: 'м. Чорсу', lat: 41.3256, lng: 69.2407 },
  { name: 'м. Гафур Гулям', lat: 41.3283, lng: 69.2505 },
  { name: 'м. Алишера Навои', lat: 41.3149, lng: 69.2571 },
  { name: 'м. Космонавтов', lat: 41.3032, lng: 69.2668 },
  { name: 'м. Ташкент (Северный)', lat: 41.3001, lng: 69.2905 },
  { name: 'м. Буюк Ипак Йули', lat: 41.3262, lng: 69.3275 },
  { name: 'м. Пушкин', lat: 41.3228, lng: 69.3079 },
  { name: 'м. Хамид Олимжон', lat: 41.3184, lng: 69.2909 },
  { name: 'м. Сергели', lat: 41.2227, lng: 69.2201 },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
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

function findNearestMetro(lat: number, lng: number): string {
  let nearest: TashkentMetro | null = null;
  let minDistance = Infinity;

  for (const station of TASHKENT_METRO_STATIONS) {
    const dist = getDistanceKm(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  if (!nearest) return 'Ташкент';
  if (minDistance < 1) {
    const meters = Math.round(minDistance * 1000);
    return `${nearest.name} (${meters} м)`;
  }
  return `${nearest.name} (~${minDistance.toFixed(1)} км)`;
}

interface BranchMapPickerProps {
  existingLocations: Location[];
  onSelectAddress: (data: {
    address: string;
    metro: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  currentCoordinates?: { lat: number; lng: number };
}

export const BranchMapPicker: React.FC<BranchMapPickerProps> = ({
  existingLocations,
  onSelectAddress,
  currentCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<{
    address: string;
    metro: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialLat = currentCoordinates?.lat || 41.311081;
    const initialLng = currentCoordinates?.lng || 69.240562;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      // Disable default double-click zoom so double-click places the pin immediately!
      doubleClickZoom: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Existing branches icons
    const existingIcon = L.divIcon({
      className: 'custom-existing-marker',
      html: `
        <div style="
          background: #27272a;
          color: #f59e0b;
          border: 2px solid #f59e0b;
          border-radius: 9999px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          font-weight: bold;
          font-size: 14px;
        ">
          ✂️
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    existingLocations.forEach((loc) => {
      if (loc.coordinates) {
        L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: existingIcon })
          .addTo(map)
          .bindPopup(`<strong style="color: #18181b;">${loc.name}</strong><br/><span style="font-size: 11px; color: #52525b;">${loc.address}</span>`);
      }
    });

    mapRef.current = map;

    // Handle double-click on map to set branch location & auto-fill address
    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      handleLocationPick(e.latlng.lat, e.latlng.lng, map);
    });

    // Also support single click for user convenience if they prefer single click
    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickCount((c) => c + 1);
      // If user clicks, we can also pick or let double click trigger it
      handleLocationPick(e.latlng.lat, e.latlng.lng, map);
    });

    // Invalidate size after modal render
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleLocationPick = async (lat: number, lng: number, mapInstance: L.Map) => {
    setIsLoadingAddress(true);

    // Create or update selected marker
    const selectedIcon = L.divIcon({
      className: 'custom-selected-marker',
      html: `
        <div style="position: relative; width: 38px; height: 38px;">
          <div style="
            position: absolute;
            inset: 0;
            background: rgba(245, 158, 11, 0.4);
            border-radius: 9999px;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            background: #f59e0b;
            color: #09090b;
            border: 2px solid #ffffff;
            border-radius: 9999px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 6px 16px rgba(245, 158, 11, 0.6);
            cursor: pointer;
          ">
            📍
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: selectedIcon,
        draggable: true,
      }).addTo(mapInstance);

      marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        handleLocationPick(position.lat, position.lng, mapInstance);
      });

      selectedMarkerRef.current = marker;
    }

    // Pan smoothly to picked point
    mapInstance.panTo([lat, lng], { animate: true });

    // Reverse geocode via Nominatim
    let resolvedAddress = '';
    const metro = findNearestMetro(lat, lng);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`,
        {
          headers: {
            'User-Agent': 'DurandeshBarberApp/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};

        const street = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
        const houseNumber = addr.house_number || '';
        const district = addr.city_district || addr.suburb || addr.borough || addr.district || '';
        const city = addr.city || addr.town || 'Ташкент';

        const parts: string[] = [];
        if (city) parts.push(city);
        if (district && !district.includes('Ташкент')) parts.push(district);
        if (street) {
          parts.push(`ул. ${street}${houseNumber ? ', ' + houseNumber : ''}`);
        }

        if (parts.length > 0) {
          resolvedAddress = parts.join(', ');
        } else if (data.display_name) {
          resolvedAddress = data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
    } catch {
      // Fallback if fetch fails or network blocked
    }

    if (!resolvedAddress) {
      resolvedAddress = `Ташкент, ориентир: ${metro}`;
    }

    const payload = {
      address: resolvedAddress,
      metro,
      coordinates: { lat, lng },
    };

    setSelectedInfo({
      address: resolvedAddress,
      metro,
      lat,
      lng,
    });
    setIsLoadingAddress(false);

    // Auto-fill into form cells!
    onSelectAddress(payload);
  };

  const setPresetLocation = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    handleLocationPick(lat, lng, mapRef.current);
    mapRef.current.setView([lat, lng], 15);
  };

  return (
    <div className="space-y-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 p-3 sm:p-4">
      {/* Instructions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Карта выбора точки филиала</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                2 клика = точный адрес
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Дважды нажмите в любую точку на карте Ташкента для автозаполнения
            </div>
          </div>
        </div>

        {/* Quick popular districts */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-zinc-500 mr-1">Быстрый выбор:</span>
          <button
            type="button"
            onClick={() => setPresetLocation(41.3123, 69.2488)}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors"
          >
            Tashkent City
          </button>
          <button
            type="button"
            onClick={() => setPresetLocation(41.2988, 69.2742)}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors"
          >
            Мирабад
          </button>
          <button
            type="button"
            onClick={() => setPresetLocation(41.3533, 69.2882)}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors"
          >
            Юнусабад
          </button>
          <button
            type="button"
            onClick={() => setPresetLocation(41.2721, 69.2045)}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors"
          >
            Чиланзар
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-zinc-700/80 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating helper badge */}
        <div className="absolute top-2.5 left-2.5 z-[1000] pointer-events-none">
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-200 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Кликните 2 раза по нужной улице или дому</span>
          </div>
        </div>

        {/* Loading overlay when reverse geocoding */}
        {isLoadingAddress && (
          <div className="absolute inset-0 z-[1001] bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-amber-500/50 text-amber-400 text-xs flex items-center gap-2 shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Определяем точный адрес и ориентир...</span>
            </div>
          </div>
        )}
      </div>

      {/* Result Card when location is selected */}
      {selectedInfo ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Адрес автоматически заполнен из карты:</span>
            </div>
            <div className="text-white font-medium pl-5">{selectedInfo.address}</div>
            <div className="text-zinc-400 text-[11px] pl-5 flex items-center gap-2">
              <span>🚇 {selectedInfo.metro}</span>
              <span>•</span>
              <span className="font-mono text-zinc-500">
                {selectedInfo.lat.toFixed(5)}, {selectedInfo.lng.toFixed(5)}
              </span>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold shrink-0 uppercase tracking-wider">
            Заполнено
          </span>
        </div>
      ) : (
        <div className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Посмотрите на карту выше и дважды нажмите в любое место. Поля <strong>«Точный адрес»</strong> и <strong>«Метро / Ориентир»</strong> ниже заполнятся автоматически.
          </span>
        </div>
      )}
    </div>
  );
};
