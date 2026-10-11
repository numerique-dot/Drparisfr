import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Award, 
  Gift, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  Phone, 
  User, 
  Calendar, 
  MessageCircle, 
  Star, 
  Zap, 
  ShieldCheck,
  Percent,
  HeartHandshake,
  Check,
  Plus,
  RotateCcw,
  Trophy,
  Flame,
  Clock
} from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { useLanguage } from '../lib/LanguageContext';

export interface LoyaltyReward {
  id: string;
  points: number;
  title: string;
  description: string;
  badge?: string;
  code: string;
}

export interface VisitMilestone {
  step: number;
  title: string;
  reward: string;
  badge?: string;
  isMajor?: boolean;
}

const VISIT_MILESTONES: VisitMilestone[] = [
  { step: 1, title: 'Bienvenue', reward: 'Thé jasmin & Diagnostic beauté', badge: 'Accueil' },
  { step: 2, title: 'Fidélité', reward: '+15 Pts bonus fidélité' },
  { step: 3, title: 'Étape Découverte', reward: '+30 Pts fidélité crédités', badge: 'Bonus Pts', isMajor: true },
  { step: 4, title: 'Assiduité', reward: 'Conseil routine beauté personnalisée' },
  { step: 5, title: 'Mi-Parcours Privilège', reward: '-10% immédiat sur votre prestation', badge: '-10% Remise', isMajor: true },
  { step: 6, title: 'VIP Actif', reward: 'Priorité créneau fin de semaine' },
  { step: 7, title: 'Reconnaissance', reward: '+40 Pts fidélité crédités' },
  { step: 8, title: 'Étape Élégance', reward: 'Dépose semi-permanent ou Nail Art offert', badge: 'Soin Offert', isMajor: true },
  { step: 9, title: 'Dernière Ligne Droite', reward: 'Échantillon prestige & +50 Pts' },
  { step: 10, title: 'Grand Privilège Institut', reward: 'Soin Visage Signature (40 min) ou Bon 20 € Offert !', badge: '🎁 Cadeau Majeur', isMajor: true }
];

const REWARDS_CATALOG: LoyaltyReward[] = [
  {
    id: 'rew_1',
    points: 50,
    title: 'Dépose Offerte (Semi-Permanent)',
    description: 'Une dépose en douceur offerte lors de votre prochaine pose.',
    badge: 'Populaire',
    code: 'VIP-DEPOSE50'
  },
  {
    id: 'rew_2',
    points: 75,
    title: 'Bon de Réduction 5 €',
    description: 'Valable immédiatement sur toutes les prestations visage, épilation ou onglerie.',
    badge: 'Économie',
    code: 'VIP-REDUC5'
  },
  {
    id: 'rew_3',
    points: 120,
    title: 'Nail Art Signature & Strass',
    description: 'Personnalisation créative sur 4 ongles offerte par notre styliste.',
    badge: 'Tendance',
    code: 'VIP-NAILART'
  },
  {
    id: 'rew_4',
    points: 200,
    title: 'Bon de Réduction 15 €',
    description: 'Déductible de tout forfait ou soin relaxant de votre choix.',
    badge: 'Avantage VIP',
    code: 'VIP-REDUC15'
  },
  {
    id: 'rew_5',
    points: 300,
    title: 'Massage Chinois Découverte (30 min)',
    description: 'Une demi-heure de pure détente musculaire et d’apaisement profond.',
    badge: 'Bien-être',
    code: 'VIP-MASSAGE30'
  },
  {
    id: 'rew_6',
    points: 500,
    title: 'Soin du Visage Éclat Signature (40 min)',
    description: 'Notre rituel signature complet de 40 minutes d’évasion et d’éclat.',
    badge: 'Prestige ★',
    code: 'VIP-SOINVISAGE'
  }
];

