import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Location,
  Master,
  Service,
  SalonSettings,
  Appointment,
  UserProfile,
  MasterPortfolioItem,
  AdminUser,
  ClientReview,
  ChatThread,
  ChatMessage,
  LoyaltyTier,
  ReviewTargetType,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_LOCATIONS,
  INITIAL_SERVICES,
  INITIAL_MASTERS,
  INITIAL_APPOINTMENTS,
  INITIAL_ADMIN_USERS,
  INITIAL_REVIEWS,
  INITIAL_CHAT_THREADS,
  LOYALTY_TIERS,
} from '../data/initialData';

interface BarbershopContextType {
  settings: SalonSettings;
  updateSettings: (newSettings: Partial<SalonSettings>) => void;
  locations: Location[];
  addLocation: (loc: Omit<Location, 'id'>) => Location;
  updateLocation: (id: string, loc: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  selectedLocation: Location | undefined;
  masters: Master[];
  addMaster: (master: Omit<Master, 'id'>) => Master;
  updateMaster: (id: string, master: Partial<Master>) => void;
  deleteMaster: (id: string) => void;
  addMasterPortfolioItem: (masterId: string, item: Omit<MasterPortfolioItem, 'id'>) => void;
  updateMasterPortfolioItem: (masterId: string, itemId: string, item: Partial<MasterPortfolioItem>) => void;
  removeMasterPortfolioItem: (masterId: string, itemId: string) => void;
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  bulkAdjustPrices: (percent: number) => void;
  appointments: Appointment[];
  createAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  cancelAppointment: (id: string) => void;
  user: UserProfile | null;
  loginUser: (phone: string, name: string) => void;
  logoutUser: () => void;
  isBookingModalOpen: boolean;
  openBookingModal: (options?: { serviceId?: string; masterId?: string; locationId?: string }) => void;
  closeBookingModal: () => void;
  bookingPreselect: { serviceId?: string; masterId?: string; locationId?: string };
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  adminLogin: (login: string, pass: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  createAdminUser: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: AdminUser };
  deleteAdminUser: (id: string) => { success: boolean; error?: string };
  changeAdminPassword: (userId: string, newPass: string) => { success: boolean; error?: string };
  updateAdminProfile: (userId: string, data: Partial<AdminUser>) => void;
  resetAllData: () => void;
  // Reviews
  reviews: ClientReview[];
  addReview: (reviewData: Omit<ClientReview, 'id' | 'date' | 'likes'>) => ClientReview;
  likeReview: (reviewId: string) => void;
  replyToReview: (reviewId: string, replyText: string, authorName: string) => void;
  deleteReview: (reviewId: string) => void;
  isReviewModalOpen: boolean;
  reviewPreselect: { targetType?: ReviewTargetType; targetId?: string };
  openReviewModal: (options?: { targetType?: ReviewTargetType; targetId?: string }) => void;
  closeReviewModal: () => void;
  // Chat
  chatThreads: ChatThread[];
  activeChatThreadId: string | null;
  setActiveChatThreadId: (id: string | null) => void;
  isChatOpen: boolean;
  openChat: (options?: { masterId?: string; locationId?: string; initialMessage?: string }) => void;
  closeChat: () => void;
  sendMessage: (threadId: string, text: string, senderRole?: 'client' | 'master' | 'admin', imageUrl?: string) => void;
  chatRole: 'client' | 'master';
  setChatRole: (role: 'client' | 'master') => void;
  // Loyalty & Discounts
  loyaltyTiers: LoyaltyTier[];
  isDiscountsModalOpen: boolean;
  setIsDiscountsModalOpen: (open: boolean) => void;
  calculateLoyaltyDiscount: (
    phoneOrVisits: string | number,
    locationId?: string
  ) => {
    tier: LoyaltyTier;
    discountPercent: number;
    visitsCount: number;
    isEligibleAtBranch: boolean;
    discountAmount: (basePrice: number) => number;
  };
}

const BarbershopContext = createContext<BarbershopContextType | undefined>(undefined);

export const BarbershopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or defaults
  const [settings, setSettings] = useState<SalonSettings>(() => {
    try {
      const saved = localStorage.getItem('barbershop_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appName === 'Турандот-Шоп' || !parsed.appName) {
          parsed.appName = 'DURANDESH BEAUTY & BARBER';
        }
        if (parsed.currency === '₽' || !parsed.currency || parsed.heroSubtitle?.includes('Москве') || parsed.phone?.startsWith('+7')) {
          parsed.currency = 'сум';
          parsed.heroSubtitle = 'Онлайн-запись к топ-стилистам, парикмахерам, колористам, мастерам ногтевого сервиса и барберам в Ташкенте.';
          parsed.phone = '+998 (71) 200-44-22';
          if (!parsed.tagline?.includes('Ташкенте')) {
            parsed.tagline = 'Премиальный салон красоты и парикмахерская в Ташкенте';
          }
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_locations');
      if (saved) {
        const parsed: Location[] = JSON.parse(saved);
        // If old Moscow locations are cached, refresh to Tashkent
        const hasMoscow = parsed.some(
          (l) => l.address.includes('Арбат') || l.address.includes('Тверская') || l.phone.startsWith('+7')
        );
        if (hasMoscow) {
          return INITIAL_LOCATIONS;
        }
        // Ensure coordinates are present
        return parsed.map((loc) => {
          const initFound = INITIAL_LOCATIONS.find((init) => init.id === loc.id);
          return {
            ...initFound,
            ...loc,
            businessType: loc.businessType || initFound?.businessType || 'universal',
            coordinates: loc.coordinates || initFound?.coordinates || { lat: 41.3111, lng: 69.2405 },
            brandName: loc.brandName || initFound?.brandName || loc.name,
            tagline: loc.tagline || initFound?.tagline || '',
            heroTitle: loc.heroTitle || initFound?.heroTitle || '',
            heroSubtitle: loc.heroSubtitle || initFound?.heroSubtitle || '',
            heroImage: loc.heroImage || initFound?.heroImage || loc.image,
          };
        });
      }
      return INITIAL_LOCATIONS;
    } catch {
      return INITIAL_LOCATIONS;
    }
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('barbershop_selected_location');
      if (saved && !saved.includes('arbat') && !saved.includes('tverskaya')) {
        return saved;
      }
      return INITIAL_LOCATIONS[0].id;
    } catch {
      return INITIAL_LOCATIONS[0].id;
    }
  });

