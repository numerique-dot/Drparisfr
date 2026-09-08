import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  Activity, 
  Eye, 
  Droplets, 
  Heart, 
  Smile, 
  Search, 
  Calendar, 
  Phone, 
  Check, 
  Clock, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { useLanguage } from '../lib/LanguageContext';
import rawData from '../dr_sante_beaute_data.json';

const categoryIcons: Record<string, any> = {
  epilation: Zap,
  soins_relaxants: Activity,
  extension_cils: Eye,
  beaute_mains: Droplets,
  beaute_pieds: Heart,
  faux_ongles: Smile
};

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const signatureTreatment = rawData.signature_treatment;
  const signatureRituals = rawData.signature_rituals;
  const categories = rawData.categories;

  // Filter logic based on tab and search
  const filteredCategories = useMemo(() => {
    return categories.map(cat => {
      // If tab is selected and doesn't match this category
      if (activeTab !== 'all' && activeTab !== cat.id) {
        return null;
      }

      if (!searchQuery.trim()) {
        return cat;
      }

      const q = searchQuery.toLowerCase();
      const filteredSubgroups = cat.subgroups.map(sub => {
        const filteredServices = sub.services.filter(s => 
          s.name_fr.toLowerCase().includes(q) || 
          sub.name_fr.toLowerCase().includes(q) ||
          cat.name_fr.toLowerCase().includes(q)
        );
        return filteredServices.length > 0 ? { ...sub, services: filteredServices } : null;
      }).filter(Boolean);

      return filteredSubgroups.length > 0 ? { ...cat, subgroups: filteredSubgroups } : null;
    }).filter(Boolean) as typeof categories;
  }, [categories, activeTab, searchQuery]);

  const hasRitualsMatch = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'rituals') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return signatureRituals.some(r => 
      r.name.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q)
    );
  }, [signatureRituals, activeTab, searchQuery]);

  const hasSignatureMatch = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'signature') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return signatureTreatment.name_fr.toLowerCase().includes(q) || 
      signatureTreatment.description_fr.toLowerCase().includes(q);
  }, [signatureTreatment, activeTab, searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold tracking-widest text-primary bg-purple-100/70 rounded-full uppercase mb-3 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Institut D.R. Santé & Beauté
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Tarifs & Services
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light mb-6">
            Découvrez notre offre complète de soins et de prestations. Chaque service est réalisé avec précision et attention par nos expertes. Pour toute question ou personnalisation, n'hésitez pas à nous contacter via WhatsApp ou au <a href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`} className="font-bold text-primary hover:underline">{COMPANY_INFO.phone}</a>.
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/reservation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-accent transition shadow-md hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              Prendre Rendez-vous
            </Link>
            <a
              href={`https://wa.me/33${COMPANY_INFO.phone.replace(/\s+/g, '').slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 transition shadow-md hover:shadow-emerald-600/25 transform hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              Conseil WhatsApp
            </a>
          </div>
        </div>

        {/* ✦ NOTRE SIGNATURE HIGHLIGHT SECTION */}
        {hasSignatureMatch && (
          <div className="mb-12 animate-fade-in">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-purple-500/30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full shadow-sm">
                      ✦ NOTRE SIGNATURE
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-purple-200 font-bold bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {signatureTreatment.duration}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {signatureTreatment.name_fr}
                  </h2>
                  
                  <p className="text-purple-200/90 text-sm md:text-base font-light italic leading-relaxed">
                    « {signatureTreatment.description_fr} »
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-purple-300 font-medium pt-2">
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> Éclat immédiat</span>
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> Nettoyage profond</span>
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> Détente totale</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 bg-white/5 lg:bg-transparent p-4 lg:p-0 rounded-2xl border border-white/10 lg:border-0">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-purple-300 uppercase tracking-widest block font-bold">Tarif Exclusif</span>
                    <span className="text-4xl font-black text-amber-300">{signatureTreatment.price} €</span>
                  </div>
                  <Link
                    to={`/reservation?service=${encodeURIComponent(signatureTreatment.name_fr)}`}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg hover:shadow-purple-500/40 hover:opacity-95 transition transform hover:-translate-y-0.5 text-center"
                  >
                    Réserver ce Soin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ★ RITUELS SIGNATURE SECTION */}
        {hasRitualsMatch && (
          <div className="mb-14 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">Combinaisons d'Exception</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  Rituels Signature
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {signatureRituals.map((ritual) => (
                <div 
                  key={ritual.number}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-purple-100 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {ritual.number === '03' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      Le + Prisé
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-black tracking-wider text-primary uppercase bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {ritual.name.split('—')[0]}
                      </span>
                      <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {ritual.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                      {ritual.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                      {ritual.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Tarif</span>
                      <span className="text-2xl font-black text-gray-900">{ritual.price} €</span>
                    </div>

                    <Link
                      to={`/reservation?service=${encodeURIComponent(ritual.name)}`}
                      className="inline-flex items-center gap-1 px-4 py-2.5 bg-gray-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow transition-all duration-200"
                    >
                      Réserver
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Category Filter Navigation */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2.5 rounded-full text-xs font-bold tracking-wide shrink-0 transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                Toutes les prestations
              </button>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] || Sparkles;
                const isSelected = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide shrink-0 transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-md shadow-purple-500/20'
                        : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.name_fr}
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un soin ou un tarif..."
                className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-8 text-xs font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 6 CATEGORIES LIST */}
        <div className="space-y-12">
          {filteredCategories.length === 0 && !hasSignatureMatch && !hasRitualsMatch && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">Aucune prestation trouvée</h3>
              <p className="text-xs text-gray-500 mb-6">
                Aucun soin ne correspond à votre recherche « {searchQuery} ».
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-accent transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {filteredCategories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Sparkles;
            return (
              <div 
                key={cat.id} 
                id={`cat-${cat.id}`}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100/70"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100/70 text-primary rounded-2xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {cat.name_fr}
                      </h2>
                      <p className="text-xs text-gray-500 font-light mt-0.5">
                        {cat.description_fr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subgroups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {cat.subgroups.map((sub, sIdx) => (
                    <div 
                      key={sIdx}
                      className="bg-slate-50/70 rounded-2xl p-5 border border-purple-50/70 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-purple-900 mb-4 pb-2 border-b border-purple-200/50 flex items-center justify-between">
                          <span>{sub.name_fr}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-normal">
                            {sub.services.length} {sub.services.length > 1 ? 'soins' : 'soin'}
                          </span>
                        </h3>

                        {/* Services List Table */}
                        <div className="divide-y divide-gray-100">
                          {sub.services.map((service: any, idx: number) => {
                            const isGendered = service.price_female !== undefined;
                            return (
                              <div 
                                key={idx}
                                className="py-3 flex items-center justify-between gap-4 group hover:bg-white/80 px-2 rounded-xl transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors truncate">
                                      {service.name_fr}
                                    </span>
                                    {service.duration && (
                                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                        · {service.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  {isGendered ? (
                                    <div className="text-right">
                                      <div className="text-xs font-extrabold text-gray-900">
                                        Femme : <span className="text-primary">{service.price_female} €</span>
                                      </div>
                                      {service.price_male ? (
                                        <div className="text-[11px] font-bold text-gray-600">
                                          Homme : <span>{service.price_male} €</span>
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-gray-400 italic">Homme : —</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm font-black text-gray-900">
                                      {service.price} €
                                    </span>
                                  )}

                                  <Link
                                    to={`/reservation?service=${encodeURIComponent(service.name_fr)}`}
                                    className="px-3 py-1.5 bg-purple-100/80 hover:bg-primary hover:text-white text-primary text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                                    title={`Réserver ${service.name_fr}`}
                                  >
                                    RDV
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Guarantee Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-purple-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 hidden sm:block">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Une question sur un protocole ou un créneau ?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Notre salon est ouvert du Lundi au Samedi de 10h à 20h au 50 Rue Popincourt, Paris 11.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a 
              href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`}
              className="px-6 py-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800 transition"
            >
              Appeler le salon
            </a>
            <Link
              to="/reservation"
              className="px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-accent transition shadow-md"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Services;
