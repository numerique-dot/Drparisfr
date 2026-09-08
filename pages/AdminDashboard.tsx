import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Users, 
  Image as ImageIcon, 
  Sparkles, 
  Plus, 
  Clock, 
  Languages, 
  Upload, 
  CheckCircle2, 
  Bell, 
  Check, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Percent,
  Calendar,
  MessageSquare,
  Shield,
  FileCheck2,
  Trash2,
  Activity,
  ArrowUpRight,
  Send,
  Sliders,
  DollarSign,
  Download,
  LogOut,
  KeyRound,
  RefreshCw,
  Tag,
  Edit3,
  Copy,
  FolderPlus,
  Layers,
  FileUp,
  FileDown,
  X,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Store,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { RECENT_REALIZATIONS } from '../constants';
import { RecentRealization, ServiceItem } from '../types';
import { 
  useAdminAuth, 
  setAdminLoggedIn, 
  getResolvedImageUrl, 
  useServices,
  PRESET_SERVICE_IMAGES,
  addCustomCategory,
  getAvailableCategories,
  saveStoredServices
} from '../lib/adminUtils';
import { auth, googleSignIn } from '../lib/firebase';
import { AdminTarifsManager } from '../components/AdminTarifsManager';

// --- DATA STRUCTURES ---

interface LoyaltyCard {
  id: string; // CARD-2026-XXX
  clientName: string;
  level: 'gold' | 'diamond' | 'silver';
  balance: number;
  points: number;
  benefits: string;
  status: 'active' | 'suspended';
  language: 'FR' | 'ZH' | 'EN';
  notes: string[];
}

interface StaffTask {
  id: string; // JOB-2026-XXX
  staffName: string;
  serviceTitle: string;
  duration: string;
  price: number;
  timeSlot: string;
  status: 'todo' | 'active' | 'done';
  evidencePhoto?: string;
}

interface StaffMember {
  name: string;
  role: string;
  shift: string;
  expertise: string[];
  avatar: string;
}

interface PromotionBanner {
  id: string;
  bannerName: string;
  imageUrl: string;
  altTexts: {
    FR: string;
    ZH: string;
    EN: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const isAdmin = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- INITIAL SEED DATA FOR DEMO & LOCAL STORAGE PERSISTENCE ---
  const defaultLoyaltyCards: LoyaltyCard[] = [
    {
      id: 'CARD-2026-001',
      clientName: 'Marie Dubois',
      level: 'gold',
      balance: 450,
      points: 1200,
      benefits: 'Inclut [N° 03 👑] Reste 2 fois',
      status: 'active',
      language: 'FR',
      notes: ['Adore le massage chinois des méridiens.', 'Peau sensible, éviter acides forts.']
    },
    {
      id: 'CARD-2026-002',
      clientName: '张伟 (Wei ZHANG)',
      level: 'diamond',
      balance: 1200,
      points: 3500,
      benefits: '假指甲项目享 9 折优惠 (10% discount on nail art)',
      status: 'active',
      language: 'ZH',
      notes: ['Prefer direct notifications in Chinese.', 'Prefers Yuki as primary specialist.']
    },
    {
      id: 'CARD-2026-003',
      clientName: 'Chloe Smith',
      level: 'silver',
      balance: 45,
      points: 250,
      benefits: 'Epilation: 10 sessions gets 1 free',
      status: 'suspended',
      language: 'EN',
      notes: ['Needs reminders 24h prior.']
    }
  ];

  const defaultStaff: StaffMember[] = [
    {
      name: 'Elodie',
      role: 'Esthéticienne & Lash Designer',
      shift: '10:00 — 18:00',
      expertise: ['Nails/Onglerie', 'Cils', 'Epilation'],
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=200'
    },
    {
      name: 'Yuki',
      role: 'Soin du Visage & Traditional Chinese Therapist',
      shift: '12:00 — 20:00',
      expertise: ['Massages Chinois', 'Soin Visage Lift', 'Corps'],
      avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200'
    }
  ];

  const defaultTasks: StaffTask[] = [
    {
      id: 'JOB-2026-0620',
      staffName: 'Elodie',
      serviceTitle: 'SPA semi-permanent (mains_009)',
      duration: '45 mins',
      price: 45,
      timeSlot: '11:00',
      status: 'active',
      evidencePhoto: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300'
    },
    {
      id: 'JOB-2026-0621',
      staffName: 'Elodie',
      serviceTitle: 'Extension Glamour (cils_002)',
      duration: '75 mins',
      price: 65,
      timeSlot: '14:30',
      status: 'todo'
    },
    {
      id: 'JOB-2026-0622',
      staffName: 'Yuki',
      serviceTitle: 'Soin du Visage Signature d\'Élite',
      duration: '75 mins',
      price: 95,
      timeSlot: '16:00',
      status: 'todo'
    }
  ];

  const defaultBanners: PromotionBanner[] = [
    {
      id: 'banner_hero',
      bannerName: 'Bannière d\'Accueil Principale (Hero Banner)',
      imageUrl: "/src/assets/images/luxury_nail_art_hero_1783649707172.jpg",
      altTexts: {
        FR: 'Maison de Beauté Paris 11 - D.R. Santé & Beauté',
        ZH: 'D.R. Santé & Beauté - 巴黎专业理疗与高品质美甲美睫沙龙',
        EN: 'Luxury Paris Beauty House - D.R. Salon Paris 11'
      }
    }
  ];

  // --- COMPONENT STATES ---
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>(() => {
    const saved = localStorage.getItem('dr_loyalty_cards');
    return saved ? JSON.parse(saved) : defaultLoyaltyCards;
  });

  const [tasks, setTasks] = useState<StaffTask[]>(() => {
    const saved = localStorage.getItem('dr_staff_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [banners, setBanners] = useState<PromotionBanner[]>(() => {
    const saved = localStorage.getItem('dr_banner_configs');
    return saved ? JSON.parse(saved) : defaultBanners;
  });

  const [staffList] = useState<StaffMember[]>(defaultStaff);

  // General Notification Alert States
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal / Input states for adding new Loyalty Card
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardLevel, setNewCardLevel] = useState<'gold' | 'diamond' | 'silver'>('silver');
  const [newCardBalance, setNewCardBalance] = useState(100);
  const [newCardLang, setNewCardLang] = useState<'FR' | 'ZH' | 'EN'>('FR');
  const [newCardBenefits, setNewCardBenefits] = useState('');

  // Selected User for topups/debits
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [pointsChange, setPointsChange] = useState<number>(0);

  // Task creation/assignment inputs
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [assignee, setAssignee] = useState('Elodie');
  const [taskService, setTaskService] = useState('Soin Signature Éclat & Deep Lift');
  const [taskDuration, setTaskDuration] = useState('75 mins');
  const [taskPrice, setTaskPrice] = useState(95);
  const [taskSlot, setTaskSlot] = useState('14:30');

  // Multi-language SMS/Notif trigger preview simulator state
  const [simulatedNotification, setSimulatedNotification] = useState<{
    clientName: string;
    lang: string;
    to: string;
    messageText: string;
    isOpen: boolean;
  } | null>(null);

  // Media Manager Banner replacement helper states
  const [uploadedBannerUrl, setUploadedBannerUrl] = useState<string | null>(null);
  const [bannerAltTexts, setBannerAltTexts] = useState({
    FR: 'Maison de Beauté Paris 11',
    ZH: 'D.R. Santé & Beauté 美容沙龙',
    EN: 'House of Beauty of Paris 11'
  });
  const [isReplacingBanner, setIsReplacingBanner] = useState(false);
  const [bannerProgressLog, setBannerProgressLog] = useState<string[]>([]);

  // Task portfolio evidence upload states
  const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState<string | null>(null);
  const [uploadedEvidenceUrl, setUploadedEvidenceUrl] = useState<string | null>(null);
  const [syncToPortfolio, setSyncToPortfolio] = useState(true);
  const [syncToKnowledgeBase, setSyncToKnowledgeBase] = useState(true);
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false);

