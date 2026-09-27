export type SalonBusinessType = 'universal' | 'beauty_salon' | 'barbershop';

export type ServiceCategory =
  | 'all'
  | 'hair_women'      // Женские стрижки & укладки
  | 'hair_men'        // Мужские стрижки & барберинг
  | 'coloring'        // Окрашивание и колористика
  | 'nails'           // Маникюр и педикюр
  | 'brows_lashes'    // Брови и ресницы
  | 'cosmetology'     // Косметология и уход
  | 'haircut'         // Совместимость
  | 'beard'           // Борода
  | 'combo'           // Комплексы
  | 'spa'             // СПА
  | 'kids';           // Детские

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  oldPrice?: number;
  durationMinutes: number;
  description: string;
  image: string;
  popular?: boolean;
}

export interface MasterPortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  haircutType?: string;
  description?: string;
}

export interface Master {
  id: string;
  name: string;
  title: string; // e.g. "Топ-стилист / Колорист", "Шеф-барбер", "Мастер ногтевого сервиса"
  specialization?: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatar: string;
  bio: string;
  locationIds: string[];
  portfolio: MasterPortfolioItem[]; // работы на клиентах
  phone?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  metro: string;
  phone: string;
  workingHours: string;
  image: string;
  isDefault?: boolean;
  businessType?: SalonBusinessType; // 'universal' | 'beauty_salon' | 'barbershop'
  coordinates?: {
    lat: number;
    lng: number;
  };
  // Индивидуальное название и брендинг филиала
  brandName?: string; // Индивидуальное название (например "DURANDESH Tashkent City")
  tagline?: string; // Слоган филиала (например "Флагманский бьюти-комплекс и барбершоп")
  heroTitle?: string; // Индивидуальный заголовок баннера для филиала
  heroSubtitle?: string; // Индивидуальный подзаголовок баннера
  heroImage?: string; // Индивидуальное главное фото/баннер филиала
  // Управление скидками для постоянных клиентов
  discountsEnabled?: boolean; // Работает ли филиал со скидками
  discountPercentage?: number; // Процент скидки для постоянных клиентов (например 10, 15, 20%)
  discountDescription?: string; // Условия программы скидок в филиале
  rating?: number; // Средняя оценка локации
  reviewsCount?: number; // Число отзывов о локации
}

export type ReviewTargetType = 'location' | 'master';

export interface ReviewAspects {
  cleanliness?: number; // чистота
  atmosphere?: number; // атмосфера/комфорт
  quality?: number; // качество стрижки/услуги
  punctuality?: number; // вежливость/пунктуальность
}

export interface ClientReview {
  id: string;
  targetType: ReviewTargetType;
  targetId: string; // locationId or masterId
  targetName: string;
  clientName: string;
  clientPhone?: string;
  rating: number; // 1-5
  aspects?: ReviewAspects;
  comment: string;
  photos?: string[];
  date: string;
  likes: number;
  verifiedBooking?: boolean;
  serviceName?: string;
  adminReply?: {
    author: string;
    text: string;
    date: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'master' | 'admin';
  text: string;
  timestamp: string; // HH:MM
  date: string;
  read?: boolean;
  imageUrl?: string;
}

export interface ChatThread {
  id: string;
  targetType: 'master' | 'location' | 'support';
  targetId: string;
  targetName: string;
  targetAvatar?: string;
  targetTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: ChatMessage[];
  isOnline?: boolean;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minVisits: number;
  discountPercent: number;
  badge: string;
  color: string;
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  locationId: string;
  masterId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface SalonSettings {
  appName: string;
  tagline: string;
  phone: string;
  currency: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  businessType?: SalonBusinessType; // 'universal' | 'beauty_salon' | 'barbershop'
}

export interface UserProfile {
  phone: string;
  name: string;
  isLoggedIn: boolean;
}

export interface AdminUser {
  id: string;
  login: string;
  password: string;
  name: string;
  role: 'owner' | 'manager' | 'admin';
  assignedLocationId?: string; // Привязанный филиал для администратора
  isTemporary?: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLogin?: string;
}
