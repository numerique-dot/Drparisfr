import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Check, 
  MapPin, 
  CreditCard,
  FileText,
  UserCheck,
  CalendarCheck2,
  Trash2,
  Plus,
  Bell,
  Lock,
  Settings,
  Shield,
  Info,
  CheckSquare,
  Square,
  MessageSquare,
  UserPlus,
  Gift,
  Award,
  Ticket,
  Copy,
  Sparkles,
  Search,
  Trophy
} from 'lucide-react';
import { PRACTITIONERS, COMPANY_INFO, Practitioner } from '../constants';
import { BookingFormData, BookingStatus, ServiceItem } from '../types';
import { getResolvedImageUrl, useServices } from '../lib/adminUtils';

interface SavedBooking extends BookingFormData {
  id: string;
  practitionerName: string;
  price: string;
  createdAt: string;
  reminders?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface ClaimedCoupon {
  id: string;
  rewardId: string;
  title: string;
  code: string;
  pointsSpent: number;
  claimedAt: string;
}

const Reservation: React.FC = () => {
  const { services: catalogServices, categories: bookingCategories } = useServices();
  const [searchParams] = useSearchParams();
  const preSelectedServiceName = searchParams.get('service') || '';
  const preSelectedPractitionerId = searchParams.get('practitioner') || '';
  
  // Find pre-selected service if any
  const initialService = catalogServices.find(s => s.name.toLowerCase() === preSelectedServiceName.toLowerCase()) || null;
  const initialPractitioner = PRACTITIONERS.find(p => p.id === preSelectedPractitionerId) || 'any';

  // Registered Client Profile
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    phone: string;
    email: string;
    emailReminders: boolean;
    smsReminders: boolean;
    whatsappNotifications: boolean;
  } | null>(null);

  // Active Menu Tab: 'book' (scheduling), 'my-bookings' (tracking), or 'account' (client profile)
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings' | 'account'>('book');