  // Catalog & Services reactive hook
  const { services: catalogServices } = useServices();

  // Navigation tabs state for simplified workspace
  const [activeTab, setActiveTab] = useState<'tarifs' | 'reservations' | 'tasks' | 'photos' | 'loyalty'>('tarifs');

  const tabs = [
    { 
      id: 'tarifs' as const, 
      label: language === 'zh' ? '🏷️ 服务价目库' : '🏷️ Tarifs & Soins', 
      subLabel: language === 'zh' ? '项目增删改查' : '价目表增删改' 
    },
    { 
      id: 'reservations' as const, 
      label: language === 'zh' ? '📅 预约排期' : '📅 Réservations', 
      subLabel: language === 'zh' ? '客户预约与记账' : '预约与日常管理' 
    },
    { 
      id: 'tasks' as const, 
      label: language === 'zh' ? '👥 团队工单' : '👥 Équipe & Tâches', 
      subLabel: language === 'zh' ? '员工排班与工单' : '排班与员工任务' 
    },
    { 
      id: 'photos' as const, 
      label: language === 'zh' ? '📸 门面相册' : '📸 Photos & Vitrine', 
      subLabel: language === 'zh' ? '主页头图与照片' : '店铺主页与相册' 
    },
    { 
      id: 'loyalty' as const, 
      label: language === 'zh' ? '💳 会员储值' : '💳 Cartes Membres', 
      subLabel: language === 'zh' ? '积分与充值扣款' : '会员卡与充值管理' 
    },
  ];

  // --- CLIENT RESERVATIONS & CSV ACCOUNTING EXPORT STATES & ACTIONS ---
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [bookingSearch, setBookingSearch] = useState('');
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [nbClient, setNbClient] = useState('');
  const [nbPhone, setNbPhone] = useState('');
  const [nbEmail, setNbEmail] = useState('');
  const [nbService, setNbService] = useState("⭐ SOIN SIGNATURE — Soin du Visage");
  const [nbStaff, setNbStaff] = useState('Yuki');
  const [nbDate, setNbDate] = useState('2026-06-20');
  const [nbTime, setNbTime] = useState('14:00');
  const [nbPrice, setNbPrice] = useState('49');
  const [nbNotes, setNbNotes] = useState('');

  const [bookings, setBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem('dr_clinique_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }
    
    const demoBookings = [
      {
        id: 'BK-2026-001',
        service: "⭐ SOIN SIGNATURE — Soin du Visage",
        date: '2026-06-18',
        time: '14:30',
        staff: 'Yuki',
        name: 'Marie Dubois',
        phone: '06 12 34 56 78',
        email: 'marie.dubois@gmail.com',
        notes: 'Adore le massage chinois des méridiens.',
        rgpdConsent: true,
        price: '49',
        createdAt: '2026-06-10T10:30:00Z'
      },
      {
        id: 'BK-2026-002',
        service: 'SPA semi-permanent (Mains)',
        date: '2026-06-20',
        time: '11:00',
        staff: 'Elodie',
        name: '张伟 (Wei ZHANG)',
        phone: '+86 138-8888-8888',
        email: 'wei.zhang@wechat.cn',
        notes: 'Soin complet relaxant',
        rgpdConsent: true,
        price: '45',
        createdAt: '2026-06-15T09:15:00Z'
      },
      {
        id: 'BK-2026-003',
        service: 'Extension Naturel',
        date: '2026-06-22',
        time: '14:30',
        staff: 'Elodie',
        name: 'Chloe Smith',
        phone: '07 98 76 54 32',
        email: 'chloe.smith@outlook.com',
        notes: 'Needs reminders 24h prior.',
        rgpdConsent: true,
        price: '55',
        createdAt: '2026-06-16T14:00:00Z'
      },
      {
        id: 'BK-2026-004',
        service: 'Extension Glamour',
        date: '2026-06-25',
        time: '15:30',
        staff: 'Yuki',
        name: 'Léa Bernard',
        phone: '06 55 66 77 88',
        email: 'lea.b@example.fr',
        notes: 'Peau sensible',
        rgpdConsent: true,
        price: '65',
        createdAt: '2026-06-17T11:20:00Z'
      },
      {
        id: 'BK-2026-005',
        service: 'Soin Relaxant (60 min)',
        date: '2026-06-28',
        time: '10:00',
        staff: 'Yuki',
        name: 'Thomas Martin',
        phone: '06 22 33 44 55',
        email: 'thomas.martin@laposte.net',
        notes: 'Première visite',
        rgpdConsent: true,
        price: '50',
        createdAt: '2026-06-18T16:45:00Z'
      }
    ];
    localStorage.setItem('dr_clinique_bookings', JSON.stringify(demoBookings));
    return demoBookings;
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nbClient.trim()) return;

    const newId = `BK-2026-${String(bookings.length + 1).padStart(3, '0')}`;
    const newBooking = {
      id: newId,
      service: nbService,
      date: nbDate,
      time: nbTime,
      staff: nbStaff,
      name: nbClient,
      phone: nbPhone,
      email: nbEmail,
      notes: nbNotes,
      rgpdConsent: true,
      price: nbPrice,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('dr_clinique_bookings', JSON.stringify(updatedBookings));
    
    setIsAddBookingOpen(false);
    setNbClient('');
    setNbPhone('');
    setNbEmail('');
    setNbNotes('');
    
    triggerAlert(`Réservation ${newId} créée avec succès pour ${nbClient} !`);
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem('dr_clinique_bookings', JSON.stringify(updated));
      triggerAlert(`Réservation ${id} supprimée.`);
    }
  };