  const [masters, setMasters] = useState<Master[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_masters');
      if (saved) {
        const parsed: Master[] = JSON.parse(saved);
        const hasOld = parsed.some((m) => m.locationIds.some((id) => id.includes('arbat')));
        if (hasOld) return INITIAL_MASTERS;
        return parsed;
      }
      return INITIAL_MASTERS;
    } catch {
      return INITIAL_MASTERS;
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_services');
      if (saved) {
        const parsed: Service[] = JSON.parse(saved);
        // If prices are in Rubles (< 10000), update to Uzbek sums
        const hasRublePrices = parsed.some((s) => s.price < 10000);
        if (hasRublePrices) {
          return INITIAL_SERVICES;
        }
        return parsed;
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_appointments');
      if (saved) {
        const parsed: Appointment[] = JSON.parse(saved);
        const hasOld = parsed.some((a) => a.totalPrice < 10000 || a.locationId.includes('arbat'));
        if (hasOld) return INITIAL_APPOINTMENTS;
        return parsed;
      }
      return INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('barbershop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_admin_users');
      if (saved) {
        const parsed: AdminUser[] = JSON.parse(saved);
        const ownerIdx = parsed.findIndex((u) => u.role === 'owner');
        if (ownerIdx !== -1) {
          const owner = parsed[ownerIdx];
          if (owner.login === 'admin' || owner.password === 'admin') {
            parsed[ownerIdx] = {
              ...owner,
              login: 'Durandesh29',
              password: 'Durandesh2906',
              name: 'Главный владелец (Durandesh)',
            };
          }
        }
        return parsed.map((u) => {
          const initUser = INITIAL_ADMIN_USERS.find((init) => init.login.toLowerCase() === u.login.toLowerCase());
          return {
            ...u,
            assignedLocationId: u.assignedLocationId || initUser?.assignedLocationId,
          };
        });
      }
      return INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('barbershop_current_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        const initUser = INITIAL_ADMIN_USERS.find((init) => init.login.toLowerCase() === parsed.login?.toLowerCase());
        return {
          ...parsed,
          assignedLocationId: parsed.assignedLocationId || initUser?.assignedLocationId,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Client Reviews state
  const [reviews, setReviews] = useState<ClientReview[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_reviews');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Chat Threads state
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_chat_threads');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_CHAT_THREADS;
    } catch {
      return INITIAL_CHAT_THREADS;
    }
  });

  // UI state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPreselect, setBookingPreselect] = useState<{ serviceId?: string; masterId?: string; locationId?: string }>({});
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Chat UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(INITIAL_CHAT_THREADS[0]?.id || null);
  const [chatRole, setChatRole] = useState<'client' | 'master'>('client');

  // Reviews modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewPreselect, setReviewPreselect] = useState<{ targetType?: ReviewTargetType; targetId?: string }>({});

  // Loyalty & Discounts Modal state
  const [isDiscountsModalOpen, setIsDiscountsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('barbershop_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('barbershop_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('barbershop_selected_location', selectedLocationId);
  }, [selectedLocationId]);

  useEffect(() => {
    localStorage.setItem('barbershop_masters', JSON.stringify(masters));
  }, [masters]);

  useEffect(() => {
    localStorage.setItem('barbershop_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('barbershop_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('barbershop_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('barbershop_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('barbershop_chat_threads', JSON.stringify(chatThreads));
  }, [chatThreads]);

  useEffect(() => {
    if (currentAdmin) {
      sessionStorage.setItem('barbershop_current_admin', JSON.stringify(currentAdmin));
    } else {
      sessionStorage.removeItem('barbershop_current_admin');
    }
  }, [currentAdmin]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('barbershop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('barbershop_user');
    }
  }, [user]);

  // Derived selected location
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const updateSettings = (newSettings: Partial<SalonSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id: string, locData: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...locData } : l)));
  };

  const deleteLocation = (id: string) => {
    setLocations((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      if (selectedLocationId === id && filtered.length > 0) {
        setSelectedLocationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const addMaster = (masterData: Omit<Master, 'id'>) => {
    const newMaster: Master = {
      ...masterData,
      id: `m-${Date.now()}`,
    };
    setMasters((prev) => [...prev, newMaster]);
    return newMaster;
  };

  const updateMaster = (id: string, masterData: Partial<Master>) => {
    setMasters((prev) => prev.map((m) => (m.id === id ? { ...m, ...masterData } : m)));
  };

  const deleteMaster = (id: string) => {
    setMasters((prev) => prev.filter((m) => m.id !== id));
  };

  const addMasterPortfolioItem = (masterId: string, itemData: Omit<MasterPortfolioItem, 'id'>) => {
    const newItem: MasterPortfolioItem = {
      ...itemData,
      id: `port-${Date.now()}`,
    };
    setMasters((prev) =>
      prev.map((m) => {
        if (m.id !== masterId) return m;
        return {
          ...m,
          portfolio: [newItem, ...(m.portfolio || [])],
        };
      })
    );
  };

  const updateMasterPortfolioItem = (masterId: string, itemId: string, itemData: Partial<MasterPortfolioItem>) => {
    setMasters((prev) =>
      prev.map((m) => {
        if (m.id !== masterId) return m;
        return {
          ...m,
          portfolio: (m.portfolio || []).map((p) => (p.id === itemId ? { ...p, ...itemData } : p)),
        };
      })
    );
  };

  const removeMasterPortfolioItem = (masterId: string, itemId: string) => {
    setMasters((prev) =>
      prev.map((m) => {
        if (m.id !== masterId) return m;
        return {
          ...m,
          portfolio: (m.portfolio || []).filter((p) => p.id !== itemId),
        };
      })
    );
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newSrv: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newSrv]);
    return newSrv;
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...serviceData } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const bulkAdjustPrices = (percent: number) => {
    setServices((prev) =>
      prev.map((s) => {
        const factor = 1 + percent / 100;
        const newPrice = Math.round((s.price * factor) / 50) * 50; // round to nearest 50 RUB
        return {
          ...s,
          oldPrice: s.price,
          price: Math.max(100, newPrice),
        };
      })
    );
  };

  const createAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const cancelAppointment = (id: string) => {
    updateAppointmentStatus(id, 'cancelled');
  };

  const loginUser = (phone: string, name: string) => {
    setUser({
      phone,
      name: name || 'Клиент',
      isLoggedIn: true,
    });
  };

  const logoutUser = () => {
    setUser(null);
  };

  const openBookingModal = (options?: { serviceId?: string; masterId?: string; locationId?: string }) => {
    setBookingPreselect(options || {});
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingPreselect({});
  };

  const resetAllData = () => {
    setSettings(INITIAL_SETTINGS);
    setLocations(INITIAL_LOCATIONS);
    setSelectedLocationId(INITIAL_LOCATIONS[0].id);
    setMasters(INITIAL_MASTERS);
    setServices(INITIAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setAdminUsers(INITIAL_ADMIN_USERS);
    setReviews(INITIAL_REVIEWS);
    setChatThreads(INITIAL_CHAT_THREADS);
    setCurrentAdmin(null);
    localStorage.clear();
    sessionStorage.clear();
  };

  // --- REVIEWS METHODS ---
  const addReview = (reviewData: Omit<ClientReview, 'id' | 'date' | 'likes'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newRev: ClientReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: today,
      likes: 0,
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate rating on target (master or location)
    if (newRev.targetType === 'master') {
      setMasters((prev) =>
        prev.map((m) => {
          if (m.id !== newRev.targetId) return m;
          const masterRevs = [newRev, ...reviews.filter((r) => r.targetType === 'master' && r.targetId === m.id)];
          const avg = Number((masterRevs.reduce((acc, r) => acc + r.rating, 0) / masterRevs.length).toFixed(2));
          return {
            ...m,
            rating: avg,
            reviewsCount: masterRevs.length,
          };
        })
      );
    } else if (newRev.targetType === 'location') {
      setLocations((prev) =>
        prev.map((l) => {
          if (l.id !== newRev.targetId) return l;
          const locRevs = [newRev, ...reviews.filter((r) => r.targetType === 'location' && r.targetId === l.id)];
          const avg = Number((locRevs.reduce((acc, r) => acc + r.rating, 0) / locRevs.length).toFixed(2));
          return {
            ...l,
            rating: avg,
            reviewsCount: locRevs.length,
          };
        })
      );
    }

    return newRev;
  };

  const likeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
  };

  const replyToReview = (reviewId: string, replyText: string, authorName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              adminReply: {
                author: authorName || 'Администрация салона',
                text: replyText.trim(),
                date: today,
              },
            }
          : r
      )
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const openReviewModal = (options?: { targetType?: ReviewTargetType; targetId?: string }) => {
    setReviewPreselect(options || {});
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewPreselect({});
  };

  // --- CHAT METHODS ---
  const openChat = (options?: { masterId?: string; locationId?: string; initialMessage?: string }) => {
    if (options?.masterId) {
      const foundMaster = masters.find((m) => m.id === options.masterId);
      const existingThread = chatThreads.find((t) => t.targetType === 'master' && t.targetId === options.masterId);
      if (existingThread) {
        setActiveChatThreadId(existingThread.id);
      } else if (foundMaster) {
        // Create new thread for master
        const newThread: ChatThread = {
          id: `thread-${foundMaster.id}`,
          targetType: 'master',
          targetId: foundMaster.id,
          targetName: foundMaster.name,
          targetAvatar: foundMaster.avatar,
          targetTitle: foundMaster.title,
          unreadCount: 0,
          isOnline: true,
          messages: [
            {
              id: `msg-welcome-${Date.now()}`,
              senderId: foundMaster.id,
              senderName: foundMaster.name,
              senderRole: 'master',
              text: `Здравствуйте! Я ${foundMaster.name}. Чем могу помочь по стрижке, уходу или времени записи?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date().toISOString().split('T')[0],
              read: true,
            },
          ],
        };
        setChatThreads((prev) => [newThread, ...prev]);
        setActiveChatThreadId(newThread.id);
      }
    } else if (options?.locationId) {
      const foundLoc = locations.find((l) => l.id === options.locationId);
      const existing = chatThreads.find((t) => t.targetType === 'location' && t.targetId === options.locationId);
      if (existing) {
        setActiveChatThreadId(existing.id);
      } else if (foundLoc) {
        const newThread: ChatThread = {
          id: `thread-loc-${foundLoc.id}`,
          targetType: 'location',
          targetId: foundLoc.id,
          targetName: `Администратор ${foundLoc.name}`,
          targetAvatar: foundLoc.image,
          targetTitle: `Филиал: ${foundLoc.metro || foundLoc.address}`,
          unreadCount: 0,
          isOnline: true,
          messages: [
            {
              id: `msg-loc-welcome-${Date.now()}`,
              senderId: 'admin',
              senderName: `Администратор ${foundLoc.name}`,
              senderRole: 'admin',
              text: `Здравствуйте! Администратор филиала «${foundLoc.name}» на связи. Рады ответить на любые вопросы по записи и скидкам.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date().toISOString().split('T')[0],
              read: true,
            },
          ],
        };
        setChatThreads((prev) => [newThread, ...prev]);
        setActiveChatThreadId(newThread.id);
      }
    } else if (!activeChatThreadId && chatThreads.length > 0) {
      setActiveChatThreadId(chatThreads[0].id);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = (
    threadId: string,
    text: string,
    roleOverride?: 'client' | 'master' | 'admin',
    imageUrl?: string
  ) => {
    if (!text.trim() && !imageUrl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const actualRole = roleOverride || chatRole;
    const targetThread = chatThreads.find((t) => t.id === threadId);

    const senderName =
      actualRole === 'client'
        ? user?.name || 'Клиент'
        : actualRole === 'master'
        ? targetThread?.targetName || 'Мастер'
        : 'Администрация';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: actualRole === 'client' ? 'client' : targetThread?.targetId || 'staff',
      senderName,
      senderRole: actualRole,
      text: text.trim(),
      timestamp: timeStr,
      date: dateStr,
      read: true,
      imageUrl,
    };

    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          lastMessage: text.trim() || 'Фотография',
          lastMessageTime: timeStr,
          messages: [...thread.messages, newMsg],
        };
      })
    );

    // Realistic smart response if client asked a question and role is client:
    if (actualRole === 'client') {
      setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = 'Спасибо за сообщение! С удовольствием проконсультирую вас подробнее. Записаться можно прямо сейчас через кнопку записи.';

        if (lower.includes('цен') || lower.includes('стоим') || lower.includes('сум') || lower.includes('почем')) {
          reply = 'Стоимость базовой мужской стрижки от 150 000 сум, женской — от 180 000 сум. В стоимость всегда включены мытье люксовой косметикой и укладка!';
        } else if (lower.includes('скидк') || lower.includes('постоян') || lower.includes('бонус') || lower.includes('акци')) {
          reply = 'Да! У нас действует скидка 10% на первый визит и система накопительных скидок до 20% для постоянных гостей в филиалах-участниках программы лояльности.';
        } else if (lower.includes('время') || lower.includes('сегодня') || lower.includes('завтра') || lower.includes('окно')) {
          reply = 'Свободные окна есть на сегодня и завтра! Нажмите желтую кнопку «Записаться онлайн» вверху или в шапке, чтобы забронировать удобный интервал за 1 минуту.';
        } else if (lower.includes('фото') || lower.includes('подойдет') || lower.includes('форма') || lower.includes('стил') || lower.includes('fade') || lower.includes('каре')) {
          reply = 'Отличная идея! Вы можете показать фото прямо перед началом стрижки в кресле — мастер учтет форму черепа, структуру волос и идеально адаптирует стрижку под вас.';
        } else if (lower.includes('бород') || lower.includes('брить')) {
          reply = 'Конечно! Мы делаем королевское бритье с распариванием горячим полотенцем и моделирование бороды опасной бритвой.';
        }

        const autoMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: targetThread?.targetId || 'master',
          senderName: targetThread?.targetName || 'Мастер',
          senderRole: targetThread?.targetType === 'location' ? 'admin' : 'master',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: dateStr,
          read: false,
        };

        setChatThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread;
            return {
              ...thread,
              lastMessage: autoMsg.text,
              lastMessageTime: autoMsg.timestamp,
              unreadCount: thread.unreadCount + 1,
              messages: [...thread.messages, autoMsg],
            };
          })
        );
      }, 1200);
    }
  };

  // --- LOYALTY & DISCOUNTS HELPER ---
  const calculateLoyaltyDiscount = (phoneOrVisits: string | number, locationId?: string) => {
    let visitsCount = 0;
    if (typeof phoneOrVisits === 'number') {
      visitsCount = phoneOrVisits;
    } else if (typeof phoneOrVisits === 'string' && phoneOrVisits.trim()) {
      const cleanPhone = phoneOrVisits.replace(/\D/g, '');
      const userApts = appointments.filter(
        (a) => a.clientPhone.replace(/\D/g, '') === cleanPhone && a.status !== 'cancelled'
      );
      visitsCount = userApts.length;
    }

    // Determine tier
    let tier = LOYALTY_TIERS[0]; // Welcome
    if (visitsCount >= 10) {
      tier = LOYALTY_TIERS[3]; // Gold 20%
    } else if (visitsCount >= 6) {
      tier = LOYALTY_TIERS[2]; // Silver 15%
    } else if (visitsCount >= 3) {
      tier = LOYALTY_TIERS[1]; // Regular 10%
    } else {
      tier = LOYALTY_TIERS[0]; // Welcome 10%
    }

    const branch = locations.find((l) => l.id === (locationId || selectedLocationId));
    // Branch participates in discounts if discountsEnabled is not explicitly false
    const isEligibleAtBranch = branch ? branch.discountsEnabled !== false : true;

    // Branch can cap discount percentage
    let effectivePercent = tier.discountPercent;
    if (branch?.discountPercentage !== undefined && branch.discountPercentage > 0) {
      effectivePercent = Math.min(effectivePercent, branch.discountPercentage);
    }

    if (!isEligibleAtBranch) {
      effectivePercent = 0;
    }

    return {
      tier,
      discountPercent: effectivePercent,
      visitsCount,
      isEligibleAtBranch,
      discountAmount: (basePrice: number) => {
        if (!isEligibleAtBranch || effectivePercent <= 0) return 0;
        return Math.round((basePrice * effectivePercent) / 100);
      },
    };
  };

  const adminLogin = (login: string, pass: string) => {
    const trimmedLogin = login.trim().toLowerCase();
    const found = adminUsers.find(
      (u) => u.login.trim().toLowerCase() === trimmedLogin && u.password === pass.trim()
    );
    if (!found) {
      return { success: false, error: 'Неверный логин или пароль администратора' };
    }
    const updatedUser: AdminUser = {
      ...found,
      lastLogin: new Date().toISOString(),
    };
    setCurrentAdmin(updatedUser);
    setAdminUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
    return { success: true };
  };

  const adminLogout = () => {
    setCurrentAdmin(null);
    setIsAdminOpen(false);
  };

  const createAdminUser = (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const trimmedLogin = userData.login.trim().toLowerCase();
    if (adminUsers.some((u) => u.login.trim().toLowerCase() === trimmedLogin)) {
      return { success: false, error: 'Пользователь с таким логином уже существует' };
    }
    const newUser: AdminUser = {
      ...userData,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAdminUsers((prev) => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  const deleteAdminUser = (id: string) => {
    const target = adminUsers.find((u) => u.id === id);
    if (!target) return { success: false, error: 'Пользователь не найден' };
    if (target.role === 'owner') {
      return { success: false, error: 'Нельзя удалить главного владельца' };
    }
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentAdmin?.id === id) {
      setCurrentAdmin(null);
    }
    return { success: true };
  };

  const changeAdminPassword = (userId: string, newPass: string) => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'Пароль должен содержать минимум 4 символа' };
    }
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          password: newPass.trim(),
          mustChangePassword: false,
          isTemporary: false,
        };
      })
    );
    if (currentAdmin?.id === userId) {
      setCurrentAdmin((prev) =>
        prev
          ? {
              ...prev,
              password: newPass.trim(),
              mustChangePassword: false,
              isTemporary: false,
            }
          : null
      );
    }
    return { success: true };
  };

  const updateAdminProfile = (userId: string, data: Partial<AdminUser>) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentAdmin?.id === userId) {
      setCurrentAdmin((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  return (
    <BarbershopContext.Provider
      value={{
        settings,
        updateSettings,
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        selectedLocationId,
        setSelectedLocationId,
        selectedLocation,
        masters,
        addMaster,
        updateMaster,
        deleteMaster,
        addMasterPortfolioItem,
        updateMasterPortfolioItem,
        removeMasterPortfolioItem,
        services,
        addService,
        updateService,
        deleteService,
        bulkAdjustPrices,
        appointments,
        createAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        user,
        loginUser,
        logoutUser,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingPreselect,
        isAdminOpen,
        setIsAdminOpen,
        adminUsers,
        currentAdmin,
        adminLogin,
        adminLogout,
        createAdminUser,
        deleteAdminUser,
        changeAdminPassword,
        updateAdminProfile,
        resetAllData,
        // Reviews
        reviews,
        addReview,
        likeReview,
        replyToReview,
        deleteReview,
        isReviewModalOpen,
        reviewPreselect,
        openReviewModal,
        closeReviewModal,
        // Chat
        chatThreads,
        activeChatThreadId,
        setActiveChatThreadId,
        isChatOpen,
        openChat,
        closeChat,
        sendMessage,
        chatRole,
        setChatRole,
        // Loyalty & Discounts
        loyaltyTiers: LOYALTY_TIERS,
        isDiscountsModalOpen,
        setIsDiscountsModalOpen,
        calculateLoyaltyDiscount,
      }}
    >
      {children}
    </BarbershopContext.Provider>
  );
};

export const useBarbershop = () => {
  const context = useContext(BarbershopContext);
  if (!context) {
    throw new Error('useBarbershop must be used within a BarbershopProvider');
  }
  return context;
};