  // Reminders Selection in Booking Wizard step 4
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [whatsappReminder, setWhatsappReminder] = useState(false);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmailPref, setRegEmailPref] = useState(true);
  const [regSmsPref, setRegSmsPref] = useState(true);
  const [regWhatsappPref, setRegWhatsappPref] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Booking Wizard Steps: 1 = Service, 2 = Practitioner, 3 = Schedule, 4 = Info & Consent
  const [currentStep, setCurrentStep] = useState<number>(initialService ? (initialPractitioner !== 'any' ? 3 : 2) : 1);
  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([]);
  const [claimedCoupons, setClaimedCoupons] = useState<ClaimedCoupon[]>([]);
  const [newlyClaimedReward, setNewlyClaimedReward] = useState<ClaimedCoupon | null>(null);

  // States for live service search and filtering in step 1 of booking
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingCategory, setBookingCategory] = useState('Tous');

  // Selected entities
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(initialService);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | 'any'>(initialPractitioner);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Personal Form Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [rgpdConsent, setRgpdConsent] = useState(false);

  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<SavedBooking | null>(null);
  const [simulatedSmsSent, setSimulatedSmsSent] = useState<boolean>(false);
  const [simulatedEmailSent, setSimulatedEmailSent] = useState<boolean>(false);

  // Calendar Navigator States
  const [viewDate, setViewDate] = useState(new Date());

  // Load saved bookings and user profile from localStorage on mount
  useEffect(() => {
    // 1. Bookings list
    const list = localStorage.getItem('dr_clinique_bookings');
    if (list) {
      try {
        setSavedBookings(JSON.parse(list));
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }

    // 2. Client Profile
    const profile = localStorage.getItem('dr_clinique_registered_user');
    if (profile) {
      try {
        const u = JSON.parse(profile);
        setRegisteredUser(u);
        // Autofill personal form fields with profile
        setClientName(u.name || '');
        setClientPhone(u.phone || '');
        setClientEmail(u.email || '');
        setEmailReminder(u.emailReminders ?? true);
        setSmsReminder(u.smsReminders ?? true);
        setWhatsappReminder(u.whatsappNotifications ?? false);
      } catch (e) {
        console.error('Failed to parse registered user', e);
      }
    }

    // 3. Claimed Loyalty Vouchers
    const vouchers = localStorage.getItem('dr_clinique_claimed_coupons');
    if (vouchers) {
      try {
        setClaimedCoupons(JSON.parse(vouchers));
      } catch (e) {
        console.error('Failed to parse claimed coupons', e);
      }
    }
  }, []);

  // Sync state if preselected service/practitioner changes via URL query
  useEffect(() => {
    let serviceMatched: ServiceItem | null = null;
    if (preSelectedServiceName) {
      const match = catalogServices.find(s => s.name.toLowerCase() === preSelectedServiceName.toLowerCase());
      if (match) {
        setSelectedService(match);
        serviceMatched = match;
      }
    }
    
    let practitionerMatched = false;
    if (preSelectedPractitionerId) {
      const match = PRACTITIONERS.find(p => p.id === preSelectedPractitionerId);
      if (match) {
        setSelectedPractitioner(match);
        practitionerMatched = true;
      }
    }

    if (preSelectedServiceName || preSelectedPractitionerId) {
      if (serviceMatched && practitionerMatched) {
        setCurrentStep(3); // Go straight to scheduling
      } else if (serviceMatched) {
        setCurrentStep(2); // Go to choosing a practitioner
      } else if (practitionerMatched) {
        setCurrentStep(1); // Choose a service first (required)
      }
    }
  }, [preSelectedServiceName, preSelectedPractitionerId, catalogServices]);

  const filteredBookingServices = React.useMemo(() => {
    let result = catalogServices;
    if (bookingCategory !== 'Tous') {
      result = result.filter(s => s.category === bookingCategory);
    }
    if (bookingSearch.trim() !== '') {
      const q = bookingSearch.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [catalogServices, bookingCategory, bookingSearch]);

  // --- Calendar Math Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
  };

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const today = new Date();
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() === today.getFullYear()) return;
    setViewDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable Sundays (0)
    if (date.getDay() === 0) return true;
    
    return false;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = date.getTimezoneOffset();
    const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
    const dateStr = adjusted.toISOString().split('T')[0];
    
    setSelectedDateStr(dateStr);
    setSelectedTime(''); // Reset time selection on date swap
  };

  // --- Dynamic Time Slot Generator ---
  const generateTimeSlots = () => {
    if (!selectedDateStr) return [];
    
    // Generate deterministic available slots based on date + selected practitioner to simulate real calendar
    const seed = selectedDateStr.split('-').reduce((acc, part) => acc + parseInt(part), 0) + 
                 (selectedPractitioner === 'any' ? 7 : selectedPractitioner.id.charCodeAt(0));
    
    const slots = [];
    const today = new Date();
    const isTodaySelected = selectedDateStr === today.toISOString().split('T')[0];
    const currentHour = today.getHours();

    for (let h = 10; h < 20; h++) {
      // In clinical schedule, block lunch break (13:00 - 14:00)
      if (h === 13) continue;

      // Filter past times if today is selected
      if (isTodaySelected && h <= currentHour) continue;

      // Full hour
      if ((seed + h) % 8 !== 0) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
      }
      
      // Half hour
      if (h !== 19 && (seed + h + 30) % 6 !== 0) {
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  // --- Submissions & Local Storage Management ---
  const saveBookingToStorage = (newBooking: SavedBooking) => {
    const updated = [newBooking, ...savedBookings];
    setSavedBookings(updated);
    localStorage.setItem('dr_clinique_bookings', JSON.stringify(updated));
  };

  const handleCancelBooking = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      const filtered = savedBookings.filter(b => b.id !== id);
      setSavedBookings(filtered);
      localStorage.setItem('dr_clinique_bookings', JSON.stringify(filtered));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDateStr || !selectedTime || !rgpdConsent) {
      return;
    }

    setBookingStatus(BookingStatus.SUBMITTING);

    // Simulated short medical database insertion
    setTimeout(() => {
      const practitionerObj = selectedPractitioner === 'any' 
        ? 'Praticien Conseillé' 
        : PRACTITIONERS.find(p => p.id === selectedPractitioner.id)?.name || 'D.R Santé & Beauté';

      const bookingId = 'DR-' + Math.floor(100000 + Math.random() * 900000);

      const finalBooking: SavedBooking = {
        id: bookingId,
        service: selectedService.name,
        date: selectedDateStr,
        time: selectedTime,
        staff: selectedPractitioner === 'any' ? 'Indifférent' : selectedPractitioner.name,
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        notes: clientNotes,
        rgpdConsent: rgpdConsent,
        practitionerName: practitionerObj,
        price: selectedService.price || 'À la consultation',
        reminders: {
          email: emailReminder,
          sms: smsReminder,
          whatsapp: whatsappReminder
        },
        createdAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      saveBookingToStorage(finalBooking);
      setLastConfirmedBooking(finalBooking);
      setBookingStatus(BookingStatus.SUCCESS);
      
      // Reset form Wizard state
      setCurrentStep(1);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const resetWizard = () => {
    setSelectedService(null);
    setSelectedPractitioner('any');
    setSelectedDateStr('');
    setSelectedTime('');
    setClientNotes('');
    setBookingStatus(BookingStatus.IDLE);
    setLastConfirmedBooking(null);
    setBookingSearch('');
    setBookingCategory('Tous');
    setCurrentStep(1);
    setSimulatedSmsSent(false);
    setSimulatedEmailSent(false);
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regEmail) return;

    const newUser = {
      name: regName,
      phone: regPhone,
      email: regEmail,
      emailReminders: regEmailPref,
      smsReminders: regSmsPref,
      whatsappNotifications: regWhatsappPref
    };

    localStorage.setItem('dr_clinique_registered_user', JSON.stringify(newUser));
    setRegisteredUser(newUser);

    // Synchronize booking inputs with registered values
    setClientName(newUser.name);
    setClientPhone(newUser.phone);
    setClientEmail(newUser.email);
    setEmailReminder(newUser.emailReminders);
    setSmsReminder(newUser.smsReminders);
    setWhatsappReminder(newUser.whatsappNotifications);

    setRegSuccessMsg('Votre compte client a été créé et connecté avec succès !');
    setTimeout(() => {
      setRegSuccessMsg('');
      setActiveTab('book');
    }, 2000);
  };

  const handleLogoutClient = () => {
    if (window.confirm('Voulez-vous vous déconnecter de votre espace client ?')) {
      localStorage.removeItem('dr_clinique_registered_user');
      setRegisteredUser(null);
      
      // Clear local states
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setEmailReminder(true);
      setSmsReminder(true);
      setWhatsappReminder(false);

      // Clear reg form inputs
      setRegName('');
      setRegPhone('');
      setRegEmail('');
    }
  };

  // Loyalty Program Core Calculations & Mocks
  const MOCK_PAST_VISITS = [
    {
      id: 'HST-1024',
      service: 'Diagnostic Peau Visage & Éclat',
      practitioner: 'Thomas Mercier',
      date: '02 Juin 2026',
      points: 100,
      status: 'Terminé'
    },
    {
      id: 'HST-0842',
      service: 'Hydrafacial Élite Haute Performance',
      practitioner: 'Mélissa Valois',
      date: '15 Mai 2026',
      points: 100,
      status: 'Terminé'
    }
  ];

  const LOYALTY_REWARDS = [
    {
      id: 'rew_serum',
      title: 'Sérum Éclat Infusé',
      points: 100,
      description: 'Une miniature de sérum hydratant réparateur haut de gamme offerte après la consultation.',
      badge: 'Cadeau Produit',
      details: 'Offert lors de votre prochaine visite à l\'institut.'
    },
    {
      id: 'rew_diagnostic',
      title: 'Analyse Visage 3D',
      points: 200,
      description: 'Diagnostic de peau complet haute définition par scanner de visage lors de votre prochain soin.',
      badge: 'Soin Diagnostique',
      details: 'À réaliser en cabine avant votre séance.'
    },
    {
      id: 'rew_discount',
      title: 'Réduction Actes -15%',
      points: 350,
      description: 'Bénéficiez de 15% de réduction à valoir sur un de vos prochains peelings ou soin laser.',
      badge: 'Avantage Tarifaire',
      details: 'Déduit directement de votre facture.'
    },
    {
      id: 'rew_hydra_free',
      title: 'Hydrafacial Express Offert',
      points: 500,
      description: 'Une séance de 30 minutes de nettoyage hydro-vortex coup d\'éclat offerte.',
      badge: 'Soin Offert',
      details: 'À planifier sur appel ou à votre accueil.'
    }
  ];

  const welcomePoints = 150;
  const pastPointsSum = 200; // 100 + 100 from MOCK_PAST_VISITS
  const futurePointsSum = savedBookings.length * 100;
  const totalEarnedPoints = welcomePoints + pastPointsSum + futurePointsSum;
  const spentPoints = claimedCoupons.reduce((sum, coupon) => sum + coupon.pointsSpent, 0);
  const currentPoints = totalEarnedPoints - spentPoints;

  // Compute tiering
  let devTier = "Bronze";
  let devNextTierPoints = 300;
  let devProgress = (totalEarnedPoints / 300) * 100;
  if (totalEarnedPoints >= 500) {
    devTier = "Or (Privilège)";
    devNextTierPoints = 500;
    devProgress = 100;
  } else if (totalEarnedPoints >= 300) {
    devTier = "Argent (Premium)";
    devNextTierPoints = 500;
    devProgress = ((totalEarnedPoints - 300) / 200) * 100;
  }

  const handleRedeemReward = (reward: { id: string; title: string; points: number }) => {
    if (currentPoints < reward.points) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const couponCode = `DR-FID-${reward.id.split('_')[1].toUpperCase()}-${randomSuffix}`;
    
    const newCoupon: ClaimedCoupon = {
      id: `CPN-${Date.now()}`,
      rewardId: reward.id,
      title: reward.title,
      code: couponCode,
      pointsSpent: reward.points,
      claimedAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const updatedCoupons = [newCoupon, ...claimedCoupons];
    setClaimedCoupons(updatedCoupons);
    localStorage.setItem('dr_clinique_claimed_coupons', JSON.stringify(updatedCoupons));
    setNewlyClaimedReward(newCoupon);
  };

  // Calendar Layout variables
  const daysInCurrentMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div className="min-h-screen bg-neutral py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-primary font-extrabold tracking-widest text-xs uppercase bg-purple-100/80 px-4 py-1.5 rounded-full border border-purple-200">
            Réservations Beauté
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Prendre Rendez-vous en Ligne
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Planifiez votre soin dermo-esthétique, éclat ou corporel en quelques instants avec l'un de nos spécialistes experts.
          </p>
        </div>

        {/* Global tab manager */}
        <div className="flex justify-center mb-10 overflow-x-auto">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-purple-100 flex gap-2">
            <button
              onClick={() => { setActiveTab('book'); resetWizard(); }}
              id="tab-new-booking"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition duration-300 ${
                activeTab === 'book'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Nouveau Rendez-vous
            </button>
            <button
              onClick={() => { setActiveTab('my-bookings'); setBookingStatus(BookingStatus.IDLE); }}
              id="tab-my-bookings"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition duration-300 relative ${
                activeTab === 'my-bookings'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              Mes Réservations
              {savedBookings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white">
                  {savedBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('account'); setBookingStatus(BookingStatus.IDLE); }}
              id="tab-client-account"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition duration-300 relative ${
                activeTab === 'account'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              {registeredUser ? `Espace Client` : 'Espace Client / Rappels'}
              {registeredUser && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          </div>
        </div>

        {/* TAB CONTENT: SUCCESS APPOINTMENT REVEAL */}
        {bookingStatus === BookingStatus.SUCCESS && lastConfirmedBooking && (
          <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden animate-fade-in max-w-2xl mx-auto">
            
            {/* Header Success Ribbon */}
            <div className="bg-green-650 bg-emerald-600 text-white p-8 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check className="h-10 w-10 text-white stroke-[3px]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Réservation Confirmée !</h2>
              <p className="text-emerald-100 text-sm mt-1">Numéro de dossier : <span className="font-mono font-bold tracking-wider text-white">{lastConfirmedBooking.id}</span></p>
            </div>

            {/* Recap Invoice layout */}
            <div className="p-8 space-y-6">
              
              <div className="bg-gray-550 bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-200/60 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{lastConfirmedBooking.service}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Avec {lastConfirmedBooking.practitionerName}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary font-bold text-base px-4 py-1.5 rounded-xl border border-primary/20">
                    {lastConfirmedBooking.price}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Date & Heure</span>
                    <span className="font-bold text-gray-800 text-base flex items-center gap-1.5 mt-1">
                      <CalendarIcon className="w-4 h-4 text-purple-500" />
                      {new Date(lastConfirmedBooking.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      <span className="text-gray-300">|</span>
                      {lastConfirmedBooking.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Lieu de Consultation</span>
                    <span className="font-semibold text-gray-700 text-sm flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                      {COMPANY_INFO.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informative Instructions */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-primary" /> Conseils de préparation :</p>
                <ul className="list-disc list-inside space-y-1 text-purple-950">
                  <li>Veuillez vous présenter 10 minutes avant l'heure de votre rendez-vous.</li>
                  <li>Pour les soins visage et peelings, évitez de vous maquiller avant l'intervention.</li>
                  <li>Un email récapitulatif contenant votre bon de consultation a été généré avec succès.</li>
                </ul>
              </div>

              {/* Client Info Grid */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">Informations Client</h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
                  <div>
                    <span className="text-gray-400 block text-xs">Nom</span>
                    <span className="font-medium text-gray-700">{lastConfirmedBooking.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Téléphone</span>
                    <span className="font-medium text-gray-700">{lastConfirmedBooking.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-xs">Adresse Email</span>
                    <span className="font-medium text-gray-700">{lastConfirmedBooking.email}</span>
                  </div>
                  {lastConfirmedBooking.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block text-xs">Précisions transmises</span>
                      <p className="text-gray-650 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-xs italic mt-1">{lastConfirmedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SYSTEME DE RAPPELS ET CONFIRMATIONS SIMULATION */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  <h4 className="font-bold text-gray-900 text-base">Rappels & Confirmations Automatiques</h4>
                </div>
                <p className="text-gray-650 text-xs leading-relaxed">
                  Notre système de réservation en ligne intègre un moteur de notification automatique. Pour garantir l'assiduité et la qualité de la relation client, des notifications immédiates de confirmation et des rappels de courtoisie sont envoyés en temps réel <strong>au Client</strong> et <strong>au Salon de Beauté</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* CLIENT NOTIFICATION BOX */}
                  <div className="border border-purple-100 bg-purple-50/35 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">CÔTÉ CLIENT</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Prêt</span>
                      </div>
                      <h5 className="font-bold text-gray-800 text-xs mt-2.5">📨 Alerte de Confirmation & Rappel 24h</h5>
                      <p className="text-[11px] text-gray-500 leading-normal mt-1">
                        Le client reçoit un email immédiat récapitulatif ainsi qu’un SMS de rappel programmé 24h avant l'heure du soin.
                      </p>

                      <div className="bg-white rounded-xl p-3 border border-purple-100/60 shadow-sm text-[11px] mt-3 font-sans space-y-1">
                        <p className="font-bold text-gray-800 text-[10px] uppercase border-b border-gray-100 pb-1 flex items-center justify-between">
                          <span>SMS de rappel :</span>
                          <span className="text-primary normal-case font-mono">{lastConfirmedBooking.phone}</span>
                        </p>
                        <p className="text-gray-600 italic leading-snug pt-1">
                          "D.R Santé & Beauté : Bonjour {lastConfirmedBooking.name}, nous vous rappelons votre rdv pour le soin <strong className="text-purple-650">{lastConfirmedBooking.service}</strong> le {new Date(lastConfirmedBooking.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à <strong className="text-primary">{lastConfirmedBooking.time}</strong>."
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedSmsSent(true);
                          setTimeout(() => setSimulatedSmsSent(false), 5000);
                        }}
                        className="w-full bg-primary text-white text-[10px] uppercase font-extrabold py-2 px-3 rounded-lg hover:bg-accent transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        ⚡ Simuler l'envoi du SMS Client
                      </button>
                      {simulatedSmsSent && (
                        <div className="mt-2 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[10px] border border-emerald-100 font-semibold animate-scale-up text-center">
                          ✓ SMS de rappel reçu instantanément sur le portable du client !
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SALON NOTIFICATION BOX */}
                  <div className="border border-amber-100 bg-amber-50/20 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">CÔTÉ SALON</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Actif</span>
                      </div>
                      <h5 className="font-bold text-gray-800 text-xs mt-2.5">💼 Alerte Gérant & Synchronisation Registre</h5>
                      <p className="text-[11px] text-gray-500 leading-normal mt-1">
                        Le gérant reçoit une notification de synchronisation sur l'e-mail du salon et l'agenda de l'esthéticienne est actualisé.
                      </p>

                      <div className="bg-white rounded-xl p-3 border border-amber-100/60 shadow-sm text-[11px] mt-3 font-sans space-y-1">
                        <p className="font-bold text-amber-800 text-[10px] uppercase border-b border-gray-100 pb-1 flex items-center justify-between">
                          <span>Alerte Email Gérant :</span>
                          <span className="text-amber-700 normal-case font-mono">{COMPANY_INFO.email}</span>
                        </p>
                        <p className="text-gray-600 pt-1 text-[10.5px]">
                          <strong>Objet :</strong> <span className="text-gray-900 font-medium">[Nouveau RDV Institut] {lastConfirmedBooking.name}</span>
                          <span className="block mt-1">Le registre d'agenda vient d'enregistrer le soin {lastConfirmedBooking.service} à {lastConfirmedBooking.time} attribué à {lastConfirmedBooking.practitionerName}.</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedEmailSent(true);
                          setTimeout(() => setSimulatedEmailSent(false), 5000);
                        }}
                        className="w-full bg-slate-900 text-white text-[10px] uppercase font-extrabold py-2 px-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        📧 Simuler le Mail d'Alerte Salon
                      </button>
                      {simulatedEmailSent && (
                        <div className="mt-2 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[10px] border border-emerald-100 font-semibold animate-scale-up text-center">
                          ✓ Alerte gérant envoyée au Salon et synchronisée dans le tableau de bord Admin !
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action items */}
              <div className="border-t border-gray-150 pt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className="flex-1 bg-gray-900 text-white font-bold py-3.5 px-6 rounded-full hover:bg-gray-800 transition duration-200 text-sm text-center shadow-md"
                >
                  Voir mes réservations
                </button>
                <button
                  onClick={resetWizard}
                  className="flex-1 bg-purple-50 text-primary border border-purple-100 font-bold py-3.5 px-6 rounded-full hover:bg-purple-100/60 transition duration-200 text-sm text-center"
                >
                  Prendre un autre rendez-vous
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB CONTENT: WIZARD SCHEDULER PANEL */}
        {activeTab === 'book' && bookingStatus !== BookingStatus.SUCCESS && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: The Booking Wizard */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
            
            {/* Step Wizard Header */}
            <div className="bg-slate-900 text-white p-6 md:px-10 flex flex-nowrap items-center justify-between gap-2 overflow-x-auto border-b border-purple-500/20 scrollbar-none select-none">
              {[
                { n: 1, label: 'Soin' },
                { n: 2, label: 'Praticien' },
                { n: 3, label: 'Horaire' },
                { n: 4, label: 'Client' }
              ].map(step => (
                <div key={step.n} className="flex items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                      currentStep === step.n
                        ? 'bg-primary text-white ring-4 ring-purple-600/35'
                        : currentStep > step.n
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {currentStep > step.n ? '✓' : step.n}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      currentStep === step.n ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {step.n < 4 && <div className="w-12 md:w-20 h-[2px] bg-slate-850 bg-slate-800 mx-3 rounded-full opacity-60"></div>}
                </div>
              ))}
            </div>

            {/* MAIN WIZARD VIEWPORTS */}
            <div className="p-6 md:p-10 min-h-[460px]">
              
              {/* STEP 1: CHOOSE SERVICE */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="h-6 w-1 bg-primary rounded-full inline-block"></span>
                      Sélectionnez votre prestation d'esthétique ou de beauté
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">Parcourez nos catégories ou tapez un mot-clé pour trouver le soin idéal.</p>
                  </div>

                  {/* Search bar & Categories filter */}
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder="Rechercher par soin (Ex: vernis, cils, massage...)"
                        className="w-full bg-gray-550 bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-10 text-xs font-semibold text-gray-700 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition shadow-sm"
                      />
                      {bookingSearch && (
                        <button
                          type="button"
                          onClick={() => setBookingSearch('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {bookingCategories.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setBookingCategory(category)}
                          className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                            bookingCategory === category
                              ? 'bg-primary text-white shadow-md shadow-purple-100 ring-1 ring-primary/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100/75 border border-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empty state for search */}
                  {filteredBookingServices.length === 0 && (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-205 border-gray-200">
                      <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-gray-700">Aucun soin ne correspond à votre recherche</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Essayez d'autres termes d'interrogation ou réinitialisez les filtres.</p>
                      <button
                        type="button"
                        onClick={() => { setBookingSearch(''); setBookingCategory('Tous'); }}
                        className="mt-4 px-4 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition"
                      >
                        Réinitialiser la recherche
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {filteredBookingServices.map(service => {
                      const Icon = service.icon;
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => { setSelectedService(service); setCurrentStep(2); }}
                          className={`group cursor-pointer rounded-2xl p-5 border-2 text-left transition-all flex flex-col justify-between h-full hover:border-primary hover:shadow-md ${
                            isSelected
                              ? 'border-primary bg-purple-50 shadow ring-1 ring-primary/35'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <h4 className="font-bold text-sm text-gray-901 text-gray-900 group-hover:text-primary transition-colors">
                                {service.name}
                              </h4>
                              {Icon && <Icon className="w-4.5 h-4.5 text-primary shrink-0" />}
                            </div>
                            <p className="text-gray-400 text-[10px] tracking-wider font-extrabold uppercase mb-2">
                              {service.category}
                            </p>
                            <p className="text-gray-600 text-xs leading-relaxed mb-4">
                              {service.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="w-4 h-4 mr-1 text-primary/75" />
                              {service.duration}
                            </span>
                            <span className="font-bold text-primary text-sm">
                              {service.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE PRACTITIONER */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="h-6 w-1 bg-primary rounded-full inline-block"></span>
                      Choisissez votre conseillère de soin
                    </h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      &larr; Retour étape précédente
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* "INDIFFÉRENT" PORT CARD */}
                    <div
                      onClick={() => { setSelectedPractitioner('any'); setCurrentStep(3); }}
                      className={`cursor-pointer rounded-2xl p-5 border-2 text-center flex flex-col items-center justify-center transition-all min-h-[220px] hover:border-primary group ${
                        selectedPractitioner === 'any'
                          ? 'border-primary bg-purple-50 shadow ring-1 ring-primary/35'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="h-16 w-16 bg-purple-100 text-primary border-2 border-purple-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <UserCheck className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">Praticien Conseillé</h4>
                      <p className="text-gray-500 text-xs mt-1.5 px-2">
                        Attribue votre créneau au spécialiste le plus tôt disponible.
                      </p>
                    </div>

                    {/* PRACTITIONER CARDS */}
                    {PRACTITIONERS.map(practitioner => {
                      const isSelected = selectedPractitioner !== 'any' && selectedPractitioner.id === practitioner.id;
                      return (
                        <div
                          key={practitioner.id}
                          onClick={() => { setSelectedPractitioner(practitioner); setCurrentStep(3); }}
                          className={`cursor-pointer rounded-2xl p-4 border-2 text-center flex flex-col justify-between transition-all hover:border-primary ${
                            isSelected
                              ? 'border-primary bg-purple-50 shadow ring-1 ring-primary/35'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <img
                              src={getResolvedImageUrl(practitioner.image)}
                              alt={practitioner.name}
                              className="h-20 w-20 rounded-full object-cover border-2 border-purple-100 mb-3"
                            />
                            <h4 className="font-bold text-gray-900 text-base">{practitioner.name}</h4>
                            <p className="text-primary text-xs font-bold tracking-wider mt-0.5">{practitioner.role}</p>
                          </div>
                          
                          <p className="text-gray-500 text-xs border-t border-gray-100 pt-3 mt-4">
                            {practitioner.specialty}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME SCHEDULING GRID */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="h-6 w-1 bg-primary rounded-full inline-block"></span>
                      Sélectionnez un jour et un créneau horaire
                    </h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      &larr; Retour étape précédente
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* CUSTOM CLINIC CALENDAR */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          type="button" 
                          onClick={handlePrevMonth} 
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-extrabold text-gray-800 text-base">
                          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button 
                          type="button" 
                          onClick={handleNextMonth} 
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1.5 text-center mb-2.5">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, idx) => (
                          <div key={`${d}-${idx}`} className="text-xs font-black text-gray-400 tracking-wider py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day Number Buttons */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {blanksArray.map(b => (
                          <div key={`blank-sched-${b}`} className="aspect-square"></div>
                        ))}
                        {daysArray.map(day => {
                          const isDisabled = isDateDisabled(day);
                          const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                          const offset = dateObj.getTimezoneOffset();
                          const adj = new Date(dateObj.getTime() - (offset * 60 * 1000));
                          const dateFmt = adj.toISOString().split('T')[0];
                          const isSelected = selectedDateStr === dateFmt;

                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => handleDateClick(day)}
                              className={`
                                aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center
                                ${isSelected
                                  ? 'bg-primary text-white shadow-lg ring-2 ring-primary ring-offset-1 scale-105 font-bold'
                                  : isDisabled
                                    ? 'text-gray-200 cursor-not-allowed bg-transparent'
                                    : 'text-gray-700 hover:bg-purple-50 hover:text-primary hover:scale-[1.03] bg-gray-50/40 border border-gray-100'
                                }
                              `}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DYNAMIC HOURLY SLOTS */}
                    <div className="space-y-4">
                      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                          Soins du {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
                        </span>
                      </div>

                      {!selectedDateStr ? (
                        <div className="border border-dashed border-purple-200 rounded-2xl p-10 h-64 flex flex-col items-center justify-center text-center text-gray-400 bg-white">
                          <CalendarIcon className="w-10 h-10 text-purple-200 mb-3" />
                          <p className="text-sm">Cliquez sur une date disponible sur l'agenda pour afficher les heures de rendez-vous de notre institut.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-700">Créneaux libres disponibles :</h4>
                          <div className="grid grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {generateTimeSlots().map(time => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => { setSelectedTime(time); setCurrentStep(4); }}
                                className={`py-3 rounded-xl text-sm font-bold border transition-all text-center ${
                                  selectedTime === time
                                    ? 'bg-gray-900 border-gray-105 text-white shadow'
                                    : 'bg-white border-gray-200 hover:border-primary hover:text-primary text-gray-700 hover:bg-purple-50/30'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          
                          {generateTimeSlots().length === 0 && (
                            <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center text-gray-500 text-sm">
                              Aucune plage horaire disponible à cette date, veuillez en choisir une autre.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: CLIENT FORM INFORMATION & CONSENT */}
              {currentStep === 4 && (
                <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="h-6 w-1 bg-primary rounded-full inline-block"></span>
                      Vos coordonnées de contact & validation
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      &larr; Modifier la date ou l'heure
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Booking Review Pane */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-purple-950 px-2.5 py-1 rounded-md border border-purple-900 inline-block mb-2">Prestation retenue</span>
                        <h4 className="font-black text-white text-lg">{selectedService?.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-300">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-accent" /> {selectedPractitioner === 'any' ? 'Praticien disponible' : selectedPractitioner.name}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" /> {selectedService?.duration}</span>
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-accent" /> {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }) : ''} à {selectedTime}</span>
                        </div>
                      </div>
                      <span className="bg-white/10 text-white border border-white/20 font-black text-base px-4 py-2 rounded-xl shrink-0">
                        {selectedService?.price}
                      </span>
                    </div>

                    {/* Form fields */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nom complet du client *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Marie Dupont"
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Numéro de téléphone portable *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Adresse email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="marie.dupont@gmail.com"
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Remarques particulières / Souhaits (Optionnel)</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                        <textarea
                          value={clientNotes}
                          onChange={(e) => setClientNotes(e.target.value)}
                          placeholder="Ex : Zone de peau sensible, préférences particulières, ou questions sur le soin choisi..."
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition resize-none"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Options de rappels gratuites */}
                  <div className="bg-gradient-to-tr from-purple-50/70 to-white border border-purple-100/80 rounded-2xl p-5 space-y-3 mt-4">
                    <h5 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 mb-1">
                      <Bell className="w-4.5 h-4.5 text-primary" />
                      Rappels de rendez-vous (Gratuit)
                    </h5>
                    <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
                      Choisissez vos canaux d'alertes préférés pour ne manquer aucune séance de soin ou consigne de préparation :
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition animate-fade-in">
                        <input
                          type="checkbox"
                          checked={emailReminder}
                          onChange={(e) => setEmailReminder(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                        />
                        <div className="text-[10px]">
                          <span className="font-bold text-gray-800 block">📧 Rappel Email</span>
                          <span className="text-gray-400">À 24h du soin</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition animate-fade-in">
                        <input
                          type="checkbox"
                          checked={smsReminder}
                          onChange={(e) => setSmsReminder(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                        />
                        <div className="text-[10px]">
                          <span className="font-bold text-gray-800 block">📱 Rappel SMS</span>
                          <span className="text-gray-400">À 2h du soin</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition animate-fade-in">
                        <input
                          type="checkbox"
                          checked={whatsappReminder}
                          onChange={(e) => setWhatsappReminder(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                        />
                        <div className="text-[10px]">
                          <span className="font-bold text-gray-800 block">💬 WhatsApp</span>
                          <span className="text-gray-400">Infos & suivis</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* RGPD & Clinic Terms consent */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 mt-4">
                    <div className="flex items-start cursor-pointer">
                      <div className="flex items-center h-5">
                        <input
                          id="rgpdConsent"
                          type="checkbox"
                          required
                          checked={rgpdConsent}
                          onChange={(e) => setRgpdConsent(e.target.checked)}
                          className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div className="ml-3 text-xs leading-relaxed text-gray-600">
                        <label htmlFor="rgpdConsent" className="font-bold text-gray-800 cursor-pointer block mb-0.5">
                          J'accepte la charte RGPD et confirme les informations transmises *
                        </label>
                        <span>
                          En cochant cette case, vous acceptez que vos coordonnées soient stockées de manière sécurisée pour la gestion de votre rendez-vous et le rappel de votre séance de soin d'après les directives RGPD.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Submission trigger */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={bookingStatus === BookingStatus.SUBMITTING}
                      className="w-full flex justify-center py-4 px-4 rounded-full shadow-lg text-base font-bold text-white bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5"
                    >
                      {bookingStatus === BookingStatus.SUBMITTING ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Traitement de votre demande en cours...
                        </span>
                      ) : (
                        `Enregistrer mon rendez-vous d'esthétique (${selectedService?.price})`
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

          {/* Right Column: Persistent 'My Appointments' Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6">
              <h3 className="text-lg font-extrabold text-gray-900 pb-4 border-b border-gray-100 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-primary" />
                  Mes Rendez-vous
                </span>
                {savedBookings.length > 0 && (
                  <span className="text-xs bg-purple-100 text-primary px-2.5 py-0.5 rounded-full font-black">
                    {savedBookings.length}
                  </span>
                )}
              </h3>

              {savedBookings.length === 0 ? (
                <div className="py-8 text-center text-gray-400 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-purple-200 mx-auto" />
                  <p className="text-xs font-semibold">Aucun rendez-vous</p>
                  <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                    Vos prestations réservées s'afficheront ici en temps réel pour un suivi simplifié.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-3 max-h-[460px] overflow-y-auto pr-1">
                  {savedBookings.map(b => (
                    <div 
                      key={b.id} 
                      className="bg-neutral/40 hover:bg-purple-50/15 rounded-xl p-3 border border-purple-100/50 hover:border-purple-200 transition space-y-2 text-left"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 text-xs leading-snug truncate">{b.service}</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-150 shrink-0">
                          <Check className="w-2.5 h-2.5" /> Confirmé
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-500">
                        <p className="flex items-center gap-1 font-semibold text-gray-700">
                          <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                          <span>
                            {new Date(b.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {b.time}
                          </span>
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="w-3 h-3 text-primary shrink-0" />
                          <span>{b.practitionerName}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100/60 pt-2 mt-1">
                        <span className="font-mono font-bold text-primary text-xs">{b.price}</span>
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 py-1 px-2 rounded-md text-[11px] font-semibold flex items-center gap-1 transition duration-150 cursor-pointer border border-transparent hover:border-red-200"
                          title="Annuler le rendez-vous"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practical Advice Tip Block */}
            <div className="bg-purple-50/55 rounded-3xl border border-purple-100 p-6 text-left space-y-3">
              <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1">
                <Info className="w-4 h-4 text-primary" />
                Rappel Pratique
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Toute annulation ou modification doit s'effectuer au moins <strong>24 heures à l'avance</strong> afin de permettre à d'autres clients de bénéficier de ce créneau libre. Merci pour votre bienveillance !
              </p>
            </div>
          </div>

        </div>
      )}

        {/* TAB CONTENT: MY REGISTERED CLINIC APPOINTMENTS */}
        {activeTab === 'my-bookings' && (
          <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6 md:p-10 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 border-b border-gray-100 pb-5 flex justify-between items-center">
              <span>Vos séances prévues</span>
              <span className="text-xs bg-purple-100 text-primary px-3 py-1.5 rounded-full font-black uppercase">
                {savedBookings.length} session{savedBookings.length > 1 ? 's' : ''} active{savedBookings.length > 1 ? 's' : ''}
              </span>
            </h3>

            {savedBookings.length === 0 ? (
              <div className="text-center py-20 max-w-md mx-auto">
                <div className="mx-auto h-16 w-16 bg-purple-50 text-primary/75 rounded-full flex items-center justify-center mb-5 border border-purple-100">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Aucun rendez-vous planifié</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Vous n'avez pas encore de dermo-soin esthétique réservé à l'institut. Parcourez notre catalogue et choisissez une date disponible.
                </p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="bg-primary text-white font-bold py-3.5 px-8 rounded-full hover:bg-accent transition shadow animate-pulse"
                >
                  Prendre mon premier rendez-vous
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {savedBookings.map(b => (
                  <div 
                    key={b.id} 
                    className="bg-white/90 hover:bg-purple-50/20 rounded-xl p-3.5 sm:p-4 border border-purple-100/70 hover:border-purple-200 transition shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">{b.service}</h4>
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 shrink-0">
                          <Check className="w-3 h-3" /> Confirmé
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          {new Date(b.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {b.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" /> {b.practitionerName}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {COMPANY_INFO.address}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Cancel actions in compact slim layout */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-gray-100 pt-2.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="font-mono font-black text-primary text-base sm:text-lg">{b.price}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        title="Annuler la séance"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Annuler la séance</span>
                      </button>
                    </div>

                  </div>
                ))}
                
                <div className="text-center pt-3">
                  <button
                    onClick={() => setActiveTab('book')}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une autre prestation à mon suivi
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB CONTENT: CLIENT ACCOUNT & REMINDERS CONTROL PANEL */}
        {activeTab === 'account' && (
          <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
            
            {registeredUser ? (
              /* LOGGED IN USER INTERFACE: RESPONSIVE DASHBOARD GRID */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
                
                {/* COLUMN 1: CLIENT SETTINGS & COORDINATES */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6 space-y-6">
                    
                    {/* Header Profile Info */}
                    <div className="text-center pb-6 border-b border-gray-100 space-y-4">
                      <div className="mx-auto h-20 w-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary text-3xl font-black uppercase shadow-inner">
                        {registeredUser.name.split(' ').map(n => n.charAt(0)).join('').substring(0,2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">{registeredUser.name}</h3>
                        <p className="text-xs font-semibold text-primary mt-0.5 font-sans">Client de l'Institut D.R</p>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-650 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-2">
                          <Check className="w-3 h-3 text-emerald-650" /> Connecté
                        </span>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        Dossier Client
                      </h4>
                      <div className="bg-gray-50 rounded-2xl p-4 gap-3.5 flex flex-col border border-purple-50">
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <User className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-semibold break-all text-slate-800">{registeredUser.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <Phone className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-semibold text-slate-800">{registeredUser.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <Mail className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-semibold text-slate-800 break-all">{registeredUser.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Channel reminders pref */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-primary" />
                        Préférences alertes rdv
                      </h4>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition">
                          <input
                            type="checkbox"
                            checked={registeredUser.emailReminders}
                            onChange={(e) => {
                              const updated = { ...registeredUser, emailReminders: e.target.checked };
                              setRegisteredUser(updated);
                              localStorage.setItem('dr_clinique_registered_user', JSON.stringify(updated));
                              setEmailReminder(e.target.checked);
                            }}
                            className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-805 block">📧 Rappels par Email</span>
                            <span className="text-gray-400 text-[10px]">Rappel 24h avant.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition">
                          <input
                            type="checkbox"
                            checked={registeredUser.smsReminders}
                            onChange={(e) => {
                              const updated = { ...registeredUser, smsReminders: e.target.checked };
                              setRegisteredUser(updated);
                              localStorage.setItem('dr_clinique_registered_user', JSON.stringify(updated));
                              setSmsReminder(e.target.checked);
                            }}
                            className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-805 block">📱 Rappels par SMS</span>
                            <span className="text-gray-400 text-[10px]">Rappel portable 2h avant.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-150 cursor-pointer hover:bg-purple-50/10 transition">
                          <input
                            type="checkbox"
                            checked={registeredUser.whatsappNotifications}
                            onChange={(e) => {
                              const updated = { ...registeredUser, whatsappNotifications: e.target.checked };
                              setRegisteredUser(updated);
                              localStorage.setItem('dr_clinique_registered_user', JSON.stringify(updated));
                              setWhatsappReminder(e.target.checked);
                            }}
                            className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-805 block">💬 Conseils WhatsApp</span>
                            <span className="text-gray-400 text-[10px]">Suivi et laser temps réel.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100 text-[11px] text-gray-500 space-y-1">
                      <span className="font-bold text-gray-700 flex items-center gap-1 text-primary">
                        <Info className="w-3.5 h-3.5 text-primary" /> Remplissage intelligent actif
                      </span>
                      <p>Vos coordonnées de compte seront insérées par défaut sur vos formulaires d'inscriptions.</p>
                    </div>

                    {/* Actions Logout */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => setActiveTab('book')}
                        className="w-full bg-primary hover:bg-accent text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sm text-center"
                      >
                        Réserver un rendez-vous
                      </button>
                      <button
                        onClick={handleLogoutClient}
                        className="w-full text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 py-3 rounded-full transition text-center"
                      >
                        Se déconnecter de mon profil
                      </button>
                    </div>

                  </div>
                </div>

                {/* COLUMN 2 & 3: LOYALTY CARD, REWARDS CATALOG & VISITS TIMELINE */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* BEAUTIFUL VIRTUAL PREMIUM GOLD MEMBERSHIP CARD */}
                  <div className="bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -left-12 -top-12 w-40 h-40 bg-accent/5 rounded-full blur-2xl" />
                    
                    <div className="relative space-y-6">
                      
                      {/* Top bar Card logo */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]/85 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> PROGRAMME PRIVILÈGE INSTITUT
                          </span>
                          <h4 className="text-lg font-black tracking-wide leading-none">{COMPANY_INFO.name}</h4>
                        </div>
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center gap-1 animate-pulse font-mono">
                          {devTier}
                        </div>
                      </div>

                      {/* Spacer or NFC lines */}
                      <div className="flex justify-between items-center py-2">
                        <div className="space-y-1">
                          <p className="text-slate-400 text-[10px] uppercase tracking-widest leading-none font-bold">Numéro de Client</p>
                          <p className="font-mono text-xs font-bold tracking-widest text-white/95">DR-75129{registeredUser.phone.replace(/\s+/g, '').slice(-3)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-wider">Solde Actuel de points</p>
                          <p className="text-3xl font-black font-mono leading-none flex items-center justify-end gap-1 text-white">
                            {currentPoints} <span className="text-[11px] font-bold text-slate-400 font-sans">PTS</span>
                          </p>
                        </div>
                      </div>

                      {/* Lower card Progress Slider */}
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Statut : <strong className="text-[#D4AF37]">{devTier}</strong></span>
                          {totalEarnedPoints < 500 ? (
                            <span>Plus que <strong>{devNextTierPoints - totalEarnedPoints} pts</strong> avant le grade supérieur !</span>
                          ) : (
                            <span>Félicitations, vous êtes au palier maximal !</span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
                          <div 
                            className="bg-gradient-to-r from-primary via-accent to-[#D4AF37] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.max(8, devProgress))}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                          <span>0 pts (Bronze)</span>
                          <span>300 pts (Argent Premium)</span>
                          <span>500 pts (Or Privilège)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ACTIVE CLAIMED VOUCHERS LIST */}
                  {claimedCoupons.length > 0 && (
                    <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <Ticket className="w-4.5 h-4.5 text-primary" />
                          Mes Coupons & Avantages débloqués ({claimedCoupons.length})
                        </h4>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          Utilisables
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {claimedCoupons.map((coupon) => (
                          <div 
                            key={coupon.id}
                            className="bg-purple-50/20 rounded-2xl p-4 border border-dashed border-purple-250 hover:bg-purple-50/40 transition relative overflow-hidden"
                          >
                            <div className="space-y-1 text-left">
                              <span className="text-[9px] uppercase font-black tracking-wide text-primary">Bon Cadeau Actif</span>
                              <h5 className="font-black text-sm text-slate-800 leading-tight">{coupon.title}</h5>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Échangé le {coupon.claimedAt}</p>
                            </div>

                            <div className="mt-3 bg-white hover:border-purple-300 border border-gray-200 p-2 rounded-lg flex items-center justify-between gap-2.5">
                              <span className="font-mono text-xs font-black text-slate-705 tracking-wider select-all px-1 bg-gray-50 rounded text-purple-950">{coupon.code}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                }}
                                className="text-[10px] font-bold text-primary hover:text-accent flex items-center gap-1 select-none cursor-pointer duration-150"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REWARDS CATALOGUE */}
                  <div className="bg-white rounded-3xl border border-purple-100 p-6 md:p-8 shadow-md space-y-6">
                    <div>
                      <h4 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Gift className="w-5 h-5 text-primary" />
                        Catalogue de récompenses exclusives
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Échangez vos points cumulés contre des surprises cosmétiques ou des soins dermatologiques offerts :</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                      {LOYALTY_REWARDS.map((reward) => {
                        const hasEnoughPoints = currentPoints >= reward.points;
                        return (
                          <div 
                            key={reward.id}
                            className={`rounded-2xl p-5 border transition flex flex-col justify-between gap-4 ${
                              hasEnoughPoints 
                                ? 'bg-white hover:border-purple-350 border-purple-100 shadow-sm relative' 
                                : 'bg-gray-50 border-gray-200 relative opacity-90'
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Reward Badge */}
                              <div className="flex justify-between items-center gap-2">
                                <span className="inline-block text-[9px] font-black uppercase text-purple-650 bg-purple-100/60 px-2.5 py-0.5 rounded-md">
                                  {reward.badge}
                                </span>
                                <span className={`text-xs font-mono font-black py-0.5 px-2 rounded-full ${
                                  hasEnoughPoints ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {reward.points} PTS
                                </span>
                              </div>

                              <div>
                                <h5 className="font-black text-sm text-slate-900">{reward.title}</h5>
                                <p className="text-[11px] leading-relaxed text-gray-500 mt-1">{reward.description}</p>
                              </div>
                            </div>

                            {/* Reward claims trigger buttons */}
                            <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
                              <span className="text-[9px] text-amber-600 font-extrabold max-w-[120px]">
                                {reward.details}
                              </span>
                              
                              <button
                                onClick={() => handleRedeemReward(reward)}
                                disabled={!hasEnoughPoints}
                                className={`text-[11px] font-bold px-4 py-2 rounded-full transition active:scale-[0.98] ${
                                  hasEnoughPoints 
                                    ? 'bg-primary hover:bg-accent text-white shadow-sm cursor-pointer' 
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                }`}
                              >
                                {hasEnoughPoints ? 'Échanger' : 'Points absents'}
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* VISITS RECORD TIMELINE */}
                  <div className="bg-white rounded-3xl border border-purple-100 p-6 md:p-8 shadow-md space-y-6">
                    <div>
                      <h4 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Clock className="w-5 h-5 text-primary" />
                        Mon historique de soins & visites
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Retrouvez la chronologie complète de vos consultations réalisées et gains de points associés :</p>
                    </div>

                    <div className="space-y-5 pt-2">
                      
                      {/* Interactive dynamic upcoming point tracking */}
                      {savedBookings.length > 0 && savedBookings.map((b) => (
                        <div key={b.id} className="relative pl-6 border-l-2 border-dashed border-amber-300 flex justify-between items-start">
                          <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
                          <div className="space-y-1 text-left">
                            <span className="inline-flex gap-1.5 items-center text-[9px] uppercase font-black tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                              📅 Planifié — {b.date}
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-800">{b.service}</h5>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Soin prévu avec {b.practitionerName}</span>
                          </div>
                          <div className="text-right text-xs font-black text-amber-700 shrink-0 font-mono">
                            +100 PTS
                            <span className="block text-[8px] text-gray-400 uppercase font-black mt-0.5 font-sans">En attente</span>
                          </div>
                        </div>
                      ))}

                      {/* Mocked actual static past visits timeline */}
                      {MOCK_PAST_VISITS.map((visit) => (
                        <div key={visit.id} className="relative pl-6 border-l-2 border-emerald-300 flex justify-between items-start pb-2">
                          <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-emerald-500" />
                          <div className="space-y-1 text-left">
                            <span className="inline-flex gap-1 items-center text-[9px] uppercase font-black tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              ✓ {visit.status} — {visit.date}
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-800">{visit.service}</h5>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Soin complété avec {visit.practitioner}</span>
                          </div>
                          <div className="text-right text-xs font-black text-emerald-600 shrink-0 font-mono">
                            +{visit.points} PTS
                            <span className="block text-[8px] text-emerald-400 uppercase font-bold mt-0.5 font-sans">Crédité</span>
                          </div>
                        </div>
                      ))}

                      {/* Registration enrollment bonus log */}
                      <div className="relative pl-6 border-l-2 border-purple-200 flex justify-between items-start pb-2">
                        <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-purple-500" />
                        <div className="space-y-1 text-left">
                          <span className="inline-flex gap-1 items-center text-[9px] uppercase font-black tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-150">
                            🎁 Bienvenue
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-800">Création Espace Client</h5>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Offert par l'Institut D.R</span>
                        </div>
                        <div className="text-right text-xs font-black text-purple-650 shrink-0 font-mono">
                          +{welcomePoints} PTS
                          <span className="block text-[8px] text-gray-400 uppercase font-bold mt-0.5 font-sans">Crédité</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* REGISTRATION / LOGIN CARD WRAPPER */
              <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden animate-fade-in">
                
                {/* Header ribbon */}
                <div className="bg-slate-900 text-white p-8 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/25 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-wider text-purple-200">
                    <UserPlus className="w-3 h-3 text-primary" />
                    Enregistrement Client Privilège
                  </span>
                  <h3 className="text-2xl font-extrabold mt-3">Créez votre Espace Client</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 leading-normal">
                    Facilitez vos démarches, mémorisez vos préférences de soins, et activez les rappels mobiles SMS gratuits pour chacun de vos rendez-vous.
                  </p>
                </div>

                {/* Form Registration body */}
                <div className="p-6 md:p-8">
                  {regSuccessMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl text-center mb-6 flex items-center justify-center gap-2 animate-scale-up">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      {regSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleRegisterClient} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nom Complet *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Marie Dupont"
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Téléphone Portable *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Adresse Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="marie.dupont@email.com"
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Pre-fill default channels info block */}
                    <div className="pt-2">
                      <span className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-3">Définissez vos canaux de rappels par défaut</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <label className="flex items-start gap-2.5 p-3.5 bg-gray-50 hover:bg-purple-50/30 rounded-xl border border-gray-200 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={regEmailPref}
                            onChange={(e) => setRegEmailPref(e.target.checked)}
                            className="rounded text-primary focus:ring-primary mt-0.5 h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-800 block">📧 Rappels Email</span>
                            <span className="text-gray-400">Rappels 24 heures avant par courriel</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3.5 bg-gray-50 hover:bg-purple-50/30 rounded-xl border border-gray-200 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={regSmsPref}
                            onChange={(e) => setRegSmsPref(e.target.checked)}
                            className="rounded text-primary focus:ring-primary mt-0.5 h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-800 block">📱 Rappels SMS</span>
                            <span className="text-gray-400">SMS instantané à votre mobile</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3.5 bg-gray-50 hover:bg-purple-50/30 rounded-xl border border-gray-200 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={regWhatsappPref}
                            onChange={(e) => setRegWhatsappPref(e.target.checked)}
                            className="rounded text-primary focus:ring-primary mt-0.5 h-4.5 w-4.5"
                          />
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-800 block">💬 WhatsApp</span>
                            <span className="text-gray-400">Suivis post-soins en temps réel</span>
                          </div>
                        </label>

                      </div>

                    </div>

                    {/* RGPD clinical declaration and submission button */}
                    <div className="border-t border-purple-50 pt-5 flex flex-col md:flex-row items-center justify-between gap-5">
                      <span className="text-[10px] text-gray-400 flex items-start gap-1.5 leading-normal max-w-md">
                        <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        Vos données d'espace beauté sont enregistrées uniquement localement sur votre terminal d'accès pour préserver la confidentialité et la discrétion de vos visites.
                      </span>
                      
                      <button
                        type="submit"
                        className="w-full md:w-auto bg-primary hover:bg-accent text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition active:scale-[0.98]"
                      >
                        Créer mon espace & me connecter
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* CONGRATULATIONS MODAL ON REWARD CLAIM */}
      {newlyClaimedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-purple-100 animate-scale-up text-center">
            
            <div className="bg-gradient-to-tr from-primary to-accent p-8 text-center text-white relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setNewlyClaimedReward(null)}
                  className="text-white/80 hover:text-white transition font-bold text-lg select-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-white animate-bounce" />
              </div>
              <h3 className="text-2xl font-extrabold font-sans">Récompense Débloquée !</h3>
              <p className="text-white/90 text-xs mt-1">Votre coupon de soin est prêt à être utilisé.</p>
            </div>

            <div className="p-6 space-y-5 text-center">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  Code Coupon Généré
                </span>
                <h4 className="font-extrabold text-gray-905 mt-2.5 text-base">{newlyClaimedReward.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Echangé avec succès contre {newlyClaimedReward.pointsSpent} points</p>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-purple-200 rounded-xl p-4 relative">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Présentez ce code lors de votre visite :</span>
                <span className="font-mono font-black text-xl text-primary tracking-wider select-all">{newlyClaimedReward.code}</span>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newlyClaimedReward.code);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-primary transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copier le code dans le presse-papiers
                  </button>
                </div>
              </div>

              <ul className="text-left bg-purple-50/20 rounded-xl p-4 border border-purple-100/50 space-y-2 text-[11px] text-gray-600">
                <li className="flex gap-2">✓ <span className="font-semibold text-gray-800">Présentez ce code</span> à notre praticien lors de votre arrivée.</li>
                <li className="flex gap-2">✓ <span className="font-semibold text-gray-800">Sauvegarde automatique</span> : retrouvez à tout moment ce code dans l'onglet "Mes coupons débloqués".</li>
              </ul>

              <button
                onClick={() => setNewlyClaimedReward(null)}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition cursor-pointer select-none"
              >
                Fermer & Retourner au Tableau de Bord
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reservation;