  const handleExportCSV = (selectedMonthOnly: boolean) => {
    let listToExport = bookings;
    
    if (selectedMonthOnly) {
      listToExport = bookings.filter(b => {
        if (!b.date) return false;
        return b.date.startsWith(selectedMonth);
      });
    }

    if (listToExport.length === 0) {
      triggerAlert(`Aucune réservation trouvée pour le mois ${selectedMonth} à exporter.`, "error");
      return;
    }

    // Header column fields
    const headers = [
      'ID Reservation',
      'Client',
      'Telephone',
      'Email',
      'Service / Soin',
      'Estheticienne / Praticien',
      'Date Heure',
      'Heure',
      'Tarif (€)',
      'Statut RGPD',
      'Notes / Diagnostic',
      'Date de Creation'
    ];

    const escapeCSV = (str: string | undefined | null) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [
      headers.join(','),
      ...listToExport.map(b => [
        escapeCSV(b.id || ''),
        escapeCSV(b.name || ''),
        escapeCSV(b.phone || ''),
        escapeCSV(b.email || ''),
        escapeCSV(b.service || ''),
        escapeCSV(b.staff || 'Yuki'),
        escapeCSV(b.date || ''),
        escapeCSV(b.time || ''),
        escapeCSV(b.price || '0'),
        b.rgpdConsent ? 'Accepte' : 'Non',
        escapeCSV(b.notes || ''),
        escapeCSV(b.createdAt || '')
      ].join(','))
    ];

    const csvContent = "\uFEFF" + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const filename = `DR_Institut_Reservations_${selectedMonthOnly ? selectedMonth : 'Global'}_Export.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    
    triggerAlert(`Fichier de comptabilité exporté : ${listToExport.length} réservation(s) transférée(s) (${filename}) !`);
  };

  // Save changes callback
  useEffect(() => {
    localStorage.setItem('dr_loyalty_cards', JSON.stringify(loyaltyCards));
  }, [loyaltyCards]);

  useEffect(() => {
    localStorage.setItem('dr_staff_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dr_banner_configs', JSON.stringify(banners));
  }, [banners]);

  // UI trigger to clear alert message
  const triggerAlert = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  // --- LOYALTY CARD METHODS ---

  const handleAddLoyaltyCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    const newId = `CARD-2026-${String(loyaltyCards.length + 1).padStart(3, '0')}`;
    const pointsCalc = Math.floor(newCardBalance * 2); // 2 points per euro loaded
    const newCard: LoyaltyCard = {
      id: newId,
      clientName: newCardName,
      level: newCardLevel,
      balance: newCardBalance,
      points: pointsCalc,
      benefits: newCardBenefits || (newCardLevel === 'gold' ? 'Inclut 1 Rituel Offert' : 'Avantages standards'),
      status: 'active',
      language: newCardLang,
      notes: ['Membre enregistré via le backoffice de direction.']
    };

    setLoyaltyCards(prev => [...prev, newCard]);
    setIsAddCardOpen(false);
    setNewCardName('');
    setNewCardBenefits('');
    triggerAlert(`Carte fidélité ${newId} créée avec succès pour ${newCardName} !`);

    // Simulated notify trigger due to custom locale
    triggerCustomNotification(newCard, `Création de carte / Activation - Solde initial : ${newCardBalance}€`);
  };

  const handleToggleCardStatus = (cardId: string) => {
    setLoyaltyCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const nextStatus = card.status === 'active' ? 'suspended' : 'active';
        triggerAlert(`Statut de la carte ${cardId} mis à jour : ${nextStatus === 'active' ? '🟢 Actif' : '🟡 Bloqué'}`);
        return { ...card, status: nextStatus };
      }
      return card;
    }));
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) return;

    setLoyaltyCards(prev => prev.map(card => {
      if (card.id === selectedCardId) {
        let newBalance = card.balance;
        let finalPoints = card.points;

        if (transactionType === 'credit') {
          newBalance += transactionAmount;
          finalPoints += pointsChange > 0 ? pointsChange : Math.floor(transactionAmount * 2);
          triggerAlert(`Crédit approuvé ! +${transactionAmount}€ ajoutés à ${card.clientName}.`);
        } else {
          if (newBalance < transactionAmount) {
            triggerAlert(`Le solde est insuffisant pour finaliser le débit de ${transactionAmount}€ (Solde actuel: ${card.balance}€).`, 'error');
            return card;
          }
          newBalance -= transactionAmount;
          finalPoints += pointsChange; // pointsChange is negative or custom
          triggerAlert(`Débit enregistré ! -${transactionAmount}€ retirés du solde de ${card.clientName}.`);
        }

        const updatedCard = { 
          ...card, 
          balance: newBalance, 
          points: Math.max(0, finalPoints)
        };

        // Fire multilingual automated alert simulator
        const alertMsg = transactionType === 'credit'
          ? `Votre compte fidélité a été crédité de ${transactionAmount}€. Nouveau solde : ${newBalance}€.`
          : `Débit de ${transactionAmount}€ effectué pour votre soin. Solde restant : ${newBalance}€.`;
        triggerCustomNotification(updatedCard, alertMsg);

        return updatedCard;
      }
      return card;
    }));

    setSelectedCardId(null);
    setTransactionAmount(0);
    setPointsChange(0);
  };

  // Automated language notification preview engine
  const triggerCustomNotification = (card: LoyaltyCard, rawInfo: string) => {
    let finalMessage = '';
    const phonePrefix = card.language === 'ZH' ? '+86 (WeChat Push)' : card.language === 'EN' ? '+1 (SMS Alert)' : '+33 (SMS Premium)';

    if (card.language === 'FR') {
      finalMessage = `[D.R. Santé & Beauté] Bonjour ${card.clientName}. Notification de votre Espace Privé : ${rawInfo} (Cumul : ${card.points} pts. Statut : ${card.level.toUpperCase()}).`;
    } else if (card.language === 'ZH') {
      const isCredit = rawInfo.toLowerCase().includes('crédit') || rawInfo.toLowerCase().includes('activation') || rawInfo.toLowerCase().includes('création');
      finalMessage = `【D.R. Santé & Beauté】尊贵的会员 ${card.clientName}，您的常客会员身份已更新。${isCredit ? '您的账户已成功存入/激活资金' : '您刚刚完成了一次美疗扣款'}。当前可用余额为: ${card.balance}€，累积积分: ${card.points} pts。`;
    } else {
      // English
      finalMessage = `[D.R. House of Beauty] Dear VIP ${card.clientName}, your loyalty status has been updated. Statement details: ${rawInfo}. Your current balance is now €${card.balance} (Loyalty tier: ${card.level.toUpperCase()}).`;
    }

    setSimulatedNotification({
      clientName: card.clientName,
      lang: card.language,
      to: phonePrefix,
      messageText: finalMessage,
      isOpen: true
    });
  };

  // --- STAFF & TASK METHODS ---

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const jobId = `JOB-2026-${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask: StaffTask = {
      id: jobId,
      staffName: assignee,
      serviceTitle: taskService,
      duration: taskDuration,
      price: taskPrice,
      timeSlot: taskSlot,
      status: 'todo'
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAddTaskOpen(false);
    triggerAlert(`Tâche ${jobId} assignée avec succès à ${assignee} (${taskService}) !`);
  };

  const handleUpdateTaskStatus = (taskId: string, nextStatus: 'todo' | 'active' | 'done') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (nextStatus === 'done' && !t.evidencePhoto) {
          // Open evidence photo uploader panel specifically for this job
          setSelectedTaskForEvidence(taskId);
          triggerAlert(`Veuillez importer ou valider l'image après-traitement pour compléter ${taskId}.`, 'info');
        } else {
          triggerAlert(`Statut de la tâche ${taskId} mis à jour : ${nextStatus.toUpperCase()}`);
        }
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // --- MEDIA MANAGER METHODS ---

  // Simulated drag and drop / upload compression processor
  const handleUploadBannerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReplacingBanner(true);
    setBannerProgressLog(['Initiation de la liaison de fichiers...', 'Analyse de la résolution native...']);

    let progress = 15;
    const interval = setInterval(() => {
      progress += 25;
      if (progress === 40) {
        setBannerProgressLog(prev => [...prev, 'Compression intelligente en cours (Niveaux de couleur optimisés)']);
      } else if (progress === 65) {
        setBannerProgressLog(prev => [...prev, 'Conversion au format de pointe Google WebP (Optimisation d\'indexation SEO)']);
      } else if (progress === 90) {
        setBannerProgressLog(prev => [...prev, 'Génération des balises "alt" multilingues de secours']);
      } else if (progress >= 100) {
        clearInterval(interval);
        // Create virtual local object url
        const fakeUrl = URL.createObjectURL(file);
        setUploadedBannerUrl(fakeUrl);
        setIsReplacingBanner(false);
        setBannerProgressLog([]);
        triggerAlert('Image promotionnelle optimisée avec succès et chargée.');
      }
    }, 400);
  };

  // Save promotional visual setup
  const handleSaveBannerConfig = () => {
    setBanners(prev => prev.map(b => {
      if (b.id === 'banner_hero') {
        return {
          ...b,
          imageUrl: uploadedBannerUrl || b.imageUrl,
          altTexts: { ...bannerAltTexts }
        };
      }
      return b;
    }));

    triggerAlert('Félicitations, la bannière d\'accueil a été mise à jour en direct ! La transition visuelle sera fluide.', 'success');
    setUploadedBannerUrl(null);
  };

  // Simulated completed task proof image upload
  const handleUploadEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEvidenceUploading(true);
    setTimeout(() => {
      // create simulated finished nail design photo link
      const fakeProgressUrl = 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600';
      setUploadedEvidenceUrl(fakeProgressUrl);
      setIsEvidenceUploading(false);
      triggerAlert('Image de rendu finalisé reçue par la cellule de validation.');
    }, 1200);
  };

