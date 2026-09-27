import React, { useState, useEffect } from 'react';
import { useBarbershop } from '../context/BarbershopContext';
import {
  X,
  Building,
  MapPin,
  UserCheck,
  Scissors,
  Calendar,
  Percent,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Users,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Camera,
  Upload,
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';
import { Service, Master, Location, ServiceCategory, MasterPortfolioItem, AdminUser, SalonBusinessType } from '../types';
import { BranchMapPicker } from './BranchMapPicker';
import { ImagePickerControl } from './ImagePickerControl';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    settings,
    updateSettings,
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
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
    updateAppointmentStatus,
    adminUsers,
    currentAdmin,
    adminLogin,
    adminLogout,
    createAdminUser,
    deleteAdminUser,
    changeAdminPassword,
    resetAllData,
    reviews,
    replyToReview,
    deleteReview,
    updateAdminProfile,
  } = useBarbershop();

  // Role & Permissions check:
  // 'owner' (Durandesh) has full access to all branches, adding branches, global brand, and staff access.
  // 'admin'/'manager' can ONLY edit their assigned branch, cannot add branches, cannot access staff management.
  const isOwner = currentAdmin?.role === 'owner';
  const assignedLocation = !isOwner
    ? locations.find((l) => l.id === currentAdmin?.assignedLocationId) || locations[0]
    : null;
  const assignedLocationId = assignedLocation?.id || locations[0]?.id;

  // Active navigation tab
  type AdminTab = 'brand' | 'locations' | 'masters' | 'services' | 'appointments' | 'staff' | 'reviews';
  const [activeTab, setActiveTab] = useState<AdminTab>(isOwner ? 'brand' : 'locations');

  // Enforce tab access: brand and staff tabs are strictly reserved for the owner
  useEffect(() => {
    if (!isOwner && (activeTab === 'brand' || activeTab === 'staff')) {
      setActiveTab('locations');
    }
  }, [isOwner, activeTab]);

  // Login form state (when currentAdmin is null)
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Self-service password change modal / state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newSelfPassword, setNewSelfPassword] = useState('');
  const [confirmSelfPassword, setConfirmSelfPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Staff creation form state (for giving access to 2-3 other people)
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffLogin, setStaffLogin] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<AdminUser['role']>('admin');
  const [staffBranchId, setStaffBranchId] = useState<string>(locations[0]?.id || '');
  const [mustChangePass, setMustChangePass] = useState(true);
  const [staffError, setStaffError] = useState('');
  const [createdStaffCard, setCreatedStaffCard] = useState<{ name: string; login: string; pass: string; branchName?: string } | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Administrator deletion & editing states
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [adminToEdit, setAdminToEdit] = useState<AdminUser | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminBranchId, setEditAdminBranchId] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editAdminError, setEditAdminError] = useState('');

  // Toast / feedback message for owner actions
  const [staffSuccessMessage, setStaffSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showSelfNewPassword, setShowSelfNewPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const toggleRevealPassword = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Quick reset password for another employee
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [resetEmployeePass, setResetEmployeePass] = useState('');

  // Brand settings form state (Global Network Brand - Owner only)
  const [appName, setAppName] = useState(settings.appName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle);
  const [phone, setPhone] = useState(settings.phone);
  const [currency, setCurrency] = useState(settings.currency || 'сум');
  const [businessType, setBusinessType] = useState<SalonBusinessType>(settings.businessType || 'universal');
  const [brandSaved, setBrandSaved] = useState(false);

  // Per-Branch Branding Form State (Different for each branch, editable by both Owner and Branch Admin)
  const [selectedBrandScope, setSelectedBrandScope] = useState<string>('global'); // 'global' or locationId
  const activeBranchForBranding = isOwner
    ? (selectedBrandScope === 'global' ? null : locations.find((l) => l.id === selectedBrandScope) || locations[0])
    : assignedLocation;

  const [branchBrandName, setBranchBrandName] = useState('');
  const [branchTagline, setBranchTagline] = useState('');
  const [branchHeroTitle, setBranchHeroTitle] = useState('');
  const [branchHeroSubtitle, setBranchHeroSubtitle] = useState('');
  const [branchHeroImage, setBranchHeroImage] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchHours, setBranchHours] = useState('10:00 - 22:00');
  const [branchPremisesImage, setBranchPremisesImage] = useState('');
  const [branchDiscountsEnabled, setBranchDiscountsEnabled] = useState(true);
  const [branchDiscountPercentage, setBranchDiscountPercentage] = useState(15);
  const [branchDiscountDescription, setBranchDiscountDescription] = useState('');
  const [branchBrandSaved, setBranchBrandSaved] = useState(false);

  // Initialize and synchronize branch-specific branding fields whenever target branch changes
  useEffect(() => {
    if (activeBranchForBranding) {
      setBranchBrandName(activeBranchForBranding.brandName || activeBranchForBranding.name);
      setBranchTagline(activeBranchForBranding.tagline || '');
      setBranchHeroTitle(activeBranchForBranding.heroTitle || '');
      setBranchHeroSubtitle(activeBranchForBranding.heroSubtitle || '');
      setBranchHeroImage(activeBranchForBranding.heroImage || activeBranchForBranding.image || settings.heroImage);
      setBranchPhone(activeBranchForBranding.phone || '');
      setBranchHours(activeBranchForBranding.workingHours || '10:00 - 22:00');
      setBranchPremisesImage(activeBranchForBranding.image || '');
      setBranchDiscountsEnabled(activeBranchForBranding.discountsEnabled !== false);
      setBranchDiscountPercentage(activeBranchForBranding.discountPercentage || 15);
      setBranchDiscountDescription(activeBranchForBranding.discountDescription || '');
    }
  }, [activeBranchForBranding?.id, locations]);

  // New location form
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocMetro, setNewLocMetro] = useState('м. Ойбек');
  const [newLocPhone, setNewLocPhone] = useState('+998 (71) 200-44-22');
  const [newLocHours, setNewLocHours] = useState('10:00 - 22:00');
  const [newLocCoordinates, setNewLocCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [newLocImage, setNewLocImage] = useState('/src/assets/images/beauty_salon_hero_1790181986499.jpg');
  const [newLocDiscountsEnabled, setNewLocDiscountsEnabled] = useState(true);
  const [newLocDiscountPercentage, setNewLocDiscountPercentage] = useState(15);
  const [newLocDiscountDescription, setNewLocDiscountDescription] = useState('Скидка до 15% для постоянных клиентов');
  const [newLocBusinessType, setNewLocBusinessType] = useState<SalonBusinessType>('universal');
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);

  // Edit location state
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editLocName, setEditLocName] = useState('');
  const [editLocBusinessType, setEditLocBusinessType] = useState<SalonBusinessType>('universal');
  const [editLocAddress, setEditLocAddress] = useState('');
  const [editLocMetro, setEditLocMetro] = useState('');
  const [editLocPhone, setEditLocPhone] = useState('');
  const [editLocHours, setEditLocHours] = useState('10:00 - 22:00');
  const [editLocImage, setEditLocImage] = useState('');
  const [editLocCoordinates, setEditLocCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [editLocDiscountsEnabled, setEditLocDiscountsEnabled] = useState(true);
  const [editLocDiscountPercentage, setEditLocDiscountPercentage] = useState(15);
  const [editLocDiscountDescription, setEditLocDiscountDescription] = useState('');

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New service form
  const [showAddService, setShowAddService] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState<ServiceCategory>('hair_women');
  const [newSrvPrice, setNewSrvPrice] = useState<number>(150000);
  const [newSrvDuration, setNewSrvDuration] = useState<number>(60);
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('/src/assets/images/beauty_hair_style_1790182007245.jpg');

  // Edit service state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editSrvName, setEditSrvName] = useState('');
  const [editSrvCat, setEditSrvCat] = useState<ServiceCategory>('hair_women');
  const [editSrvPrice, setEditSrvPrice] = useState<number>(150000);
  const [editSrvDuration, setEditSrvDuration] = useState<number>(60);
  const [editSrvDesc, setEditSrvDesc] = useState('');
  const [editSrvImage, setEditSrvImage] = useState('');

  // New master form
  const [showAddMaster, setShowAddMaster] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterTitle, setNewMasterTitle] = useState('Парикмахер-стилист / Колорист');
  const [newMasterExp, setNewMasterExp] = useState(5);
  const [newMasterBio, setNewMasterBio] = useState('');
  const [newMasterAvatar, setNewMasterAvatar] = useState('/src/assets/images/beauty_stylist_anna_1790182041832.jpg');
  const [newMasterLocIds, setNewMasterLocIds] = useState<string[]>([]);

  // Master portfolio photo management state
  const [selectedMasterForPortfolio, setSelectedMasterForPortfolio] = useState<string | null>(null);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioType, setNewPortfolioType] = useState('Стрижка & Окрашивание');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');
  const [newPortfolioImg, setNewPortfolioImg] = useState('/src/assets/images/beauty_hair_style_1790182007245.jpg');

  // Edit Master modal / state
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [editMasterName, setEditMasterName] = useState('');
  const [editMasterTitle, setEditMasterTitle] = useState('');
  const [editMasterExp, setEditMasterExp] = useState(5);
  const [editMasterBio, setEditMasterBio] = useState('');
  const [editMasterAvatar, setEditMasterAvatar] = useState('');
  const [editMasterLocIds, setEditMasterLocIds] = useState<string[]>([]);
  const [editMasterPhone, setEditMasterPhone] = useState('');

  // Edit Portfolio Item modal / state
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<{ masterId: string; item: MasterPortfolioItem } | null>(null);
  const [editPortTitle, setEditPortTitle] = useState('');
  const [editPortType, setEditPortType] = useState('');
  const [editPortDesc, setEditPortDesc] = useState('');
  const [editPortImg, setEditPortImg] = useState('');

  // Work lightbox
  const [previewWorkModal, setPreviewWorkModal] = useState<MasterPortfolioItem | null>(null);

  if (!isAdminOpen) return null;

  // Handle Admin Login submission
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = adminLogin(loginInput, passwordInput);
    if (!res.success) {
      setLoginError(res.error || 'Неверный логин или пароль');
      return;
    }
    setLoginInput('');
    setPasswordInput('');
  };

  // Generate random 6-character temporary password
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `temp_${res}`;
  };

  // Handle staff account creation
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    if (!staffName || !staffLogin || !staffPassword) {
      setStaffError('Заполните все обязательные поля');
      return;
    }

    const targetBranchId = staffBranchId || locations[0]?.id;
    const targetBranch = locations.find((l) => l.id === targetBranchId) || locations[0];
    const branchName = targetBranch?.name || 'Филиал';

    const res = createAdminUser({
      name: staffName.trim(),
      login: staffLogin.trim().toLowerCase(),
      password: staffPassword.trim(),
      role: staffRole,
      assignedLocationId: staffRole === 'owner' ? undefined : targetBranchId,
      isTemporary: true,
      mustChangePassword: mustChangePass,
    });

    if (!res.success) {
      setStaffError(res.error || 'Ошибка при создании администратора');
      return;
    }

    setCreatedStaffCard({
      name: staffName.trim(),
      login: staffLogin.trim().toLowerCase(),
      pass: staffPassword.trim(),
      branchName: staffRole === 'owner' ? 'Вся сеть (Владелец)' : branchName,
    });

    setStaffName('');
    setStaffLogin('');
    setStaffPassword('');
    setShowAddStaff(false);
    setStaffSuccessMessage(`✓ Администратор «${staffName.trim()}» успешно создан! Назначен на управление филиалом: ${branchName}.`);
    setTimeout(() => setStaffSuccessMessage(''), 5000);
  };

  // Open edit modal for an administrator
  const handleStartEditAdmin = (user: AdminUser) => {
    setAdminToEdit(user);
    setEditAdminName(user.name);
    setEditAdminBranchId(user.assignedLocationId || locations[0]?.id || '');
    setEditAdminPassword('');
    setEditAdminError('');
  };

  // Save edits for an administrator (name, assigned branch, new password)
  const handleSaveEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;
    if (!editAdminName.trim()) {
      setEditAdminError('Имя администратора не может быть пустым');
      return;
    }

    const targetBranch = locations.find((l) => l.id === editAdminBranchId);
    const branchName = targetBranch?.name || 'Филиал не указан';

    const updates: Partial<AdminUser> = {
      name: editAdminName.trim(),
      assignedLocationId: editAdminBranchId,
    };

    if (editAdminPassword.trim()) {
      if (editAdminPassword.trim().length < 4) {
        setEditAdminError('Новый пароль должен содержать минимум 4 символа');
        return;
      }
      updates.password = editAdminPassword.trim();
      updates.mustChangePassword = false;
      updates.isTemporary = false;
    }

    updateAdminProfile(adminToEdit.id, updates);
    setStaffSuccessMessage(`✓ Данные администратора «${editAdminName}» сохранены! Управляемый филиал: ${branchName}.`);
    setTimeout(() => setStaffSuccessMessage(''), 5000);
    setAdminToEdit(null);
  };

  // Confirm delete administrator
  const handleConfirmDeleteAdmin = () => {
    if (!adminToDelete) return;
    const name = adminToDelete.name;
    const res = deleteAdminUser(adminToDelete.id);
    if (!res.success) {
      setStaffError(res.error || 'Ошибка при удалении администратора');
    } else {
      setStaffSuccessMessage(`✓ Администратор «${name}» успешно удален из системы.`);
      setTimeout(() => setStaffSuccessMessage(''), 5000);
    }
    setAdminToDelete(null);
  };

  // Copy staff credentials to clipboard
  const handleCopyCredentials = (login: string, pass: string, name: string) => {
    const text = `Доступ к приложению ${settings.appName}:\nСотрудник: ${name}\nЛогин: ${login}\nВременный пароль: ${pass}\nПосле входа вы можете сменить пароль на свой.`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Self password change handler (Owner or current admin)
  const handleSelfPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentAdmin) return;
    if (newSelfPassword.length < 4) {
      setPasswordChangeError('Пароль должен быть не менее 4 символов');
      return;
    }
    if (newSelfPassword !== confirmSelfPassword) {
      setPasswordChangeError('Пароли не совпадают');
      return;
    }

    const res = changeAdminPassword(currentAdmin.id, newSelfPassword);
    if (!res.success) {
      setPasswordChangeError(res.error || 'Ошибка изменения пароля');
      return;
    }

    setPasswordChangeSuccess(
      currentAdmin.role === 'owner'
        ? '✓ Пароль главного владельца успешно обновлен и сохранен!'
        : '✓ Пароль успешно обновлен!'
    );
    setTimeout(() => {
      setPasswordChangeSuccess('');
      setIsPasswordModalOpen(false);
      setNewSelfPassword('');
      setConfirmSelfPassword('');
    }, 1800);
  };

  const applyBusinessPreset = (type: SalonBusinessType) => {
    setBusinessType(type);
    if (type === 'universal') {
      setAppName('DURANDESH BEAUTY & BARBER');
      setTagline('Премиальный салон красоты и парикмахерская в Ташкенте');
      setHeroTitle('Красота, безупречный стиль и традиции мастерства');
      setHeroSubtitle('Онлайн-запись к топ-стилистам, колористам, мастерам ногтевого сервиса и барберам в Ташкенте.');
    } else if (type === 'beauty_salon') {
      setAppName('DURANDESH BEAUTY SALON');
      setTagline('Премиальный салон красоты и эстетики в Ташкенте');
      setHeroTitle('Искусство преображения и безупречной заботы');
      setHeroSubtitle('Онлайн-запись к ведущим стилистам по волосам, колористам, мастерам маникюра и экспертам красоты в Ташкенте.');
    } else if (type === 'barbershop') {
      setAppName('DURANDESHBARBER');
      setTagline('Премиальный барбершоп и мужская территория стиля в Ташкенте');
      setHeroTitle('Безупречный мужской стиль и традиции мастерства');
      setHeroSubtitle('Онлайн-запись к топ-барберам в Ташкенте. Выберите мастера, удобное время и филиал рядом с вами.');
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return; // Non-owner admin cannot modify brand settings
    updateSettings({
      appName,
      tagline,
      heroTitle,
      heroSubtitle,
      phone,
      currency,
      businessType,
      heroImage:
        businessType === 'barbershop'
          ? '/src/assets/images/hero_barbershop_1790180882360.jpg'
          : '/src/assets/images/beauty_salon_hero_1790181986499.jpg',
    });
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2500);
  };

  // Save per-branch individual branding (Owner only)
  const handleSaveBranchBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return; // Non-owner admin cannot modify branding
    if (!activeBranchForBranding) return;
    updateLocation(activeBranchForBranding.id, {
      name: branchBrandName || activeBranchForBranding.name,
      brandName: branchBrandName || activeBranchForBranding.name,
      tagline: branchTagline,
      heroTitle: branchHeroTitle,
      heroSubtitle: branchHeroSubtitle,
      heroImage: branchHeroImage,
      phone: branchPhone,
      workingHours: branchHours,
      image: branchPremisesImage,
      discountsEnabled: branchDiscountsEnabled,
      discountPercentage: branchDiscountPercentage,
      discountDescription: branchDiscountDescription,
    });
    setBranchBrandSaved(true);
    setTimeout(() => setBranchBrandSaved(false), 2500);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return; // Non-owner admin is not allowed to add branches
    if (!newLocName || !newLocAddress) return;
    addLocation({
      name: newLocName,
      businessType: newLocBusinessType,
      address: newLocAddress,
      metro: newLocMetro || 'м. Ташкент',
      phone: newLocPhone || '+998 (71) 200-44-22',
      workingHours: newLocHours || '10:00 - 22:00',
      image:
        newLocImage ||
        (newLocBusinessType === 'barbershop'
          ? '/src/assets/images/hero_barbershop_1790180882360.jpg'
          : '/src/assets/images/beauty_salon_hero_1790181986499.jpg'),
      coordinates: newLocCoordinates || { lat: 41.311081, lng: 69.240562 },
      discountsEnabled: newLocDiscountsEnabled,
      discountPercentage: newLocDiscountPercentage,
      discountDescription: newLocDiscountDescription,
    });
    setNewLocName('');
    setNewLocBusinessType('universal');
    setNewLocAddress('');
    setNewLocMetro('');
    setNewLocPhone('');
    setNewLocCoordinates(undefined);
    setNewLocImage('/src/assets/images/beauty_salon_hero_1790181986499.jpg');
    setNewLocDiscountsEnabled(true);
    setNewLocDiscountPercentage(15);
    setNewLocDiscountDescription('Скидка до 15% для постоянных клиентов');
    setAddressAutoFilled(false);
    setShowAddLocation(false);
  };

  const handleStartEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setEditLocName(loc.name);
    setEditLocBusinessType(loc.businessType || 'universal');
    setEditLocAddress(loc.address);
    setEditLocMetro(loc.metro);
    setEditLocPhone(loc.phone);
    setEditLocHours(loc.workingHours);
    setEditLocImage(loc.image || '/src/assets/images/beauty_salon_hero_1790181986499.jpg');
    setEditLocCoordinates(loc.coordinates);
    setEditLocDiscountsEnabled(loc.discountsEnabled !== false);
    setEditLocDiscountPercentage(loc.discountPercentage || 15);
    setEditLocDiscountDescription(loc.discountDescription || 'Скидки для постоянных клиентов');
  };

  const handleSaveEditLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editLocAddress) return;
    // Admins cannot change branch name or branding or business format; only the owner can!
    const finalName = isOwner ? (editLocName || editingLocation.name) : editingLocation.name;
    const finalBusinessType = isOwner ? editLocBusinessType : (editingLocation.businessType || 'universal');
    updateLocation(editingLocation.id, {
      name: finalName,
      businessType: finalBusinessType,
      address: editLocAddress,
      metro: editLocMetro,
      phone: editLocPhone,
      workingHours: editLocHours,
      image: editLocImage || editingLocation.image,
      coordinates: editLocCoordinates,
      discountsEnabled: editLocDiscountsEnabled,
      discountPercentage: editLocDiscountPercentage,
      discountDescription: editLocDiscountDescription,
    });
    setEditingLocation(null);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName) return;
    addService({
      name: newSrvName,
      category: newSrvCat,
      price: Number(newSrvPrice) || 150000,
      durationMinutes: Number(newSrvDuration) || 45,
      description: newSrvDesc || 'Классическая стрижка и уход от профессионального мастера.',
      image: newSrvImage,
    });
    setNewSrvName('');
    setNewSrvDesc('');
    setShowAddService(false);
  };

  const handleStartEditService = (srv: Service) => {
    setEditingService(srv);
    setEditSrvName(srv.name);
    setEditSrvCat(srv.category);
    setEditSrvPrice(srv.price);
    setEditSrvDuration(srv.durationMinutes);
    setEditSrvDesc(srv.description);
    setEditSrvImage(srv.image);
  };

  const handleSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editSrvName) return;
    updateService(editingService.id, {
      name: editSrvName,
      category: editSrvCat,
      price: Number(editSrvPrice) || 0,
      durationMinutes: Number(editSrvDuration) || 30,
      description: editSrvDesc,
      image: editSrvImage,
    });
    setEditingService(null);
  };

  const handleCreateMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName) return;
    addMaster({
      name: newMasterName,
      title: newMasterTitle,
      experienceYears: Number(newMasterExp) || 3,
      rating: 4.95,
      reviewsCount: 12,
      avatar: newMasterAvatar,
      bio: newMasterBio || 'Профессиональный барбер с индивидуальным подходом к каждому клиенту.',
      locationIds: newMasterLocIds.length > 0 ? newMasterLocIds : locations.map((l) => l.id),
      portfolio: [
        {
          id: `port-${Date.now()}`,
          title: 'Стрижка Fade на клиенте',
          haircutType: 'Skin Fade',
          imageUrl: '/src/assets/images/haircut_fade_1790180920358.jpg',
          description: 'Работа выполнена машинкой и ножницами.',
        },
      ],
    });
    setNewMasterName('');
    setNewMasterBio('');
    setShowAddMaster(false);
  };

  const handleAddPortfolioToMaster = (masterId: string) => {
    if (!newPortfolioTitle) return;
    addMasterPortfolioItem(masterId, {
      title: newPortfolioTitle,
      haircutType: newPortfolioType,
      description: newPortfolioDesc,
      imageUrl: newPortfolioImg,
    });
    setNewPortfolioTitle('');
    setNewPortfolioDesc('');
  };

  const handleStartEditMaster = (master: Master) => {
    setEditingMaster(master);
    setEditMasterName(master.name);
    setEditMasterTitle(master.title);
    setEditMasterExp(master.experienceYears);
    setEditMasterBio(master.bio);
    setEditMasterAvatar(master.avatar);
    setEditMasterLocIds(master.locationIds || []);
    setEditMasterPhone(master.phone || '');
  };

  const handleSaveEditMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaster || !editMasterName) return;
    updateMaster(editingMaster.id, {
      name: editMasterName,
      title: editMasterTitle,
      experienceYears: Number(editMasterExp) || 1,
      bio: editMasterBio,
      avatar: editMasterAvatar || editingMaster.avatar,
      locationIds: editMasterLocIds,
      phone: editMasterPhone,
    });
    setEditingMaster(null);
  };

  const handleStartEditPortfolioItem = (masterId: string, item: MasterPortfolioItem) => {
    setEditingPortfolioItem({ masterId, item });
    setEditPortTitle(item.title);
    setEditPortType(item.haircutType || '');
    setEditPortDesc(item.description || '');
    setEditPortImg(item.imageUrl);
  };

  const handleSaveEditPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortfolioItem || !editPortTitle) return;
    updateMasterPortfolioItem(editingPortfolioItem.masterId, editingPortfolioItem.item.id, {
      title: editPortTitle,
      haircutType: editPortType,
      description: editPortDesc,
      imageUrl: editPortImg || editingPortfolioItem.item.imageUrl,
    });
    setEditingPortfolioItem(null);
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION SCREEN (LOGIN & PASSWORD REQUIRED)
  // ==========================================
  if (!currentAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-brand text-xl font-bold text-white uppercase tracking-wider">
              Вход в кабинет владельца
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Управление сетью {settings.appName}, мастерами, ценами и персоналом
            </p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Логин администратора / владельца:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Логин"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Пароль:
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Войти в систему управления</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header with current user status & logout */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  Кабинет управления
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium">
                  {currentAdmin.role === 'owner' ? '👑 Владелец' : '💼 Сотрудник / Менеджер'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                {settings.appName} · <span className="text-zinc-300 font-normal">{currentAdmin.name}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-amber-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Сменить пароль"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Сменить пароль</span>
            </button>

            <button
              onClick={adminLogout}
              className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Выйти из кабинета"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Сбросить все данные к исходным демо-настройкам?')) {
                  resetAllData();
                }
              }}
              title="Сброс на заводские демо-данные"
              className="p-2 text-zinc-500 hover:text-amber-400 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary password alert banner if must change password */}
        {currentAdmin.mustChangePassword && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Внимание:</strong> Вы авторизованы по временному паролю. Пожалуйста, смените пароль на постоянный.
              </span>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors shrink-0"
            >
              Сменить временный пароль
            </button>
          </div>
        )}

        {/* Tab switcher (Zero-pill discipline: segmented control buttons) */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/60 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-max">
            {/* TAB 1: BRANDING (Owner only - admin cannot access) */}
            {isOwner && (
              <button
                onClick={() => setActiveTab('brand')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'brand'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Название & Брендинг</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'locations'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isOwner ? `Филиалы (${locations.length})` : 'Мой филиал'}</span>
            </button>

            <button
              onClick={() => setActiveTab('masters')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'masters'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Мастера & Фото стрижек ({masters.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Стрижки & Цены ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Записи клиентов ({appointments.length})</span>
            </button>

            {/* TAB: STAFF & ACCESS CONTROL (Owner only) */}
            {isOwner && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'staff'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Доступ & Администраторы ({adminUsers.length})</span>
              </button>
            )}

            {/* TAB: CLIENT REVIEWS */}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Отзывы клиентов ({reviews.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* ===================================== */}
          {/* TAB 6: ACCESS CONTROL & STAFF (NEW)   */}
          {/* ===================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6 max-w-4xl">
              {/* Notification Toast for actions */}
              {staffSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{staffSuccessMessage}</span>
                  </div>
                  <button
                    onClick={() => setStaffSuccessMessage('')}
                    className="p-1 text-emerald-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>Управление администраторами и филиалами</span>
                  </h3>
                  <div className="text-xs text-zinc-400 mt-1">
                    Главный владелец может создавать администраторов, назначать филиал под их управление, менять пароли и удалять доступ.
                  </div>
                </div>

                <button
                  onClick={() => setShowAddStaff(!showAddStaff)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Создать доступ для администратора</span>
                </button>
              </div>

              {/* Just Created Staff Credentials Card for easy handover */}
              {createdStaffCard && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Доступ успешно создан! Передайте данные администратору:
                    </span>
                    <button
                      onClick={() => setCreatedStaffCard(null)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Закрыть
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Администратор:</span>
                      <strong className="text-white">{createdStaffCard.name}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Управляемый филиал:</span>
                      <strong className="text-amber-300">{createdStaffCard.branchName || 'Филиал'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Логин для входа:</span>
                      <strong className="text-amber-400 font-mono">{createdStaffCard.login}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Временный пароль:</span>
                      <strong className="text-amber-400 font-mono">{createdStaffCard.pass}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-400">
                      Администратор при входе сможет управлять исключительно назначенным филиалом.
                    </span>
                    <button
                      onClick={() =>
                        handleCopyCredentials(
                          createdStaffCard.login,
                          createdStaffCard.pass,
                          createdStaffCard.name
                        )
                      }
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{copiedNotification ? 'Скопировано в буфер!' : 'Скопировать логин и пароль'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Add Staff Form */}
              {showAddStaff && (
                <form
                  onSubmit={handleCreateStaff}
                  className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-500" />
                      <span>Создание аккаунта нового администратора:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                        Имя или должность сотрудника:
                      </label>
                      <input
                        type="text"
                        required
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="Например: Алишер (Администратор Ташкент Сити)"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                        Роль в системе:
                      </label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="admin">Администратор филиала</option>
                        <option value="manager">Менеджер филиала</option>
                      </select>
                    </div>

                    {/* Branch Assignment Field */}
                    <div className="sm:col-span-2 p-3 rounded-xl bg-zinc-900 border border-amber-500/30">
                      <label className="block text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>Каким филиалом будет управлять этот администратор:</span>
                      </label>
                      <select
                        value={staffBranchId || locations[0]?.id}
                        onChange={(e) => setStaffBranchId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            🏛 {loc.name} ({loc.address})
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        Администратор сможет входить в систему и редактировать только данные этого филиала (название, слоган, фото, расписание и скидки филиала).
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                        Логин для сотрудника (латиницей):
                      </label>
                      <input
                        type="text"
                        required
                        value={staffLogin}
                        onChange={(e) => setStaffLogin(e.target.value)}
                        placeholder="Например: admin_city"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] text-zinc-300 font-medium">
                          Временный пароль:
                        </label>
                        <button
                          type="button"
                          onClick={() => setStaffPassword(generateRandomPassword())}
                          className="text-[11px] text-amber-400 hover:underline font-medium"
                        >
                          Сгенерировать
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Например: temp_9823"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={mustChangePass}
                      onChange={(e) => setMustChangePass(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0"
                    />
                    <span>Требовать смену пароля на свой постоянный при первом входе</span>
                  </label>

                  {staffError && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                      {staffError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      Создать и выдать доступ
                    </button>
                  </div>
                </form>
              )}

              {/* List of active admin & staff users */}
              <div className="space-y-3.5">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Список всех пользователей с доступом ({adminUsers.length}):</span>
                  <span className="text-[11px] text-zinc-500 lowercase font-normal">
                    Владелец может сменить пароль, переназначить филиал или удалить администратора
                  </span>
                </div>

                <div className="space-y-3">
                  {adminUsers.map((user) => {
                    const isUserOwner = user.role === 'owner';
                    const isCurrent = user.id === currentAdmin.id;
                    const assignedLoc = locations.find((l) => l.id === user.assignedLocationId);

                    return (
                      <div
                        key={user.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isUserOwner
                            ? 'bg-zinc-950 border-amber-500/40 shadow-md'
                            : 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* User info */}
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-white">{user.name}</span>

                              {isUserOwner ? (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-1">
                                  <span>👑 Главный владелец</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-1">
                                  <span>💼 Администратор</span>
                                </span>
                              )}

                              {user.isTemporary && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                  Временный
                                </span>
                              )}
                              {user.mustChangePassword && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                  Требует смены пароля
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Вы сейчас
                                </span>
                              )}
                            </div>

                            {/* Branch assignment info */}
                            {isUserOwner ? (
                              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>
                                  Управляет <strong>всей сетью</strong> ({locations.length} филиалов в Ташкенте), глобальным брендом и правами доступа.
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>
                                    Управляет филиалом: <strong>{assignedLoc?.name || 'Не назначен'}</strong>
                                  </span>
                                </div>

                                {/* Quick branch switcher right on the card for the owner! */}
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-[11px] text-zinc-400">Назначить другой:</span>
                                  <select
                                    value={user.assignedLocationId || ''}
                                    onChange={(e) => {
                                      const newLocId = e.target.value;
                                      updateAdminProfile(user.id, { assignedLocationId: newLocId });
                                      const locName = locations.find((l) => l.id === newLocId)?.name || 'Филиал';
                                      setStaffSuccessMessage(`✓ Администратор «${user.name}» теперь управляет филиалом «${locName}»!`);
                                      setTimeout(() => setStaffSuccessMessage(''), 4500);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-zinc-800 border border-amber-500/40 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                                  >
                                    {locations.map((loc) => (
                                      <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Login & Password info */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono pt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500">Логин:</span>
                                <strong className="text-zinc-200 font-bold">{user.login}</strong>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500">Пароль:</span>
                                <strong className="text-amber-400 font-bold">
                                  {revealedPasswords[user.id] ? user.password : '••••••••'}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => toggleRevealPassword(user.id)}
                                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                                  title={revealedPasswords[user.id] ? 'Скрыть пароль' : 'Показать пароль'}
                                >
                                  {revealedPasswords[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {user.lastLogin && (
                                <span className="text-zinc-500 text-[11px] font-sans">
                                  Вход: {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80 w-full lg:w-auto justify-end">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyCredentials(user.login, user.password, user.name)}
                              className="px-2.5 py-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
                              title="Скопировать логин и пароль"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Скопировать</span>
                            </button>

                            {/* Owner: Change Owner Password button */}
                            {isUserOwner ? (
                              <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                                title="Сменить пароль главного владельца"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Сменить пароль владельца</span>
                              </button>
                            ) : (
                              <>
                                {/* Admin: Edit branch & password */}
                                <button
                                  onClick={() => handleStartEditAdmin(user)}
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-amber-400 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
                                  title="Настроить филиал или пароль администратора"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Изменить филиал / пароль</span>
                                </button>

                                {/* Admin: Delete button (prominent red) */}
                                <button
                                  onClick={() => setAdminToDelete(user)}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl border border-red-500/30 transition-colors flex items-center gap-1.5"
                                  title="Удалить этого администратора"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Удалить</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: BRANDING & APP NAME (Owner only) */}
          {isOwner && activeTab === 'brand' && (
            <form onSubmit={handleSaveBrand} className="max-w-2xl space-y-6">
              <div className="text-xs text-zinc-400">
                Здесь создатель приложения может настроить направленность (<strong>салон красоты</strong>, <strong>парикмахерская / барбершоп</strong> или <strong>универсальный салон</strong>), изменить название компании (например: <strong>«DURANDESH»</strong>, <strong>«Турандот-Шоп»</strong> и т.д.), слоган и контакты.
              </div>

              {/* Format Switcher / Preset Buttons */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Формат заведения (быстрое переключение концепции):</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyBusinessPreset('universal')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      businessType === 'universal'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1 text-white">
                      <span>✨ Универсальный</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                      Салон красоты + парикмахерский и мужской залы
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyBusinessPreset('beauty_salon')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      businessType === 'beauty_salon'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1 text-white">
                      <span>💅 Салон красоты</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                      Стрижки, окрашивание, маникюр, педикюр, спа
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyBusinessPreset('barbershop')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      businessType === 'barbershop'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1 text-white">
                      <span>💈 Барбершоп</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                      Мужские стрижки, усы, борода, бритьё
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Название приложения / салона / парикмахерской:
                  </label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Например: DURANDESH BEAUTY & BARBER"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Слоган компании:
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Премиальный барбершоп и мужская территория стиля"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Главный заголовок на первом экране (Hero):
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Подзаголовок на первом экране:
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Единый телефон сети:
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 (71) 200-44-22"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Валюта отображения цен:
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="сум"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Сохранить настройки бренда</span>
                </button>
                {brandSaved && (
                  <span className="text-xs text-emerald-400 font-medium">
                    ✓ Настройки успешно сохранены и применены!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: LOCATIONS / BRANCHES */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  {isOwner
                    ? 'Управление всеми филиалами сети: добавление новых точек, редактирование адресов и фотографий интерьера.'
                    : `Управление вашим закрепленным филиалом «${assignedLocation?.name}». Редактирование адреса, расписания, контактов и фото интерьера.`}
                </div>
                {/* Add branch button is strictly reserved for the owner */}
                {isOwner && (
                  <button
                    onClick={() => setShowAddLocation(!showAddLocation)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить филиал</span>
                  </button>
                )}
              </div>

              {/* Add Location Form (Owner only) */}
              {isOwner && showAddLocation && (
                <form
                  onSubmit={handleCreateLocation}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-amber-500/50 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-800/80 pb-3">
                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>Новый филиал: создание точки сети</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Выберите формат заведения, укажите адрес на карте и загрузите фото интерьера.
                      </div>
                    </div>
                  </div>

                  {/* Format Selector: Салон красоты, Барбершоп, Универсальный */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Формат филиала (выберите категорию):</span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-300">
                        {newLocBusinessType === 'beauty_salon' && '💅 Салон красоты'}
                        {newLocBusinessType === 'barbershop' && '💈 Барбершоп'}
                        {newLocBusinessType === 'universal' && '✨ Универсальный'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNewLocBusinessType('beauty_salon');
                          if (newLocImage === '/src/assets/images/hero_barbershop_1790180882360.jpg') {
                            setNewLocImage('/src/assets/images/beauty_salon_hero_1790181986499.jpg');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          newLocBusinessType === 'beauty_salon'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-base">💅</span>
                            <span>Салон красоты</span>
                          </span>
                          {newLocBusinessType === 'beauty_salon' && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          Женские стрижки, укладки, окрашивание, маникюр, педикюр, спа и косметология
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewLocBusinessType('barbershop');
                          if (newLocImage === '/src/assets/images/beauty_salon_hero_1790181986499.jpg') {
                            setNewLocImage('/src/assets/images/hero_barbershop_1790180882360.jpg');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          newLocBusinessType === 'barbershop'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-base">💈</span>
                            <span>Барбершоп</span>
                          </span>
                          {newLocBusinessType === 'barbershop' && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          Мужской зал, классические и трендовые стрижки, борода, усы и опасное бритьё
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewLocBusinessType('universal');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          newLocBusinessType === 'universal'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-base">✨</span>
                            <span>Универсальный</span>
                          </span>
                          {newLocBusinessType === 'universal' && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          Салон красоты + мужской зал / барбершоп (полный комплекс бьюти-услуг)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Image Picker for Branch Premises */}
                  <ImagePickerControl
                    category="branch"
                    label="Фотография помещения / интерьера нового филиала (загрузите с устройства, ссылку или выберите из каталога):"
                    value={newLocImage}
                    onChange={setNewLocImage}
                  />

                  {/* Interactive Map with double-click auto-fill */}
                  <BranchMapPicker
                    existingLocations={locations}
                    currentCoordinates={newLocCoordinates}
                    onSelectAddress={(data) => {
                      setNewLocAddress(data.address);
                      setNewLocMetro(data.metro);
                      setNewLocCoordinates(data.coordinates);
                      setAddressAutoFilled(true);
                      if (!newLocName) {
                        const cleanArea = data.metro
                          .replace(/м\.\s*/, '')
                          .split('(')[0]
                          .trim();
                        setNewLocName(`DURANDESH ${cleanArea || 'Ташкент'}`);
                      }
                    }}
                  />

                  {/* Auto-filled form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-zinc-300">Точный адрес:</label>
                        {addressAutoFilled && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Заполнено с карты
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={newLocAddress}
                          onChange={(e) => {
                            setNewLocAddress(e.target.value);
                            setAddressAutoFilled(false);
                          }}
                          placeholder="Выберите на карте двойным кликом или введите вручную"
                          className={`w-full px-3 py-2 rounded-xl text-white text-xs focus:outline-none transition-all ${
                            addressAutoFilled
                              ? 'bg-amber-500/10 border-2 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-zinc-800 border border-zinc-700 focus:border-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Метро / Ориентир:</label>
                      <input
                        type="text"
                        value={newLocMetro}
                        onChange={(e) => setNewLocMetro(e.target.value)}
                        placeholder="м. Ойбек / ТРЦ Ташкент Сити"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Название филиала:</label>
                      <input
                        type="text"
                        required
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        placeholder="Например: DURANDESH Юнусабад"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Телефон филиала:</label>
                      <input
                        type="text"
                        value={newLocPhone}
                        onChange={(e) => setNewLocPhone(e.target.value)}
                        placeholder="+998 (71) 200-44-25"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Discount Program for regular customers */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-amber-500" />
                          <span>Работает со скидками для постоянных клиентов:</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Разрешить автоматическое применение скидок по карте лояльности при записи в этот филиал
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newLocDiscountsEnabled}
                          onChange={(e) => setNewLocDiscountsEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {newLocDiscountsEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800">
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-1">Макс. скидка в филиале (%):</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={newLocDiscountPercentage}
                            onChange={(e) => setNewLocDiscountPercentage(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-1">Условия программы скидок:</label>
                          <input
                            type="text"
                            value={newLocDiscountDescription}
                            onChange={(e) => setNewLocDiscountDescription(e.target.value)}
                            placeholder="Скидка до 15% для постоянных гостей"
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {newLocCoordinates && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                      <span className="text-amber-400 font-sans font-medium">Координаты филиала:</span>
                      <span>{newLocCoordinates.lat.toFixed(5)}, {newLocCoordinates.lng.toFixed(5)}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setShowAddLocation(false)}
                      className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Сохранить филиал</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Locations List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(isOwner
                  ? locations
                  : locations.filter((l) => l.id === currentAdmin?.assignedLocationId || l.id === assignedLocation?.id)
                ).map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Branch Premises Photo with quick change button on hover */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group/img mb-3">
                        <img
                          src={loc.image || '/src/assets/images/beauty_salon_hero_1790181986499.jpg'}
                          alt={loc.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/src/assets/images/beauty_salon_hero_1790181986499.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                        <button
                          type="button"
                          onClick={() => handleStartEditLocation(loc)}
                          className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white"
                          title="Сменить фото помещения"
                        >
                          <Camera className="w-5 h-5 text-amber-400" />
                          <span className="text-[11px] font-semibold bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-700">
                            Сменить фото помещения
                          </span>
                        </button>
                        <div className="absolute bottom-2 left-2 text-[10px] text-zinc-300 font-medium px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 flex items-center gap-1">
                          <Building className="w-3 h-3 text-amber-500" />
                          <span>Фото помещения</span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                            <span>{loc.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-amber-300 border border-amber-500/30">
                              {loc.businessType === 'beauty_salon'
                                ? '💅 Салон красоты'
                                : loc.businessType === 'barbershop'
                                ? '💈 Барбершоп'
                                : '✨ Универсальный'}
                            </span>
                            {!isOwner && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Ваш закрепленный филиал
                              </span>
                            )}
                          </div>
                        </div>
                        {isOwner && locations.length > 1 && (
                          <button
                            onClick={() => deleteLocation(loc.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition-colors"
                            title="Удалить филиал"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{loc.address}</div>
                      <div className="text-[11px] text-amber-400 mt-0.5">{loc.metro}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{loc.workingHours} · {loc.phone}</div>

                      {/* Discounts status badge */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        {loc.discountsEnabled !== false ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            <span>Скидки постоянным: Да (до {loc.discountPercentage || 15}%)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                            <span>🔒 Фиксированные цены (без скидок)</span>
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{loc.rating || 4.95} ({loc.reviewsCount || 0} отзывов)</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleStartEditLocation(loc)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Редактировать филиал и фото</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL: Edit Location & Premises Photo */}
              {editingLocation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
                  <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Building className="w-5 h-5 text-amber-500" />
                          <span>Редактирование филиала и фото помещения</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Обновите фото интерьера помещения (файл с устройства, ссылка или каталог), адрес и параметры филиала.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingLocation(null)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditLocation} className="space-y-4">
                      {/* Image Picker for Branch Premises */}
                      <ImagePickerControl
                        category="branch"
                        label="Фотография помещения / интерьера филиала (с устройства, ссылка или каталог):"
                        value={editLocImage}
                        onChange={setEditLocImage}
                      />

                      {/* Map Picker */}
                      <BranchMapPicker
                        existingLocations={locations}
                        currentCoordinates={editLocCoordinates}
                        onSelectAddress={(data) => {
                          setEditLocAddress(data.address);
                          setEditLocMetro(data.metro);
                          setEditLocCoordinates(data.coordinates);
                        }}
                      />

                      {/* Format Selector: Beauty Salon, Barbershop, Universal */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Формат заведения:</span>
                          </label>
                          {!isOwner && (
                            <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Только владелец
                            </span>
                          )}
                        </div>

                        {isOwner ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditLocBusinessType('beauty_salon')}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                editLocBusinessType === 'beauty_salon'
                                  ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/50'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>💅 Салон красоты</span>
                                {editLocBusinessType === 'beauty_salon' && (
                                  <span className="text-amber-400 text-xs">✓</span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">Уход, маникюр, стрижки</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditLocBusinessType('barbershop')}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                editLocBusinessType === 'barbershop'
                                  ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/50'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>💈 Барбершоп</span>
                                {editLocBusinessType === 'barbershop' && (
                                  <span className="text-amber-400 text-xs">✓</span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">Мужской зал, борода, бритьё</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditLocBusinessType('universal')}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                editLocBusinessType === 'universal'
                                  ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/50'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>✨ Универсальный</span>
                                {editLocBusinessType === 'universal' && (
                                  <span className="text-amber-400 text-xs">✓</span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">Салон + мужской зал</div>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                            <span className="text-zinc-300 font-semibold">
                              {editLocBusinessType === 'beauty_salon' && '💅 Салон красоты'}
                              {editLocBusinessType === 'barbershop' && '💈 Барбершоп'}
                              {editLocBusinessType === 'universal' && '✨ Универсальный салон'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              Формат филиала закреплен владельцем сети
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Точный адрес:</label>
                          <input
                            type="text"
                            required
                            value={editLocAddress}
                            onChange={(e) => setEditLocAddress(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Метро / Ориентир:</label>
                          <input
                            type="text"
                            value={editLocMetro}
                            onChange={(e) => setEditLocMetro(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-zinc-300">Название филиала:</label>
                            {!isOwner && (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                                <Lock className="w-3 h-3" /> Только владелец
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            disabled={!isOwner}
                            value={editLocName}
                            onChange={(e) => setEditLocName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                              isOwner
                                ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-500'
                                : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 cursor-not-allowed'
                            }`}
                          />
                          {!isOwner && (
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Администратору запрещено изменять название и брендинг филиала.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Телефон филиала:</label>
                          <input
                            type="text"
                            value={editLocPhone}
                            onChange={(e) => setEditLocPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Часы работы:</label>
                          <input
                            type="text"
                            value={editLocHours}
                            onChange={(e) => setEditLocHours(e.target.value)}
                            placeholder="10:00 - 22:00"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Edit Discount Program */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Percent className="w-3.5 h-3.5 text-amber-500" />
                              <span>Работает со скидками для постоянных клиентов:</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              Включить или отключить применение скидок лояльности при онлайн-записи в этот филиал
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editLocDiscountsEnabled}
                              onChange={(e) => setEditLocDiscountsEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>

                        {editLocDiscountsEnabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800">
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">Макс. скидка в филиале (%):</label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={editLocDiscountPercentage}
                                onChange={(e) => setEditLocDiscountPercentage(Number(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">Условия программы скидок:</label>
                              <input
                                type="text"
                                value={editLocDiscountDescription}
                                onChange={(e) => setEditLocDiscountDescription(e.target.value)}
                                placeholder="Скидка до 20% для постоянных гостей"
                                className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setEditingLocation(null)}
                          className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                          Сохранить филиал
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MASTERS & PORTFOLIO OF HAIRCUTS */}
          {activeTab === 'masters' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400">
                    Управление барберами и фотографиями стрижек, которые они выполнили на реальных клиентах.
                  </div>
                </div>
                <button
                  onClick={() => setShowAddMaster(!showAddMaster)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить мастера</span>
                </button>
              </div>

              {/* Add Master Form */}
              {showAddMaster && (
                <form
                  onSubmit={handleCreateMaster}
                  className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/50 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Добавление нового мастера-парикмахера / стилиста:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddMaster(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Picker for Master Avatar */}
                  <ImagePickerControl
                    category="avatar"
                    label="Фотография мастера (загрузите файл с устройства, ссылку или выберите из каталога):"
                    value={newMasterAvatar}
                    onChange={setNewMasterAvatar}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Имя и фамилия мастера:</label>
                      <input
                        type="text"
                        required
                        value={newMasterName}
                        onChange={(e) => setNewMasterName(e.target.value)}
                        placeholder="Например: Артем Васильев"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Специализация / Должность:</label>
                      <input
                        type="text"
                        value={newMasterTitle}
                        onChange={(e) => setNewMasterTitle(e.target.value)}
                        placeholder="Топ-стилист / Барбер"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Стаж работы (лет):</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={newMasterExp}
                        onChange={(e) => setNewMasterExp(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Филиалы (где принимает мастер):</label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !newMasterLocIds.includes(val)) {
                            setNewMasterLocIds([...newMasterLocIds, val]);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs"
                      >
                        <option value="">Выберите филиал (или все)</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Краткая биография и навыки:</label>
                    <textarea
                      rows={2}
                      value={newMasterBio}
                      onChange={(e) => setNewMasterBio(e.target.value)}
                      placeholder="Опыт в лучших салонах красоты и парикмахерских, авторские техники стрижек, окрашивание или ногтевой сервис..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setShowAddMaster(false)}
                      className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      Сохранить мастера
                    </button>
                  </div>
                </form>
              )}

              {/* Masters List with photo editing and portfolio management */}
              <div className="space-y-6">
                {masters.map((master) => {
                  const masterLocations = locations.filter((l) => (master.locationIds || []).includes(l.id));

                  return (
                    <div
                      key={master.id}
                      className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 transition-colors space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          {/* Master Avatar with hover to change photo */}
                          <div
                            onClick={() => handleStartEditMaster(master)}
                            className="relative group/avatar cursor-pointer w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover/avatar:border-amber-500 transition-all shrink-0 shadow-md"
                            title="Нажмите, чтобы поставить или изменить фото мастера"
                          >
                            <img
                              src={master.avatar}
                              alt={master.name}
                              className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/beauty_stylist_anna_1790182041832.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-medium gap-0.5">
                              <Camera className="w-4 h-4 text-amber-400" />
                              <span>Сменить</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-sm text-white">{master.name}</div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {master.experienceYears} лет стажа
                              </span>
                            </div>
                            <div className="text-xs text-amber-400 font-medium">{master.title}</div>
                            {masterLocations.length > 0 && (
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                Филиалы: {masterLocations.map((l) => l.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Master Action Buttons */}
                        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                          {/* Edit Master & Photo button */}
                          <button
                            type="button"
                            onClick={() => handleStartEditMaster(master)}
                            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                            title="Редактировать фото и данные мастера"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Редактировать мастера и фото</span>
                          </button>

                          {/* Manage Portfolio Photos button */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMasterForPortfolio(
                                selectedMasterForPortfolio === master.id ? null : master.id
                              )
                            }
                            className={`px-3 py-1.5 border text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                              selectedMasterForPortfolio === master.id
                                ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold'
                                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>
                              {selectedMasterForPortfolio === master.id
                                ? 'Скрыть работы'
                                : `Фото работ (${master.portfolio?.length || 0})`}
                            </span>
                          </button>

                          {masters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Вы уверены, что хотите удалить мастера ${master.name}?`)) {
                                  deleteMaster(master.id);
                                }
                              }}
                              className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition-colors"
                              title="Удалить мастера"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Manage portfolio photos of this master */}
                      {selectedMasterForPortfolio === master.id && (
                        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <Scissors className="w-3.5 h-3.5 text-amber-500" />
                              <span>Фотографии работ мастера {master.name} ({master.portfolio?.length || 0}):</span>
                            </div>
                            <span className="text-[11px] text-zinc-500">
                              Вы можете добавлять, редактировать или удалять любое фото
                            </span>
                          </div>

                          {/* Add photo sub-form */}
                          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-3">
                            <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Добавить новую фотографию работы в портфолио:</span>
                            </div>

                            {/* Photo Picker for Work */}
                            <ImagePickerControl
                              category="portfolio"
                              label="Фотография работы (с устройства, ссылка или галерея):"
                              value={newPortfolioImg}
                              onChange={setNewPortfolioImg}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-zinc-400 mb-1">Название работы / стрижки:</label>
                                <input
                                  type="text"
                                  value={newPortfolioTitle}
                                  onChange={(e) => setNewPortfolioTitle(e.target.value)}
                                  placeholder="Например: Balayage / Skin Fade / Маникюр Luxio"
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-zinc-400 mb-1">Категория / Тип услуги:</label>
                                <input
                                  type="text"
                                  value={newPortfolioType}
                                  onChange={(e) => setNewPortfolioType(e.target.value)}
                                  placeholder="Окрашивание / Стрижка / Ногти / Борода"
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">Описание деталей выполненной работы:</label>
                              <textarea
                                rows={2}
                                value={newPortfolioDesc}
                                onChange={(e) => setNewPortfolioDesc(e.target.value)}
                                placeholder="Опишите технику, оттенки, укладку или используемые премиум-материалы..."
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleAddPortfolioToMaster(master.id)}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Добавить работу в портфолио</span>
                              </button>
                            </div>
                          </div>

                          {/* Existing photos list with Edit and Delete capabilities */}
                          {master.portfolio && master.portfolio.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {master.portfolio.map((port) => (
                                <div
                                  key={port.id}
                                  className="relative group rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                                >
                                  <div
                                    onClick={() => setPreviewWorkModal(port)}
                                    className="aspect-[4/3] w-full cursor-pointer relative overflow-hidden bg-zinc-900"
                                  >
                                    <img
                                      src={port.imageUrl}
                                      alt={port.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = '/src/assets/images/beauty_hair_style_1790182007245.jpg';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="p-1.5 rounded-full bg-zinc-900/80 text-white">
                                        <Eye className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2.5 space-y-1">
                                    <div className="text-[11px] font-semibold text-white truncate" title={port.title}>
                                      {port.title}
                                    </div>
                                    <div className="text-[10px] text-amber-400 truncate">
                                      {port.haircutType || 'Работа мастера'}
                                    </div>
                                    {port.description && (
                                      <div className="text-[9px] text-zinc-500 line-clamp-1">
                                        {port.description}
                                      </div>
                                    )}

                                    {/* Action Buttons: Edit work & Delete work */}
                                    <div className="flex items-center gap-1 pt-1 border-t border-zinc-800/80 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditPortfolioItem(master.id, port)}
                                        className="flex-1 py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 text-[10px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1"
                                        title="Редактировать фото и описание работы"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Изменить</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Удалить работу "${port.title}" из портфолио?`)) {
                                            removeMasterPortfolioItem(master.id, port.id);
                                          }
                                        }}
                                        className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-md transition-colors"
                                        title="Удалить фото работы"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                              У этого мастера пока нет добавленных фотографий работ. Используйте форму выше, чтобы добавить первую фотографию.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MODAL 1: Edit Master Profile & Avatar */}
              {editingMaster && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
                  <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-amber-500" />
                          <span>Редактирование профиля и фото мастера</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Поставьте новое фото мастера (файл с устройства, ссылка или каталог) и отредактируйте данные.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingMaster(null)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditMaster} className="space-y-4">
                      {/* Image Picker for Master Avatar */}
                      <ImagePickerControl
                        category="avatar"
                        label="Фотография мастера (аватар):"
                        value={editMasterAvatar}
                        onChange={setEditMasterAvatar}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Имя и фамилия мастера:</label>
                          <input
                            type="text"
                            required
                            value={editMasterName}
                            onChange={(e) => setEditMasterName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Специализация / Должность:</label>
                          <input
                            type="text"
                            required
                            value={editMasterTitle}
                            onChange={(e) => setEditMasterTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Стаж работы (лет):</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={editMasterExp}
                            onChange={(e) => setEditMasterExp(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Контактный телефон:</label>
                          <input
                            type="text"
                            value={editMasterPhone}
                            onChange={(e) => setEditMasterPhone(e.target.value)}
                            placeholder="+998 (90) 000-00-00"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Биография, навыки и опыт:</label>
                        <textarea
                          rows={3}
                          value={editMasterBio}
                          onChange={(e) => setEditMasterBio(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Location checkboxes */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1.5">Принимает в филиалах:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {locations.map((loc) => {
                            const isChecked = editMasterLocIds.includes(loc.id);
                            return (
                              <label
                                key={loc.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                                    : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditMasterLocIds([...editMasterLocIds, loc.id]);
                                    } else {
                                      setEditMasterLocIds(editMasterLocIds.filter((id) => id !== loc.id));
                                    }
                                  }}
                                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="truncate">{loc.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setEditingMaster(null)}
                          className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                          Сохранить мастера
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 2: Edit Master Portfolio Item (Work & Photo) */}
              {editingPortfolioItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
                  <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-amber-500" />
                          <span>Редактирование фотографии работы мастера</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Замените фото выполненной работы (с устройства, ссылка или каталог) или измените название.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPortfolioItem(null)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditPortfolioItem} className="space-y-4">
                      {/* Image Picker for Portfolio Work */}
                      <ImagePickerControl
                        category="portfolio"
                        label="Фотография работы:"
                        value={editPortImg}
                        onChange={setEditPortImg}
                      />

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Название работы / стрижки:</label>
                        <input
                          type="text"
                          required
                          value={editPortTitle}
                          onChange={(e) => setEditPortTitle(e.target.value)}
                          placeholder="Например: Balayage / Skin Fade / Маникюр Luxio"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Категория / Тип услуги:</label>
                        <input
                          type="text"
                          value={editPortType}
                          onChange={(e) => setEditPortType(e.target.value)}
                          placeholder="Стрижка & Окрашивание / Fade / Ногти"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Описание работы и деталей:</label>
                        <textarea
                          rows={2}
                          value={editPortDesc}
                          onChange={(e) => setEditPortDesc(e.target.value)}
                          placeholder="Опишите особенности техники, использованные материалы..."
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setEditingPortfolioItem(null)}
                          className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                          Сохранить работу
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 3: Lightbox for previewing work */}
              {previewWorkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
                  <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <button
                      type="button"
                      onClick={() => setPreviewWorkModal(null)}
                      className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-zinc-950/70 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-zinc-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="aspect-[4/3] w-full bg-zinc-950">
                      <img
                        src={previewWorkModal.imageUrl}
                        alt={previewWorkModal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-sm font-bold text-white mb-1">{previewWorkModal.title}</div>
                      {previewWorkModal.haircutType && (
                        <div className="text-xs text-amber-400 mb-2">{previewWorkModal.haircutType}</div>
                      )}
                      {previewWorkModal.description && (
                        <div className="text-xs text-zinc-400 leading-relaxed">{previewWorkModal.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              
              {/* Batch price adjustment bar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    <span>Быстрое изменение и редактирование цен на стрижки</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Изменить все цены на выбранный процент или редактировать каждую стрижку вручную:
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => bulkAdjustPrices(10)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-zinc-700"
                  >
                    +10% ко всем ценам
                  </button>
                  <button
                    onClick={() => bulkAdjustPrices(-10)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold rounded-lg transition-colors border border-zinc-700"
                  >
                    -10% (акция)
                  </button>
                  <button
                    onClick={() => setShowAddService(!showAddService)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить вид стрижки</span>
                  </button>
                </div>
              </div>

              {/* Add Service Form */}
              {showAddService && (
                <form
                  onSubmit={handleCreateService}
                  className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-4"
                >
                  <div className="text-xs font-bold text-amber-400 uppercase">
                    Добавление нового вида стрижки / услуги:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Название стрижки / услуги:</label>
                      <input
                        type="text"
                        required
                        value={newSrvName}
                        onChange={(e) => setNewSrvName(e.target.value)}
                        placeholder="Например: Стрижка Side Part / Balayage"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Категория:</label>
                      <select
                        value={newSrvCat}
                        onChange={(e) => setNewSrvCat(e.target.value as ServiceCategory)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="hair_women">Женский зал & Стрижки</option>
                        <option value="hair_men">Мужской зал & Барберинг</option>
                        <option value="coloring">Окрашивание волос & Колористика</option>
                        <option value="nails">Ногтевой сервис (Маникюр / Педикюр)</option>
                        <option value="brows_lashes">Брови & Ресницы</option>
                        <option value="cosmetology">Косметология & СПА</option>
                        <option value="combo">Комплексы и пакеты</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Стоимость ({settings.currency}):</label>
                      <input
                        type="number"
                        required
                        value={newSrvPrice}
                        onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Длительность (минут):</label>
                      <input
                        type="number"
                        value={newSrvDuration}
                        onChange={(e) => setNewSrvDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Image Picker for Haircut & Service */}
                  <ImagePickerControl
                    category="service"
                    label="Фотография стрижки / услуги (загрузите файл с устройства, ссылку или выберите из каталога):"
                    value={newSrvImage}
                    onChange={setNewSrvImage}
                  />

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Описание стрижки:</label>
                    <textarea
                      rows={2}
                      value={newSrvDesc}
                      onChange={(e) => setNewSrvDesc(e.target.value)}
                      placeholder="Подробности о стрижке, укладке и подходящем типе волос..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      Сохранить услугу
                    </button>
                  </div>
                </form>
              )}

              {/* Services List with inline price editor & full editing */}
              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Service thumbnail with quick photo change overlay on hover */}
                      <div
                        onClick={() => handleStartEditService(srv)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 cursor-pointer group/thumb"
                        title="Нажмите, чтобы изменить фото стрижки"
                      >
                        <img
                          src={srv.image}
                          alt={srv.name}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/src/assets/images/haircut_fade_1790180920358.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{srv.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {srv.durationMinutes} мин · {srv.description ? srv.description.slice(0, 75) + '...' : 'Без описания'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-500">Цена:</span>
                        <input
                          type="number"
                          step={1000}
                          value={srv.price}
                          onChange={(e) => updateService(srv.id, { price: Number(e.target.value) })}
                          className="w-28 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 font-bold font-mono text-xs text-right"
                        />
                        <span className="text-xs text-zinc-400">{settings.currency}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartEditService(srv)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        title="Редактировать стрижку, фото и параметры"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Изменить</span>
                      </button>

                      {services.length > 1 && (
                        <button
                          onClick={() => deleteService(srv.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition-colors"
                          title="Удалить стрижку"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL: Edit Service & Haircut Photo */}
              {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
                  <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Scissors className="w-5 h-5 text-amber-500" />
                          <span>Редактирование стрижки / услуги и фото</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Загрузите фото стрижки со своего устройства или измените цену, название и описание.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditService} className="space-y-4">
                      {/* Image Picker for Service */}
                      <ImagePickerControl
                        category="service"
                        label="Фотография стрижки / услуги (файл с устройства, ссылка или каталог):"
                        value={editSrvImage}
                        onChange={setEditSrvImage}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Название стрижки / услуги:</label>
                          <input
                            type="text"
                            required
                            value={editSrvName}
                            onChange={(e) => setEditSrvName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Категория:</label>
                          <select
                            value={editSrvCat}
                            onChange={(e) => setEditSrvCat(e.target.value as ServiceCategory)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="hair_women">Женский зал & Стрижки</option>
                            <option value="hair_men">Мужской зал & Барберинг</option>
                            <option value="coloring">Окрашивание волос & Колористика</option>
                            <option value="nails">Ногтевой сервис (Маникюр / Педикюр)</option>
                            <option value="brows_lashes">Брови & Ресницы</option>
                            <option value="cosmetology">Косметология & СПА</option>
                            <option value="combo">Комплексы и пакеты</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Стоимость ({settings.currency}):</label>
                          <input
                            type="number"
                            required
                            value={editSrvPrice}
                            onChange={(e) => setEditSrvPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Длительность (минут):</label>
                          <input
                            type="number"
                            value={editSrvDuration}
                            onChange={(e) => setEditSrvDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Описание услуги:</label>
                        <textarea
                          rows={2}
                          value={editSrvDesc}
                          onChange={(e) => setEditSrvDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                          Сохранить стрижку
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ALL CLIENT APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Журнал всех онлайн-записей клиентов со всех филиалов:
              </div>

              {appointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Пока нет зарегистрированных записей клиентов.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                        <th className="py-2.5 px-3">ID / Дата</th>
                        <th className="py-2.5 px-3">Клиент & Телефон</th>
                        <th className="py-2.5 px-3">Филиал</th>
                        <th className="py-2.5 px-3">Мастер & Услуга</th>
                        <th className="py-2.5 px-3">Сумма</th>
                        <th className="py-2.5 px-3">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {appointments.map((apt) => {
                        const loc = locations.find((l) => l.id === apt.locationId);
                        const master = masters.find((m) => m.id === apt.masterId);
                        const srv = services.find((s) => s.id === apt.serviceId);

                        return (
                          <tr key={apt.id} className="hover:bg-zinc-800/40">
                            <td className="py-3 px-3">
                              <div className="font-mono text-zinc-400 font-bold">#{apt.id.slice(-6)}</div>
                              <div className="text-amber-400 font-medium">{apt.date} в {apt.time}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{apt.clientName}</div>
                              <div className="font-mono text-zinc-400 text-[11px]">{apt.clientPhone}</div>
                            </td>
                            <td className="py-3 px-3 text-zinc-300">
                              {loc?.name || 'Филиал'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-white font-medium">{srv?.name || 'Стрижка'}</div>
                              <div className="text-zinc-400 text-[11px]">{master?.name || 'Любой'}</div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-amber-400">
                              {apt.totalPrice.toLocaleString('ru-RU')} {settings.currency}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={apt.status}
                                onChange={(e) =>
                                  updateAppointmentStatus(apt.id, e.target.value as any)
                                }
                                className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                              >
                                <option value="confirmed">Подтверждена</option>
                                <option value="completed">Завершена</option>
                                <option value="cancelled">Отменена</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: REVIEWS MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Header and Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Средний рейтинг</div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>
                      {reviews.length > 0
                        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)
                        : '5.0'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Всего отзывов</div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {reviews.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">О филиалах</div>
                  <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                    {reviews.filter((r) => r.targetType === 'location').length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">О мастерах</div>
                  <div className="text-xl font-black text-amber-500 font-mono mt-0.5">
                    {reviews.filter((r) => r.targetType === 'master').length}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.targetType === 'location'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          }`}
                        >
                          {rev.targetType === 'location' ? 'Филиал: ' : 'Мастер: '}
                          {rev.targetName}
                        </span>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-800 text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-mono text-[11px]">{rev.date}</span>
                        <button
                          onClick={() => {
                            if (confirm('Удалить этот отзыв?')) {
                              deleteReview(rev.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                          title="Удалить отзыв"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 leading-relaxed">
                      "{rev.comment}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{rev.clientName}</span>
                        {rev.clientPhone && (
                          <span className="font-mono text-zinc-500">{rev.clientPhone}</span>
                        )}
                        {rev.serviceName && (
                          <span className="text-amber-400/80">({rev.serviceName})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-zinc-500">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="font-mono">{rev.likes || 0}</span>
                      </div>
                    </div>

                    {/* Official Salon Reply */}
                    {rev.adminReply ? (
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-amber-400 text-[11px]">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{rev.adminReply.author}</span>
                          </span>
                          <span className="text-zinc-500 text-[10px] font-mono">{rev.adminReply.date}</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          {rev.adminReply.text}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {replyingReviewId === rev.id ? (
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                            <label className="block text-[11px] font-semibold text-amber-400">
                              Официальный ответ клиенту:
                            </label>
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Напишите вежливый ответ от лица администрации или мастера..."
                              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (replyText.trim()) {
                                    replyToReview(rev.id, replyText, currentAdmin.name);
                                    setReplyingReviewId(null);
                                    setReplyText('');
                                  }
                                }}
                                className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
                              >
                                Опубликовать ответ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Ответить на отзыв</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Change Password Modal (For Main Owner or current admin) */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>
                    {currentAdmin.role === 'owner' ? '👑 Смена пароля главного владельца' : `Смена пароля: ${currentAdmin.name}`}
                  </span>
                </h4>
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordChangeError('');
                    setPasswordChangeSuccess('');
                  }}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Owner account info box */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Логин аккаунта:</span>
                  <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {currentAdmin.login}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Текущий пароль:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {showCurrentPassword ? currentAdmin.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1 text-zinc-500 hover:text-zinc-300"
                      title={showCurrentPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSelfPasswordChange} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] text-zinc-300 font-medium">
                      Новый пароль:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSelfNewPassword(!showSelfNewPassword)}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {showSelfNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSelfNewPassword ? 'Скрыть' : 'Показать'}</span>
                    </button>
                  </div>
                  <input
                    type={showSelfNewPassword ? 'text' : 'password'}
                    required
                    value={newSelfPassword}
                    onChange={(e) => setNewSelfPassword(e.target.value)}
                    placeholder="Введите новый надежный пароль (минимум 4 символа)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                    Повторите новый пароль для подтверждения:
                  </label>
                  <input
                    type={showSelfNewPassword ? 'text' : 'password'}
                    required
                    value={confirmSelfPassword}
                    onChange={(e) => setConfirmSelfPassword(e.target.value)}
                    placeholder="Повторите новый пароль"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {passwordChangeError && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                    {passwordChangeError}
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPasswordChangeError('');
                      setPasswordChangeSuccess('');
                    }}
                    className="px-3.5 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Сохранить новый пароль
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete Administrator (Owner Only) */}
        {adminToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-zinc-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Удалить администратора?
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Подтвердите отзыв прав и полное удаление аккаунта сотрудника
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Сотрудник:</span>
                  <strong className="text-white">{adminToDelete.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Логин для входа:</span>
                  <span className="font-mono text-amber-400 font-semibold">{adminToDelete.login}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Управляемый филиал:</span>
                  <span className="text-amber-300 font-medium">
                    {locations.find((l) => l.id === adminToDelete.assignedLocationId)?.name || 'Все филиалы'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-300/90 leading-relaxed">
                После удаления этот администратор больше не сможет войти в систему и управлять филиалом.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdminToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAdmin}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Да, удалить администратора</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Administrator (Change Branch & Password) */}
        {adminToEdit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-amber-500" />
                    <span>Настройка администратора</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Укажите, каким филиалом управляет администратор, или смените пароль
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminToEdit(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditAdmin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Имя / Должность сотрудника:
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1">
                  <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Каким филиалом управляет этот администратор:</span>
                  </label>
                  <select
                    value={editAdminBranchId}
                    onChange={(e) => setEditAdminBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        🏛 {loc.name} ({loc.address})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-zinc-400 block pt-1">
                    Администратор сможет входить и редактировать только этот филиал.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] text-zinc-400">
                      Новый пароль для администратора (необязательно):
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditAdminPassword(generateRandomPassword())}
                      className="text-[10px] text-amber-400 hover:underline font-medium"
                    >
                      Сгенерировать
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editAdminPassword}
                    onChange={(e) => setEditAdminPassword(e.target.value)}
                    placeholder="Оставьте пустым, чтобы оставить прежний пароль"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {editAdminError && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                    {editAdminError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAdminToEdit(null)}
                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
