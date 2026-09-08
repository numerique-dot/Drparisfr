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
  HeartHandshake
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
    title: 'Soin du Visage Éclat Signature (60 min)',
    description: 'Notre rituel signature complet d’une heure d’évasion et d’éclat.',
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
  const [clientName, setClientName] = useState('');
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string } | null>(null);
  const [currentPoints, setCurrentPoints] = useState(120);
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
        setClientName(parsed.name || 'Membre Privilège');
        setPhoneNumber(parsed.phone || '07 87 32 49 22');
      }
      
      const storedPoints = localStorage.getItem('dr_user_loyalty_points');
      if (storedPoints) {
        setCurrentPoints(parseInt(storedPoints, 10));
      }
    } catch (e) {
      console.warn('Loyalty profile read error', e);
    }
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const fakePoints = 80 + (cleanPhone.charCodeAt(cleanPhone.length - 1) || 5) * 12;
      setCurrentPoints(fakePoints);
      const name = clientName.trim() || 'Membre Fidélité';
      const updatedUser = { name, phone: phoneNumber };
      setUserProfile(updatedUser);
      localStorage.setItem('dr_clinique_registered_user', JSON.stringify({
        ...updatedUser,
        email: 'client@drsantebeaute.fr',
        emailReminders: true,
        smsReminders: true,
        whatsappNotifications: true
      }));
      localStorage.setItem('dr_user_loyalty_points', String(fakePoints));
      setNotification(`Bienvenue ${name} ! Votre solde est de ${fakePoints} points.`);
    }, 400);
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

              {/* Card Bottom: Holder Name & Expiry */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Titulaire de la carte
                  </span>
                  <p className="font-extrabold text-sm text-white tracking-wide uppercase mt-0.5">
                    {userProfile?.name || clientName || 'Client(e) Privilégié(e)'}
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
                  Consulter ou Activer ma Carte
                </h3>
                <p className="text-xs text-gray-500">
                  Renseignez votre numéro de mobile pour consulter instantanément votre solde ou adhérer au programme fidélité.
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
                    Nom & Prénom
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex. Sophie Martin"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                </div>

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
                      placeholder="06 12 34 56 78"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-primary hover:bg-accent text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {isSearching ? 'Vérification...' : 'Afficher mon solde & mes avantages'}
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