    // Apply task evidence update and synchronize with front-end
  const handleSaveEvidence = () => {
    if (!selectedTaskForEvidence || !uploadedEvidenceUrl) return;

    const currentTask = tasks.find(t => t.id === selectedTaskForEvidence);

    setTasks(prev => prev.map(t => {
      if (t.id === selectedTaskForEvidence) {
        return {
          ...t,
          status: 'done',
          evidencePhoto: uploadedEvidenceUrl
        };
      }
      return t;
    }));

    // Trigger feedback simulation & actual synchronization
    let detailsStr = `Transformation JOB completed for ${currentTask?.serviceTitle || 'treatment'}`;
    
    if (syncToPortfolio && currentTask) {
      detailsStr += ' | [✓] Synchronisé avec le Portfolio dynamique d\'Accueil';
      
      // Load current realizations list or defaults
      let currentRealizations = RECENT_REALIZATIONS;
      const savedRealizations = localStorage.getItem('dr_recent_realizations');
      if (savedRealizations) {
        try {
          currentRealizations = JSON.parse(savedRealizations);
        } catch (e) {
          // ignore
        }
      }

      // Map service title to correct portfolio categories
      let inferredCategory = '⭐ SOIN SIGNATURE';
      const sTitle = currentTask.serviceTitle.toLowerCase();
      if (sTitle.includes('ongle') || sTitle.includes('mains') || sTitle.includes('nail') || sTitle.includes('manucure')) {
        inferredCategory = 'IV. BEAUTÉ DES MAINS';
      } else if (sTitle.includes('pied') || sTitle.includes('pédicure')) {
        inferredCategory = 'V. BEAUTÉ DES PIEDS';
      } else if (sTitle.includes('cil') || sTitle.includes('lash') || sTitle.includes('sourcil') || sTitle.includes('rehaussement')) {
        inferredCategory = 'III. EXTENSION DES CILS';
      } else if (sTitle.includes('relax') || sTitle.includes('massage') || sTitle.includes('modelage') || sTitle.includes('chinois') || sTitle.includes('corps')) {
        inferredCategory = 'II. SOINS RELAXANTS';
      } else if (sTitle.includes('capsule') || sTitle.includes('faux') || sTitle.includes('extension d\'ongles')) {
        inferredCategory = 'VI. POSE FAUX-ONGLES';
      }

      const newRealization: RecentRealization = {
        id: 'rec-' + Date.now(),
        title: `${currentTask.serviceTitle} Sublime`,
        category: inferredCategory,
        image: uploadedEvidenceUrl,
        timestamp: 'À l\'instant',
        likes: Math.floor(Math.random() * 15) + 5,
        treatment: currentTask.serviceTitle,
        physician: currentTask.staffName,
        serviceId: 'custom-realization'
      };

      const updatedRealizations = [newRealization, ...currentRealizations];
      localStorage.setItem('dr_recent_realizations', JSON.stringify(updatedRealizations));
    }

    if (syncToKnowledgeBase) detailsStr += ' | [✓] Injecté dans la base d\'entraînement visuelle de l\'IA';

    triggerAlert(`Preuve de bonne exécution validée : ${detailsStr}`, 'success');
    
    // Clear states
    setSelectedTaskForEvidence(null);
    setUploadedEvidenceUrl(null);
  };

  // Filter loyalty lists based on search
  const filteredCards = loyaltyCards.filter(card => 
    card.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    const handlePasscodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      const clean = passcode.trim();
      if (!clean || clean === '8888' || clean === 'admin' || clean === 'admin360' || clean === '123456') {
        setAdminLoggedIn(true);
      } else {
        setLoginError(
          language === 'zh'
            ? "密码不正确。请使用 8888 或 admin，或直接点击上方一键免密登入。"
            : language === 'en'
            ? "Incorrect passcode. Please use 8888 or admin, or click Quick Demo Login."
            : "Passcode incorrect. Veuillez réessayer ou utiliser le code 8888 / admin."
        );
      }
    };