const TIERS = [
  {
    name: 'Bronze',
    threshold: '0 à 150 pts',
    color: 'from-amber-700 to-amber-900',
    border: 'border-amber-700/40',
    perks: [
      '1 € dépensé = 1 point fidélité',
      'Thé vert au jasmin & mignardises à chaque visite',
      'Accès aux coupons de réduction dès 50 points'
    ]
  },
  {
    name: 'Argent',
    threshold: '151 à 350 pts',
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-400/40',
    perks: [
      'Tous les avantages Bronze',
      'Surprise & bonus de 20 points le mois de votre anniversaire',
      'Priorité sur les créneaux prisés de fin de semaine'
    ]
  },
  {
    name: 'Or Privilège',
    threshold: '351 à 600 pts',
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-500/50',
    perks: [
      'Tous les avantages Argent',
      '-10% permanent sur les soins relaxants et massages',
      'Dépose semi-permanent systématiquement offerte'
    ]
  },
  {
    name: 'Platine Diamant',
    threshold: '600+ pts',
    color: 'from-purple-900 via-indigo-900 to-slate-900',
    border: 'border-purple-500/60',
    perks: [
      'Tous les avantages Or',
      'Un soin du visage signature de 60 min offert par an',
      'Invitations exclusives aux nouveautés et avant-premières'
    ]
  }
];

const LoyaltyCardPage: React.FC = () => {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string } | null>(null);
  const [currentPoints, setCurrentPoints] = useState(120);
  const [visitsCount, setVisitsCount] = useState<number>(6);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if client is already stored
    try {
      const stored = localStorage.getItem('dr_clinique_registered_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        setPhoneNumber(parsed.phone || '07 87 32 49 22');
      } else {
        setUserProfile({ name: 'Sophie Martin', phone: '07 87 32 49 22' });
      }
      
      const storedPoints = localStorage.getItem('dr_user_loyalty_points');
      if (storedPoints) {
        setCurrentPoints(parseInt(storedPoints, 10));
      }

      const storedVisits = localStorage.getItem('dr_user_loyalty_visits');
      if (storedVisits) {
        setVisitsCount(Math.min(10, Math.max(0, parseInt(storedVisits, 10))));
      } else {
        // Initialize default demo visits (e.g. 6) and save
        localStorage.setItem('dr_user_loyalty_visits', '6');
      }
    } catch (e) {
      console.warn('Loyalty profile read error', e);
    }
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const cleanPhone = phoneNumber.replace(/[\s.-]/g, '');
      const lastCharCode = cleanPhone.charCodeAt(cleanPhone.length - 1) || 5;
      const fakePoints = 80 + lastCharCode * 12;
      setCurrentPoints(fakePoints);
      
      // Calculate realistic visits for this member (between 3 and 8)
      const calculatedVisits = Math.min(10, Math.max(2, (fakePoints % 8) + 2));
      setVisitsCount(calculatedVisits);
      localStorage.setItem('dr_user_loyalty_visits', String(calculatedVisits));

      // Resolve member name from previous registrations or reservations
      let matchedName = '';
      try {
        const stored = localStorage.getItem('dr_clinique_registered_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const storedPhoneClean = (parsed.phone || '').replace(/[\s.-]/g, '');
          if (storedPhoneClean && (cleanPhone.endsWith(storedPhoneClean.slice(-8)) || storedPhoneClean.endsWith(cleanPhone.slice(-8)))) {
            matchedName = parsed.name;
          }
        }
      } catch (err) {
        console.warn('Profile read err', err);
      }

      if (!matchedName) {
        try {
          const storedBookings = localStorage.getItem('dr_clinique_bookings');
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings);
            if (Array.isArray(bookings)) {
              const found = bookings.find((b: any) => {
                const bPhone = (b.clientPhone || '').replace(/[\s.-]/g, '');
                return bPhone && (cleanPhone.endsWith(bPhone.slice(-8)) || bPhone.endsWith(cleanPhone.slice(-8)));
              });
              if (found && found.clientName) {
                matchedName = found.clientName;
              }
            }
          }
        } catch (err) {
          console.warn('Bookings read err', err);
        }
      }

      // Preserve existing profile name or graceful fallback
      const finalName = matchedName || userProfile?.name || 'Sophie Martin';
      const updatedUser = { name: finalName, phone: phoneNumber };
      setUserProfile(updatedUser);
      localStorage.setItem('dr_clinique_registered_user', JSON.stringify({
        ...updatedUser,
        email: 'client@drsantebeaute.fr',
        emailReminders: true,
        smsReminders: true,
        whatsappNotifications: true
      }));
      localStorage.setItem('dr_user_loyalty_points', String(fakePoints));
      setNotification(`Carte retrouvée pour ${finalName} ! Solde : ${fakePoints} pts · ${calculatedVisits} passages validés en institut.`);
    }, 400);
  };

  const handleAddVisit = () => {
    setVisitsCount(prev => {
      const next = prev >= 10 ? 1 : prev + 1;
      localStorage.setItem('dr_user_loyalty_visits', String(next));
      if (next === 10) {
        setNotification("🎉 Félicitations ! 10ème passage atteint ! Votre Soin Visage Signature ou Bon de 20 € est débloqué !");
      } else {
        const milestone = VISIT_MILESTONES.find(m => m.step === next);
        if (milestone && milestone.isMajor) {
          setNotification(`🌟 Palier atteint (Passage ${next}) : ${milestone.reward} !`);
        } else {
          setNotification(`✓ Passage ${next}/10 validé. Plus que ${10 - next} passage(s) avant le grand soin offert.`);
        }
      }
      return next;
    });
  };

  const handleDecrementVisit = () => {
    setVisitsCount(prev => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('dr_user_loyalty_visits', String(next));
      setNotification(`Compteur ajusté à ${next}/10 passages.`);
      return next;
    });
  };

  const handleResetVisits = () => {
    setVisitsCount(0);
    localStorage.setItem('dr_user_loyalty_visits', '0');
    setNotification("Le cycle des 10 passages a été réinitialisé à 0.");
  };

  const copyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const getTier = (points: number) => {
    if (points >= 600) return { label: 'Platine Diamant', color: 'text-purple-300' };
    if (points >= 351) return { label: 'Or Privilège', color: 'text-amber-400' };
    if (points >= 151) return { label: 'Argent', color: 'text-slate-300' };
    return { label: 'Bronze', color: 'text-amber-600' };
  };

  const tier = getTier(currentPoints);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#2a1a3e] via-[#3a2354] to-[#2a1a3e] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Programme Privilège Beauté
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Votre Carte de Fidélité
          </h1>
          <p className="text-purple-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Chez {COMPANY_INFO.name}, chaque instant dédié à votre beauté est récompensé. 
            Cumulez des points à chaque rendez-vous et profitez de privilèges exclusifs.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        {/* Card and Balance Lookup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Virtual Loyalty Card Display (Left) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-purple-500/30 relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Membre Privilège
                  </span>
                  <h3 className="text-xl font-black tracking-wide text-white mt-0.5">
                    {COMPANY_INFO.name}
                  </h3>
                  <p className="text-xs text-purple-300/80 font-sans">Paris 11e • 50 rue Popincourt</p>
                </div>
                <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-black tracking-wider text-[#D4AF37] uppercase flex items-center gap-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  {tier.label}
                </div>
              </div>

              {/* Card Center: Chip & Balance */}
              <div className="relative z-10 my-8 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300/80 flex items-center justify-center shadow-inner opacity-90">
                    <CreditCard className="w-4 h-4 text-amber-900" />
                  </div>
                  <p className="text-[10px] font-mono tracking-widest text-gray-400 mt-2">
                    DR-VIP-{userProfile ? (userProfile.phone.slice(-4) || '8888') : '7511'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Solde Disponible
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline justify-end gap-1.5">
                    <span className="text-[#D4AF37]">{currentPoints}</span>
                    <span className="text-xs font-bold text-gray-300 font-sans">PTS</span>
                  </div>
                </div>
              </div>

              {/* Card Mini-Bar: Passages en Institut */}
              <div className="relative z-10 pt-3 pb-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Passages en institut : <strong className="text-white font-mono">{visitsCount} / 10</strong>
                  </span>
                  <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-wider">
                    {visitsCount >= 10 ? '🎁 Soin Offert Prêt !' : `Plus que ${10 - visitsCount} avant cadeau`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-primary to-accent transition-all duration-700 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    style={{ width: `${Math.min(100, (visitsCount / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Bottom: Holder Name & Expiry */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Titulaire de la carte
                  </span>
                  <p className="font-extrabold text-sm text-white tracking-wide uppercase mt-0.5">
                    {userProfile?.name || 'Sophie Martin'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Statut
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Actif
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Balance Lookup & Registration (Right) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Consulter ma Carte Fidélité
                </h3>
                <p className="text-xs text-gray-500">
                  Renseignez simplement votre numéro de mobile pour afficher instantanément votre solde de points et vos passages validés.
                </p>
              </div>

              {notification && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {notification}
                </div>
              )}

              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Numéro de Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="06 12 34 56 78 ou 07 87 32 49 22"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Votre carte et vos avantages sont directement rattachés à votre numéro de téléphone.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-primary hover:bg-accent text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {isSearching ? 'Vérification...' : 'Consulter ma Carte & mes Avantages'}
                </button>
              </form>

              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-2.5 text-[11px] text-gray-600">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Votre fidélité est automatiquement reconnue à chaque réservation ou passage en caisse. Aucune carte plastique nécessaire.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRE DE PROGRESSION VISUELLE : PASSAGES EN INSTITUT (NOUVEAUTÉ)         */}
        {/* ========================================================================= */}
        <section 
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-100 relative overflow-hidden space-y-8 animate-fade-in"
          id="section-passages-institut"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-primary text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Cycle Fidélité • 10 Passages
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Suivi de vos Passages en Institut
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chaque rendez-vous honoré en institut valide un passage. Progressez à votre rythme sur votre carte pour débloquer des remises exclusives et votre <strong>Soin Visage Signature ou Bon 20 € offert au 10ème passage</strong> !
              </p>
            </div>

            {/* High-Contrast Counter Card */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-purple-500/30 shadow-lg flex items-center gap-5 shrink-0 self-start md:self-auto">
              <div className="text-center px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Passages Validés</span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline justify-center gap-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-white">{visitsCount}</span>
                  <span className="text-base text-gray-400 font-sans">/ 10</span>
                </div>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div className="text-left space-y-1">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Avancement</span>
                <span className="text-lg font-black text-white font-mono">{Math.round((visitsCount / 10) * 100)}%</span>
                <span className="text-[11px] text-purple-200 block">
                  {visitsCount >= 10 ? 'Cycle Complété !' : `${10 - visitsCount} passage(s) restant(s)`}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Status Callout Alert */}
          <div className="relative z-10">
            {visitsCount >= 10 ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-emerald-500/15 border-2 border-amber-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-gray-900">
                      🎉 Félicitations ! Votre Grand Cadeau du 10ème Passage est Débloqué !
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Bénéficiez de votre <strong>Soin du Visage Signature (40 min)</strong> ou de votre <strong>Bon de 20 €</strong> lors de votre prochain passage ou en réservant en ligne.
                    </p>
                  </div>
                </div>
                <Link
                  to="/reservation?reward=vip10"
                  className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-purple-500/30 transition shrink-0 text-center"
                >
                  Utiliser mon cadeau
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-xs border border-purple-200">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block">
                      {visitsCount < 3 && `Prochaine surprise au 3ème passage : Bonus +30 Pts fidélité (encore ${3 - visitsCount} passage${3 - visitsCount > 1 ? 's' : ''})`}
                      {visitsCount >= 3 && visitsCount < 5 && `Prochain avantage au 5ème passage : Remise immédiate de -10% (encore ${5 - visitsCount} passage${5 - visitsCount > 1 ? 's' : ''})`}
                      {visitsCount >= 5 && visitsCount < 8 && `Prochaine récompense au 8ème passage : Dépose semi-permanent offerte (encore ${8 - visitsCount} passage${8 - visitsCount > 1 ? 's' : ''})`}
                      {visitsCount >= 8 && visitsCount < 10 && `Dernière ligne droite ! Plus que ${10 - visitsCount} passage(s) avant votre Soin Visage Signature offert !`}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Présentez votre numéro de mobile ou réservez en ligne pour valider automatiquement vos passages.
                    </span>
                  </div>
                </div>
                <Link
                  to="/reservation"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-purple-50 text-primary border border-purple-200 rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                >
                  Prendre RDV <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* MAIN VISUAL PROGRESS BAR */}
          <div className="relative z-10 space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-900">
                <Clock className="w-4 h-4 text-primary" />
                Étape actuelle : <strong className="text-primary font-black font-mono">{visitsCount} passage(s)</strong> validé(s)
              </span>
              <span className="text-gray-500 font-mono">
                Objectif : 10 passages
              </span>
            </div>

            {/* Glowing Dual-Track Progress Bar Container */}
            <div className="relative">
              <div 
                className="w-full h-6 sm:h-7 bg-slate-100 rounded-full p-1 border border-purple-200/80 shadow-inner relative overflow-hidden"
                role="progressbar"
                aria-valuenow={visitsCount}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label={`Progression : ${visitsCount} sur 10 passages`}
              >
                {/* Background Track Striping */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* Animated Gradient Fill */}
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-600 to-accent relative transition-all duration-700 ease-out shadow-[0_0_18px_rgba(147,51,234,0.45)] flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(5, Math.min(100, (visitsCount / 10) * 100))}%` }}
                >
                  {/* Subtle Glow Tip Pin */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md animate-pulse shrink-0" />
                </div>
              </div>

              {/* Major Milestone Pins on Progress Bar */}
              <div className="relative w-full h-8 mt-2 hidden sm:block">
                {[
                  { pct: 10, label: 'Début', step: 1 },
                  { pct: 30, label: '+30 Pts', step: 3, major: true },
                  { pct: 50, label: '-10% Remise', step: 5, major: true },
                  { pct: 80, label: 'Dépose Offerte', step: 8, major: true },
                  { pct: 100, label: '🎁 Grand Soin Offert', step: 10, major: true }
                ].map((marker) => (
                  <div 
                    key={marker.step}
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${marker.pct}%` }}
                  >
                    <div className={`w-2 h-2 rounded-full mb-1 ${
                      visitsCount >= marker.step ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                    <span className={`text-[10px] whitespace-nowrap font-bold ${
                      visitsCount >= marker.step ? 'text-primary font-black' : 'text-gray-400'
                    }`}>
                      {marker.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 10-STAMP VISUAL MATRIX (LES 10 TAMPONS EN INSTITUT) */}
          <div className="relative z-10 space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Vos 10 Tampons de Visite
              </h3>
              <span className="text-[11px] text-gray-500">1 tampon par passage en institut</span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
              {VISIT_MILESTONES.map((m) => {
                const isPassed = visitsCount >= m.step;
                const isNext = visitsCount + 1 === m.step;
                
                return (
                  <div
                    key={m.step}
                    className={`rounded-2xl p-3 flex flex-col items-center justify-between text-center transition-all duration-300 relative border ${
                      isPassed
                        ? 'bg-gradient-to-b from-purple-50 to-white border-purple-300 shadow-sm'
                        : isNext
                          ? 'bg-white border-primary ring-2 ring-primary/25 shadow-md scale-102'
                          : 'bg-gray-50/80 border-gray-200 opacity-75'
                    }`}
                  >
                    {/* Milestone Ribbon / Pill */}
                    {m.badge && (
                      <span className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight shadow-xs ${
                        isPassed 
                          ? 'bg-primary text-white' 
                          : isNext 
                            ? 'bg-amber-400 text-slate-900 animate-bounce' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {m.badge}
                      </span>
                    )}

                    <span className="text-[10px] font-mono font-bold text-gray-500 mb-1.5 mt-0.5">
                      N°{m.step}
                    </span>

                    {/* Stamp Circle Emblem */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all mb-2 shadow-xs ${
                      isPassed
                        ? 'bg-gradient-to-tr from-amber-400 via-primary to-accent text-white shadow-purple-500/25'
                        : isNext
                          ? 'bg-purple-100 text-primary border-2 border-primary border-dashed animate-pulse'
                          : 'bg-gray-200/80 text-gray-400'
                    }`}>
                      {isPassed ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : isNext ? (
                        <Sparkles className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-xs font-mono">{m.step}</span>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold leading-tight ${
                      isPassed ? 'text-primary' : isNext ? 'text-gray-900 font-extrabold' : 'text-gray-400'
                    }`}>
                      {isPassed ? 'Validé' : isNext ? 'Prochain' : 'À venir'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PALIER CARDS DETAIL (LES 4 PRIVILÈGES DU CYCLE) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {[
              {
                step: 3,
                title: '3ème Passage',
                reward: '+30 Pts Fidélité',
                desc: 'Crédités instantanément sur votre compte Privilège.',
                icon: Star,
                color: 'text-amber-500',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200'
              },
              {
                step: 5,
                title: '5ème Passage',
                reward: '-10% Immédiat',
                desc: 'Déductible de votre prestation esthétique du jour.',
                icon: Percent,
                color: 'text-primary',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200'
              },
              {
                step: 8,
                title: '8ème Passage',
                reward: 'Dépose Offerte',
                desc: 'Dépose semi-permanent ou Nail Art 4 ongles offert.',
                icon: Sparkles,
                color: 'text-accent',
                bgColor: 'bg-fuchsia-50',
                borderColor: 'border-fuchsia-200'
              },
              {
                step: 10,
                title: '10ème Passage',
                reward: 'Grand Soin Visage',
                desc: 'Soin Éclat Signature (40 min) ou Bon 20 € au choix !',
                icon: Gift,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
              }
            ].map((palier) => {
              const unlocked = visitsCount >= palier.step;
              const IconComp = palier.icon;
              return (
                <div 
                  key={palier.step}
                  className={`p-4 rounded-2xl border transition-all ${
                    unlocked 
                      ? `${palier.bgColor} ${palier.borderColor} shadow-xs` 
                      : 'bg-gray-50/60 border-gray-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${unlocked ? 'bg-white shadow-xs' : 'bg-gray-200'}`}>
                        <IconComp className={`w-4 h-4 ${unlocked ? palier.color : 'text-gray-400'}`} />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{palier.title}</span>
                    </div>
                    {unlocked ? (
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        ✓ Atteint
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 font-mono">
                        Dans {palier.step - visitsCount} visite(s)
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-gray-900">{palier.reward}</h4>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{palier.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Section Footer: Action & Simulator Controls */}
          <div className="relative z-10 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                to="/reservation"
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Prendre Rendez-vous en Institut
              </Link>
              <a
                href="https://wa.me/33787324922"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Conseil Salon WhatsApp
              </a>
            </div>

            {/* Interactive Testing Simulator Bar */}
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs w-full sm:w-auto justify-end">
              <span className="text-[10px] font-bold text-gray-500 uppercase px-2 hidden sm:inline">
                Simulateur :
              </span>
              <button
                type="button"
                onClick={handleAddVisit}
                className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-primary border border-purple-200 font-bold rounded-lg text-xs flex items-center gap-1 transition shadow-2xs active:scale-90 cursor-pointer"
                title="Simuler un passage supplémentaire en caisse"
              >
                <Plus className="w-3.5 h-3.5" /> +1 Passage
              </button>
              <button
                type="button"
                onClick={handleDecrementVisit}
                disabled={visitsCount <= 0}
                className="px-2 py-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-bold rounded-lg text-xs transition shadow-2xs active:scale-90 cursor-pointer disabled:opacity-40"
                title="Diminuer d'un passage"
              >
                -1
              </button>
              <button
                type="button"
                onClick={handleResetVisits}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition cursor-pointer"
                title="Réinitialiser le cycle à 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-purple-50 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Simplicité & Transparence</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Comment fonctionne votre fidélité ?</h2>
            <p className="text-sm text-gray-500">
              Chaque euro investi dans votre beauté et bien-être vous rapporte des points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-150 space-y-3 relative hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-primary flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-base font-extrabold text-gray-900">1 € = 1 Point</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Toutes les prestations en institut (onglerie, soins visage, épilations, massages) créditent votre compte fidélité.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-150 space-y-3 relative hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#D4AF37] flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Avantages Évolutifs</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Plus vous venez, plus vous grimpez les paliers (Bronze, Argent, Or, Platine) et profitez de réductions permanentes.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-150 space-y-3 relative hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Cadeaux & Soins Offerts</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Déduisez vos points directement en caisse ou utilisez vos codes privilèges lors de vos réservations en ligne.
              </p>
            </div>
          </div>
        </section>

        {/* VIP Tiers Breakdown */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Niveaux de Reconnaissance</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Les Paliers Privilège</h2>
            <p className="text-sm text-gray-500">Découvrez les privilèges accordés à chaque statut.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tierItem) => (
              <div 
                key={tierItem.name} 
                className={`bg-white rounded-3xl p-6 shadow-md border ${tierItem.border} hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className={`h-2.5 w-16 rounded-full bg-gradient-to-r ${tierItem.color}`}></div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">{tierItem.name}</h4>
                    <span className="text-xs font-bold text-primary font-mono">{tierItem.threshold}</span>
                  </div>
                  <ul className="space-y-2.5 pt-2 border-t border-gray-100">
                    {tierItem.perks.map((perk, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards Catalog */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-purple-50 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Récompenses Disponibles</span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">Catalogue des Bons & Prestations Offertes</h2>
            </div>
            <Link
              to="/reservation"
              className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition shadow-md shrink-0 flex items-center gap-1.5"
            >
              Prendre rendez-vous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REWARDS_CATALOG.map((rew) => {
              const canRedeem = currentPoints >= rew.points;
              return (
                <div 
                  key={rew.id} 
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    canRedeem 
                      ? 'bg-gradient-to-b from-white to-purple-50/30 border-purple-200 shadow-sm hover:shadow-md' 
                      : 'bg-gray-50/70 border-gray-200 opacity-90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-primary">
                        {rew.badge || 'Récompense'}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-black text-gray-900 font-mono">{rew.points}</span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">PTS</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 leading-snug">{rew.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rew.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      {rew.code}
                    </span>

                    <button
                      onClick={() => copyVoucher(rew.code)}
                      className="text-xs font-bold text-primary hover:text-accent transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === rew.code ? '✓ Code copié !' : 'Copier le code'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center space-y-6 border border-purple-500/30">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black">
              Envie de cumuler vos premiers points ?
            </h3>
            <p className="text-sm text-purple-200 leading-relaxed">
              Réservez dès aujourd'hui votre prestation dans notre institut du 11e arrondissement ou contactez notre équipe sur WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/reservation"
              className="bg-primary hover:bg-accent text-white px-8 py-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-purple-500/40 transition active:scale-95"
            >
              Réserver une prestation
            </Link>

            <a
              href="https://wa.me/33787324922"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-2 transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" /> Poser une question sur WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoyaltyCardPage;