    const handleGoogleLogin = async () => {
      setIsLoggingIn(true);
      setLoginError('');
      try {
        const result = await googleSignIn();
        if (result) {
          setAdminLoggedIn(true);
        }
      } catch (err: any) {
        console.error(err);
        setLoginError("Échec de la connexion Google : " + (err.message || "Erreur inconnue"));
      } finally {
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <div className="bg-slate-900/60 border border-purple-950/50 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 space-y-6 animate-scale-up text-center">
          <div className="flex justify-center">
            <LanguageSwitcher variant="pill" />
          </div>

          <div className="space-y-2">
            <div className="h-16 w-16 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/20">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {language === 'zh' ? '商家管理员后台' : language === 'en' ? 'Merchant Admin Console' : 'Espace de Direction'}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'zh' ? 'D.R. Santé & Beauté • 巴黎沙龙后台管理系统' : "Institut D.R. • Console d'administration sécurisée"}
            </p>
          </div>

          {/* Quick 1-click login button */}
          <button
            type="button"
            onClick={() => setAdminLoggedIn(true)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {language === 'zh' ? '⚡ 商家一键免密快速登入 (Demo)' : language === 'en' ? '⚡ One-Click Instant Access (Demo)' : '⚡ Accès Rapide Démo (Sans mot de passe)'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[9px] text-slate-500 uppercase font-black tracking-wider">
              {language === 'zh' ? '或使用密码登录' : language === 'en' ? 'Or login with password' : 'Ou avec mot de passe'}
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {language === 'zh' ? '管理员密码' : 'Passcode Administrateur'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={language === 'zh' ? '默认密码 8888 或 admin...' : "Saisissez votre code d'accès..."}
                  className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
              <p className="text-[9px] text-slate-400">
                {language === 'zh' ? (
                  <>预设密码：<code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-purple-300">8888</code> 或 <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-purple-300">admin</code></>
                ) : (
                  <>(Astuce : Utilisez le code <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-purple-300">8888</code> ou <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-purple-300">admin</code>)</>
                )}
              </p>
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 font-mono bg-rose-950/20 border border-rose-500/10 p-3 rounded-xl text-left">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-purple-500/15 transform active:scale-95 cursor-pointer"
            >
              {language === 'zh' ? '登入控制台' : 'Se Connecter'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '返回店铺前台' : language === 'en' ? 'Back to Storefront' : 'Retour au site public'}</span>
            </Link>
            <button
              type="button"
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className="hover:text-purple-300 transition flex items-center gap-1 text-[11px]"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Absolute high-tech background pattern */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-purple-950/20 via-slate-950/10 to-transparent pointer-events-none"></div>

      {/* --- DASHBOARD HEADER --- */}
      <div className="bg-slate-950 border-b border-purple-950/60 sticky top-0 z-20 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center text-primary">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded border border-purple-500/20">
                  {language === 'zh' ? '店长 / 商家超级管理员' : 'Directeur & Super-Admin'}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Institut D.R. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {language === 'zh' ? '商家管理员后台' : 'Console de Direction'}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick info badges and Navigation controls */}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
            <Link
              to="/"
              className="bg-slate-900 hover:bg-slate-850 border border-slate-750 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs font-bold"
              title={language === 'zh' ? '返回前台店铺' : 'Voir le site public'}
            >
              <Store className="w-3.5 h-3.5 text-accent" />
              <span>{language === 'zh' ? '前台店铺' : language === 'en' ? 'Storefront' : 'Voir le site'}</span>
            </Link>

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span>{language === 'zh' ? '系统: 运行正常 (Paris)' : 'Système : en ligne (Paris)'}</span>
            </div>

            <LanguageSwitcher variant="pill" />

            <button
              onClick={() => setAdminLoggedIn(false)}
              className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs font-bold uppercase tracking-wider cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '退出' : language === 'en' ? 'Sign out' : 'Quitter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative z-10">

        {/* FEEDBACK STATUS ALERT BANNER */}
        {alertMessage && (
          <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 animate-scale-up ${
            alertMessage.type === 'success' 
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200' 
              : alertMessage.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/30 text-rose-200'
              : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-200'
          }`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <span className="font-bold">Notification Système D.R. :</span> {alertMessage.text}
            </div>
          </div>
        )}

        {/* --- SYSTEM STATS METRICS ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-slate-950/50 border border-purple-950/40 rounded-3xl flex items-center justify-between hover:border-purple-500/20 transition-all cursor-pointer" onClick={() => setActiveTab('tarifs')}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
                {language === 'zh' ? '服务价目库 (Tarifs)' : 'Catalogue des Soins'}
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {catalogServices.length} {language === 'zh' ? '项护理' : 'Prestations'}
              </span>
              <span className="text-[10px] text-purple-300 mt-1 block">
                {language === 'zh' ? '点击配置价目与时长' : 'Tarifs & Soins administrables'}
              </span>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Tag className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-slate-950/50 border border-purple-950/40 rounded-3xl flex items-center justify-between hover:border-purple-500/20 transition-all cursor-pointer" onClick={() => setActiveTab('reservations')}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
                {language === 'zh' ? '客户预约日程 (RDV)' : 'Réservations & RDV'}
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {bookings.length} {language === 'zh' ? '条登记' : 'au registre'}
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 block">
                {language === 'zh' ? '预约日程与财务记账' : 'Planning & encaissements'}
              </span>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-slate-950/50 border border-purple-950/40 rounded-3xl flex items-center justify-between hover:border-purple-500/20 transition-all cursor-pointer" onClick={() => setActiveTab('loyalty')}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
                {language === 'zh' ? '会员卡储值总池' : 'Fidélité & Soldes'}
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {loyaltyCards.reduce((acc, curr) => acc + curr.balance, 0)} €
              </span>
              <span className="text-[10px] text-teal-400 mt-1 block">
                {loyaltyCards.length} {language === 'zh' ? '张已登记卡' : 'cartes enregistrées'}
              </span>
            </div>
            <div className="h-12 w-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-slate-950/50 border border-purple-950/40 rounded-3xl flex items-center justify-between hover:border-purple-500/20 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
                {language === 'zh' ? '团队工单进度' : 'Tâches Équipe'}
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {tasks.filter(t => t.status !== 'done').length} {language === 'zh' ? '进行中' : 'en cours'}
              </span>
              <span className="text-[10px] text-accent mt-1 block">
                {tasks.filter(t => t.status === 'done').length} {language === 'zh' ? '项已完成' : 'soins achevés'}
              </span>
            </div>
            <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- DYNAMIC MANAGEMENT TABS CONTROL PANEL --- */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/30">
              <Sliders className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                {language === 'zh' ? '商家管理模块控制台' : 'Console Simplifiée de Gestion'} <span className="text-xs text-accent font-medium">{language === 'zh' ? '(5大核心运营功能)' : '(5 Modules)'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'zh' ? '点击下方标签即可即时切换管理项目、预约、员工、相册与会员。' : 'Cliquez sur un onglet pour basculer de section de manière instantanée.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer flex flex-col items-center justify-center min-w-[130px] text-center ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[8.5px] opacity-75 font-normal capitalize font-sans tracking-tight mt-0.5">{tab.subLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            MODULE 0 : 🏷️ GESTION DES TARIFS & CARTE DES PRESTATIONS
            ======================================================== */}
        {activeTab === 'tarifs' && (
          <AdminTarifsManager triggerAlert={triggerAlert} />
        )}

        {/* ========================================================
            MODULE 1 : 💳 SYSTEME DE FIDELITE MULTILINGUE (LOYALTY CARD)
            ======================================================== */}
        {activeTab === 'loyalty' && (
          <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary rounded border border-primary/20">
                Outil Fidélisation & Rétention 2026
              </span>
              <h2 className="text-2xl font-black mt-2 text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" /> Espace Comptes de Fidélité Clients
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gérez les cartes membres D.R., effectuez des arbitrages de solde, insérez des diagnostics et suivez la traduction des alertes.
              </p>
            </div>

            <button
              onClick={() => setIsAddCardOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 self-start transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> Créer Carte Membre
            </button>
          </div>

          {/* Quick Filters and search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Rechercher par nom de client ou identifiant (ex: Marie, CARD-2026-002)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* List Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/30">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">N° Carte</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Niveau / Tier</th>
                  <th className="p-4">Compte (€ / points)</th>
                  <th className="p-4">Bénéfices Forfaits</th>
                  <th className="p-4">Notification Locale</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions de Trésorerie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      Aucune carte ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-purple-950/5 transition-colors">
                      {/* ID */}
                      <td className="p-4 font-mono font-bold text-slate-200">
                        {card.id}
                      </td>
                      {/* Client Name */}
                      <td className="p-4">
                        <span className="font-extrabold text-white block">{card.clientName}</span>
                        {card.notes && card.notes.length > 0 && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block line-clamp-1 italic">
                            💡 {card.notes[card.notes.length - 1]}
                          </span>
                        )}
                      </td>
                      {/* Level */}
                      <td className="p-4">
                        {card.level === 'diamond' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/50 border border-teal-500/30 text-teal-300 font-black">
                            💎 Diamant
                          </span>
                        )}
                        {card.level === 'gold' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300 font-bold">
                            🌟 Or/Gold
                          </span>
                        )}
                        {card.level === 'silver' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            🌸 Argent
                          </span>
                        )}
                      </td>
                      {/* Balances */}
                      <td className="p-4">
                        <div className="font-mono text-white font-extrabold text-[13px]">{card.balance} €</div>
                        <div className="font-mono text-[10px] text-purple-300 mt-0.5">{card.points} pts accumulés</div>
                      </td>
                      {/* Benefits */}
                      <td className="p-4 text-slate-300 max-w-xs">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded block text-[10.5px]">
                          {card.benefits}
                        </span>
                      </td>
                      {/* Auto Language link icon */}
                      <td className="p-4">
                        <button 
                          onClick={() => triggerCustomNotification(card, `Vérification manuelle des alertes.`)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 font-bold uppercase rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
                          title="Tester le push notification"
                        >
                          {card.language === 'ZH' ? '🇨🇳 中语' : card.language === 'EN' ? '🇬🇧 EN' : '🇫🇷 FR'}
                          <Bell className="w-3 h-3 text-purple-400" />
                        </button>
                      </td>
                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleCardStatus(card.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold select-none text-[9.5px] uppercase ${
                            card.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {card.status === 'active' ? '● Actif' : '● Suspendu'}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-right shrink-0">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCardId(card.id);
                              setTransactionType('credit');
                            }}
                            className="px-2.5 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/20 rounded text-[10px] font-bold text-purple-300 uppercase shrink-0"
                          >
                            + Créditer
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCardId(card.id);
                              setTransactionType('debit');
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-gray-300 uppercase shrink-0"
                          >
                            - Débiter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ========================================================
            MODULE 2 : 👥 GESTION DE L'EQUIPE & COMPTES-RENDUS DE SHIFT
            ======================================================== */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-scale-up">
          
          {/* Staff Roster Timings (Left Card) */}
          <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-mono text-purple-400 font-extrabold tracking-wider">Expertise Médicale</span>
              <h3 className="text-lg font-black text-white mt-1">👥 Équipe d'Esthéticiennes</h3>
              <p className="text-xs text-slate-400 mt-1">Visualisez les horaires de shift et l'expertise technique.</p>
            </div>

            <div className="space-y-4">
              {staffList.map((staff, idx) => (
                <div key={idx} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-start gap-3.5 group hover:border-purple-500/20 transition-all">
                  <img 
                    src={staff.avatar} 
                    alt={staff.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-purple-900/30"
                  />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      {staff.name}
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </h4>
                    <p className="text-[10.5px] text-gray-300 font-medium">{staff.role}</p>
                    <p className="text-[10px] text-emerald-400 font-bold tracking-wide">📅 Horaires : {staff.shift}</p>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {staff.expertise.map((exp, eIdx) => (
                        <span key={eIdx} className="text-[8.5px] bg-slate-900 text-purple-300 px-1.5 py-0.5 rounded border border-purple-900/30">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Task Assignment and Workflow Tracker (Middle/Right Cards) */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-accent font-extrabold tracking-wider">Active Taskboards</span>
                <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" /> Assignation des Tâches & Projets d'Aujourd'hui
                </h3>
              </div>

              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle Tâche
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-2xl border ${
                    task.status === 'done' 
                      ? 'bg-emerald-950/10 border-emerald-500/20' 
                      : task.status === 'active'
                      ? 'bg-purple-950/10 border-purple-500/20'
                      : 'bg-slate-950/30 border-slate-800'
                  } transition-all relative overflow-hidden`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      {/* Badge info */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.id}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 text-xs">Assigné à : <strong className="text-white">{task.staffName}</strong></span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">
                        {task.serviceTitle}
                      </h4>

                      <div className="flex items-center gap-4 text-[10.5px] text-slate-400 mt-2 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> Slot: {task.timeSlot} ({task.duration})</span>
                        <span>•</span>
                        <span className="text-teal-400 font-bold">{task.price} €</span>
                      </div>
                    </div>

                    {/* Left Actions / File validation */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto self-end sm:self-center shrink-0">
                      
                      {/* Evidence Preview if exists */}
                      {task.evidencePhoto && (
                        <div className="relative group rounded-xl overflow-hidden border border-emerald-500/20 max-w-[120px] self-start">
                          <img 
                            src={task.evidencePhoto} 
                            alt="Preuve" 
                            className="h-10 w-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                            <span className="text-[7.5px] uppercase font-black tracking-wider text-emerald-400">Vérifié ✓</span>
                          </div>
                        </div>
                      )}

                      {/* Dropdown status updater */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'done')}
                          disabled={task.status === 'done'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
                            task.status === 'done'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20 cursor-default'
                              : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3 h-3" /> {task.status === 'done' ? 'Fini ✓' : 'Valider'}
                        </button>

                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'active')}
                          disabled={task.status === 'active' || task.status === 'done'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                            task.status === 'active'
                              ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {task.status === 'active' ? 'En Cours' : 'Démarrer'}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ========================================================
            MODULE 3 : 📸 MEDIATHEQUE & MODIFICATION DE SELECTION DE MARQUE
            ======================================================== */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-scale-up">
          
          {/* Banner configuration (Left Card) */}
          <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider bg-accent/20 text-accent rounded border border-accent/20">
                SEO & Visual Design Manager
              </span>
              <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                <ImageIcon className="w-5.5 h-5.5 text-accent" /> Remplacement des Photos de Vitrine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Remplacez l'image d'impact de la bannière principale d'accueil et configurez des textes alternatifs correspondants aux trois langues de référencement.
              </p>
            </div>

            <div className="space-y-5 border border-slate-800 rounded-2xl p-4 bg-slate-950/60">
              <span className="text-[10px] font-mono text-indigo-400 font-extrabold">{banners[0].bannerName}</span>
              
              <div className="relative group rounded-xl overflow-hidden border border-slate-800 h-40">
                <img 
                  src={uploadedBannerUrl || getResolvedImageUrl(banners[0].imageUrl)} 
                  alt="Aperçu visuel" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <label className="cursor-pointer px-4 py-2.5 bg-black/80 hover:bg-black text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-400" />
                    Choisir une nouvelle photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadBannerImage}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Progress log simulator for WebP processing */}
              {isReplacingBanner && (
                <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-purple-500/20 text-[10px] font-mono">
                  {bannerProgressLog.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Multilingual Alt tag form */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span>Textes Alternatifs pour l'Indexation SEO (Alt tags) :</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider mb-1">🇫🇷 Edition Française</label>
                    <input 
                      type="text"
                      value={bannerAltTexts.FR}
                      onChange={(e) => setBannerAltTexts(prev => ({ ...prev, FR: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider mb-1">🇨🇳 Edition Chinoise</label>
                    <input 
                      type="text"
                      value={bannerAltTexts.ZH}
                      onChange={(e) => setBannerAltTexts(prev => ({ ...prev, ZH: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] uppercase font-bold text-slate-400 tracking-wider mb-1">🇬🇧 Edition Anglaise</label>
                    <input 
                      type="text"
                      value={bannerAltTexts.EN}
                      onChange={(e) => setBannerAltTexts(prev => ({ ...prev, EN: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Button Action */}
              <button
                onClick={handleSaveBannerConfig}
                className="w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest text-center transition-all bg-primary hover:bg-accent text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Appliquer et diffuser la photo d'accueil
              </button>
            </div>
          </div>

          {/* Validation Avant / Après completed proof uploads */}
          <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 rounded border border-teal-500/20">
                Avant/Après Proof Collector
              </span>
              <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                <FileCheck2 className="w-5.5 h-5.5 text-teal-400" /> Validation & Preuve de Traitement Réel
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lorsqu'une praticienne termine une tâche, décollez/validez le résultat en incorporant la photo finale pour alimenter automatiquement votre book de réalisations.
              </p>
            </div>

            {selectedTaskForEvidence ? (
              <div className="space-y-5 border border-purple-500/10 rounded-2xl p-5 bg-slate-950/80 animate-fade-in">
                <div className="p-3 bg-purple-900/10 border border-purple-500/20 rounded-xl text-xs flex items-center justify-between text-purple-200 font-medium">
                  <span>Traitement cible : <strong>{selectedTaskForEvidence}</strong></span>
                  <button onClick={() => setSelectedTaskForEvidence(null)} className="text-slate-400 hover:text-white">Annuler</button>
                </div>

                <div className="space-y-4">
                  {/* Image upload selector mockup */}
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-900/30">
                    {uploadedEvidenceUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={uploadedEvidenceUrl} 
                          alt="Preuve uploade" 
                          className="h-28 w-28 rounded-xl object-cover mx-auto shadow-lg"
                        />
                        <p className="text-[11px] text-emerald-400 font-bold">Image prête pour synchronisation ✓</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-slate-500 animate-bounce" />
                        <span className="text-xs text-slate-200 font-bold">Cliquez pour téléverser le motif onglerie ou rehaussement finalisé</span>
                        <span className="text-[10px] text-slate-400">Recommandé : PNG/JPG converti Webp</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleUploadEvidence} 
                          className="hidden" 
                        />
                      </label>
                    )}

                    {isEvidenceUploading && (
                      <div className="text-xs text-purple-400 flex items-center gap-2 mt-2">
                        <span className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                        <span>Compression & Traitement par nos serveurs...</span>
                      </div>
                    )}
                  </div>

                  {/* Feed synchronisers */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-xs text-slate-300 font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={syncToPortfolio}
                        onChange={(e) => setSyncToPortfolio(e.target.checked)}
                        className="rounded border-slate-800 text-primary focus:ring-1 focus:ring-primary w-4 h-4 bg-slate-900" 
                      />
                      <span>[✓] Synchroniser avec le Portfolio dynamique d'Accueil</span>
                    </label>

                    <label className="flex items-center gap-3 text-xs text-slate-300 font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={syncToKnowledgeBase}
                        onChange={(e) => setSyncToKnowledgeBase(e.target.checked)}
                        className="rounded border-slate-800 text-primary focus:ring-1 focus:ring-primary w-4 h-4 bg-slate-900" 
                      />
                      <span>[✓] Synchroniser avec la base d'entraînement visuelle de l'IA</span>
                    </label>
                  </div>

                  {/* Submission and validate */}
                  <button
                    onClick={handleSaveEvidence}
                    disabled={!uploadedEvidenceUrl}
                    className="w-full py-3 bg-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-teal-400 transition-all transform active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800"
                  >
                    Valider le Rendu, débloquer le statut & diffuser
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-800/80 rounded-2xl bg-slate-950/50 p-8 text-center flex flex-col items-center justify-center gap-4 h-64">
                <div className="h-12 w-12 bg-slate-900 text-slate-400 border border-slate-800 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Aucune tâche en attente de fichiers d'illustration</h4>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                    Cliquez sur le bouton "Valider" de n'importe quelle tâche de la liste ci-dessus pour charger sa preuve d'accomplissement de soin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ========================================================
            MODULE 4 : 📅 REGISTRE DES RÉSERVATIONS & EXPORT COMPTABILITÉ (CSV)
            ======================================================== */}
        {activeTab === 'reservations' && (
          <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/20">
                Liaison Comptabilité & Grand Livre de Caisse
              </span>
              <h2 className="text-2xl font-black mt-2 text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-400" /> Registre Général et Exports de Réservations
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Téléchargez les rapports financiers ou exportez la liste des rendez-vous au format CSV pour votre expert-comptable.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setIsAddBookingOpen(true)}
                className="px-4 py-2.5 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-purple-300" /> Saisir RDV Officiel
              </button>

              <button
                onClick={() => handleExportCSV(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition transform active:scale-95"
              >
                <FileCheck2 className="w-4 h-4" /> Exporter {selectedMonth} (CSV)
              </button>

              <button
                onClick={() => handleExportCSV(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition transform active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-400" /> Tous les mois (CSV)
              </button>
            </div>
          </div>

          {/* Filters & Comptabilité Analytics Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            {/* Filter by Month */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Période du Journal</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="2026-06">Juin 2026 (Mois en cours)</option>
                <option value="2026-05">Mai 2026 (Clôturé)</option>
                <option value="2026-04">Avril 2026 (Clôturé)</option>
                <option value="2026-07">Juillet 2026 (Prévisionnel)</option>
              </select>
            </div>

            {/* Live Booking Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Filtre Rapide Texte</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Filtrer par nom, email, soin..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Quick accounting values tracker */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">Volume d'affaires mensuel</span>
                <span className="text-lg font-black text-emerald-400 block mt-0.5 font-mono">
                  {bookings
                    .filter(b => b.date && b.date.startsWith(selectedMonth))
                    .reduce((sum, b) => sum + Number(b.price || 0), 0)} €
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                {bookings.filter(b => b.date && b.date.startsWith(selectedMonth)).length} transactions
              </div>
            </div>
          </div>

          {/* Bookings List table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/30">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Identifiant</th>
                  <th className="p-4">Membre & Contacts</th>
                  <th className="p-4">Soin Commandé</th>
                  <th className="p-4">Spécialiste</th>
                  <th className="p-4">Date de Rendez-vous</th>
                  <th className="p-4">Tarif (€)</th>
                  <th className="p-4">RGPD</th>
                  <th className="p-4 text-right">Arbitrage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.filter(b => {
                  const matchesMonth = b.date && b.date.startsWith(selectedMonth);
                  const matchesSearch = !bookingSearch || 
                    b.name?.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                    b.email?.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                    b.service?.toLowerCase().includes(bookingSearch.toLowerCase());
                  return matchesMonth && matchesSearch;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                      Aucun enregistrement comptable pour la période {selectedMonth} avec ce filtre.
                    </td>
                  </tr>
                ) : (
                  bookings.filter(b => {
                    const matchesMonth = b.date && b.date.startsWith(selectedMonth);
                    const matchesSearch = !bookingSearch || 
                      b.name?.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                      b.email?.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                      b.service?.toLowerCase().includes(bookingSearch.toLowerCase());
                    return matchesMonth && matchesSearch;
                  }).map((b) => (
                    <tr key={b.id} className="hover:bg-emerald-950/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-400 font-mono">
                        {b.id}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-white">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.phone} • {b.email}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {b.service}
                      </td>
                      <td className="p-4 text-purple-300">
                        {b.staff || 'Yuki'}
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-white font-bold">{b.date}</span> à <span className="text-amber-400">{b.time}</span>
                      </td>
                      <td className="p-4 font-mono font-extrabold text-emerald-400 text-[13px]">
                        {b.price || '49'} €
                      </td>
                      <td className="p-4 text-emerald-400">
                        <span className="bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9.5px]">✓ Oui</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1.5 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded transition-colors"
                          title="Supprimer la réservation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

      </div>

      {/* ========================================================
          POPUP MODALS & SIMULATOR NOTIFICATION DRAWERS
          ======================================================== */}

      {/* MODAL: ADD LOYALTY CARD */}
      {isAddCardOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Nouveau Profil Fidélité</h3>
              <button onClick={() => setIsAddCardOpen(false)} className="text-slate-400 hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleAddLoyaltyCard} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Nom Complet du Client</label>
                <input 
                  type="text" 
                  placeholder="Ex : Marie Dubois"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Niveau du Tier</label>
                  <select
                    value={newCardLevel}
                    onChange={(e) => setNewCardLevel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="silver">🌸 Argent (Silver)</option>
                    <option value="gold">🌟 Or (Gold)</option>
                    <option value="diamond">💎 Diamant (Diamond)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Solde Initial (€)</label>
                  <input 
                    type="number" 
                    value={newCardBalance}
                    onChange={(e) => setNewCardBalance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Langue de Notification</label>
                  <select
                    value={newCardLang}
                    onChange={(e) => setNewCardLang(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="FR">Français (FR)</option>
                    <option value="ZH">中国人 (ZH)</option>
                    <option value="EN">English (EN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Avantages Rattachés</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 10% sur les soins cils"
                    value={newCardBenefits}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    onChange={(e) => setNewCardBenefits(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-bold text-xs uppercase tracking-wider">
                <button 
                  type="button" 
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-accent"
                >
                  Créer Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION / TREASURY ARBITRAGE */}
      {selectedCardId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" /> Trésorerie : {transactionType === 'credit' ? 'Créditer la carte' : 'Débiter / Facturer la carte'}
              </h3>
              <button onClick={() => setSelectedCardId(null)} className="text-slate-400 hover:text-white text-base">✕</button>
            </div>

            <div className="p-3.5 bg-purple-900/10 border border-purple-500/20 rounded-2xl">
              <span className="text-[10px] text-purple-300 block font-mono">Compte bénéficiaire :</span>
              <span className="text-sm font-black text-white">
                {loyaltyCards.find(c => c.id === selectedCardId)?.clientName} ({selectedCardId})
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Solde actuel : <strong>{loyaltyCards.find(c => c.id === selectedCardId)?.balance} €</strong>
              </span>
            </div>

            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Montant de la Transaction (€)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Points de fidélité associés (Bonus/Pénalité)</label>
                <input 
                  type="number" 
                  value={pointsChange}
                  onChange={(e) => setPointsChange(Number(e.target.value))}
                  placeholder="Laissez à 0 pour un calcul automatique (x2 du montant)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[9.5px] text-slate-500 mt-1 block">La recharge crédite de la monnaie d'échange à utiliser pour les réservations.</span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-bold text-xs uppercase">
                <button 
                  type="button" 
                  onClick={() => setSelectedCardId(null)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 shadow"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className={`px-5 py-2.5 rounded-xl text-slate-950 font-black ${
                    transactionType === 'credit' ? 'bg-primary text-white hover:bg-accent' : 'bg-teal-400 hover:bg-teal-300'
                  }`}
                >
                  {transactionType === 'credit' ? 'Créditer' : 'Confirmer Débit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK TASKBOARD */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent animate-spin" /> Nouvelle Tâche Cabine
              </h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Praticienne Assignée</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Elodie">Elodie (Nails & Lashes)</option>
                  <option value="Yuki">Yuki (Visage & Massages Chinois)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Intitulé du Soin d'Esthétique / Code</label>
                <input 
                  type="text" 
                  required
                  value={taskService}
                  onChange={(e) => setTaskService(e.target.value)}
                  placeholder="Ex : Extension Cils Ultra-Glamour"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Durée</label>
                  <input 
                    type="text" 
                    required
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    placeholder="Ex: 45 min"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tarif associé (€)</label>
                  <input 
                    type="number" 
                    required
                    value={taskPrice}
                    onChange={(e) => setTaskPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Heure Planifiée (Format HH:MM)</label>
                <input 
                  type="text" 
                  required
                  value={taskSlot}
                  onChange={(e) => setTaskSlot(e.target.value)}
                  placeholder="Ex : 15:30"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-bold text-xs uppercase">
                <button 
                  type="button" 
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-accent"
                >
                  Assigner Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL BOOKING */}
      {isAddBookingOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Saisir un Rendez-vous En Registre
              </h3>
              <button onClick={() => setIsAddBookingOpen(false)} className="text-slate-400 hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Nom Complet du Client</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Robert Martin"
                    required
                    value={nbClient}
                    onChange={(e) => setNbClient(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Téléphone Client</label>
                  <input 
                    type="text" 
                    placeholder="Ex : 06 00 00 00 00"
                    required
                    value={nbPhone}
                    onChange={(e) => setNbPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Adresse Email</label>
                <input 
                  type="email" 
                  placeholder="Ex : client@example.com"
                  required
                  value={nbEmail}
                  onChange={(e) => setNbEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Type de Soin ciblé</label>
                  <select
                    value={nbService}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setNbService(selected);
                      const match = catalogServices.find(s => s.name === selected);
                      if (match && match.price) {
                        const numeric = match.price.replace(/[^0-9.]/g, '');
                        if (numeric) setNbPrice(numeric);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    {catalogServices.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.price || 'Tarif sur devis'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Esthéticienne en charge</label>
                  <select
                    value={nbStaff}
                    onChange={(e) => setNbStaff(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Yuki">Yuki</option>
                    <option value="Elodie">Elodie</option>
                    <option value="Chloé">Chloé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Date de RDV</label>
                  <input 
                    type="date" 
                    required
                    value={nbDate}
                    onChange={(e) => setNbDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Heure (HH:MM)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="14:00"
                    value={nbTime}
                    onChange={(e) => setNbTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tarif associé (€)</label>
                <input 
                  type="text" 
                  required
                  value={nbPrice}
                  onChange={(e) => setNbPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Notes internes / Diagnostic</label>
                <textarea 
                  rows={2}
                  placeholder="Notes de confort, contre-indications..."
                  value={nbNotes}
                  onChange={(e) => setNbNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-bold text-xs uppercase">
                <button 
                  type="button" 
                  onClick={() => setIsAddBookingOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500"
                >
                  Valider & Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATOR NOTIFICATION PANEL DRAWER */}
      {simulatedNotification?.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950 border-2 border-purple-500/50 rounded-3xl p-5 shadow-[0_20px_50px_rgba(112,26,236,0.3)] animate-scale-up text-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-purple-300 uppercase tracking-widest text-[9px]">
              <Bell className="w-3.5 h-3.5 text-primary animate-bounce shrink-0" />
              Alerte Smartphone Clients (Simulé)
            </span>
            <button 
              onClick={() => setSimulatedNotification(prev => prev ? { ...prev, isOpen: false } : null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Client : <strong>{simulatedNotification.clientName}</strong></span>
              <span>Canal : {simulatedNotification.to}</span>
            </div>

            <p className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-gray-200 leading-relaxed font-sans select-all">
              {simulatedNotification.messageText}
            </p>

            <span className="text-[9.5px] italic text-slate-500 block text-right">
              La notification s'est auto-générée en concordance directe avec la langue du client.
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
