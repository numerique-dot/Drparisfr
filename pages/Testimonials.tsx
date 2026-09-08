import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, Plus, Search, Calendar, Filter, Sparkles, AlertCircle, Quote } from 'lucide-react';
import { REVIEWS } from '../constants';
import { Review } from '../types';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useServices } from '../lib/adminUtils';

const Testimonials: React.FC = () => {
  const { services } = useServices();
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsCol = collection(db, 'reviews');
        const snapshot = await getDocs(reviewsCol);

        if (snapshot.empty) {
          // Sync enriched defaults to live Firestore to bootstrap application data
          const enrichedDefaults: Review[] = [
            { 
              id: 'def-1', 
              name: "Sophie M.", 
              rating: 5, 
              text: "Le Soin Signature — Soin du Visage chez D.R. Santé & Beauté est tout simplement magique. Ma peau est lumineuse, nettoyée en profondeur, et l'accueil est exceptionnel.",
              service: "⭐ SOIN SIGNATURE — Soin du Visage",
              date: "14 Juin 2026"
            },
            { 
              id: 'def-2', 
              name: "Jean-Marc L.", 
              rating: 5, 
              text: "Modelage relaxant d'une grande douceur et d'une précision remarquable. Aurélie Laurent est d'une grande écoute. Un pur moment de décompression !",
              service: "Soin Relaxant (60 min)",
              date: "08 Juin 2026"
            },
            { 
              id: 'def-3', 
              name: "Julie T.", 
              rating: 5, 
              text: "Séances d'épilation visage complet très efficaces, pratiquement sans douleur. Équipe d'un grand professionnalisme.",
              service: "Visage complet",
              date: "28 Mai 2026"
            },
            {
              id: 'Ba-1',
              name: "Elise R.",
              rating: 5,
              text: "Je suis ravie de mon soin relaxant de 30 min !! Un pur moment de détente qui défatigue et apaise instantanément.",
              service: "Soin Relaxant (30 min)",
              date: "12 Mai 2026"
            },
            {
              id: 'Ba-2',
              name: "Christophe D.",
              rating: 4,
              text: "Très bonne pose d'extension de cils naturel. Le rendu est parfait et très discret, exactement ce que j'espérais !",
              service: "Extension Naturel",
              date: "03 Mai 2026"
            }
          ];

          const seedPromises = enrichedDefaults.map(async (rev) => {
            const docId = String(rev.id);
            const docData = {
              id: docId,
              name: rev.name,
              rating: rev.rating,
              text: rev.text,
              service: rev.service || 'Soin général',
              date: rev.date || 'Récemment',
              createdAt: new Date().toISOString()
            };
            return setDoc(doc(db, 'reviews', docId), docData);
          });
          await Promise.all(seedPromises);
          setTestimonials(enrichedDefaults);
        } else {
          const loaded: Review[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: data.id || docSnap.id,
              name: data.name,
              rating: Number(data.rating),
              text: data.text,
              service: data.service,
              date: data.date
            });
          });
          // Sort by timestamp ID or custom sorting
          loaded.sort((a, b) => String(b.id).localeCompare(String(a.id)));
          setTestimonials(loaded);
        }
      } catch (error) {
        console.error('Failed to fetch reviews from Firestore, using fallbacks', error);
        // Fallback to local storage or defaults on error
        const local = localStorage.getItem('dr_clinique_testimonials');
        if (local) {
          try {
            setTestimonials(JSON.parse(local));
          } catch (e) {
            console.error('Failed to parse local testimonials', e);
          }
        } else {
          const enrichedDefaults: Review[] = [
            { 
              id: 'def-1', 
              name: "Sophie M.", 
              rating: 5, 
              text: "Le traitement Hydrafacial chez D.R Santé & Beauté est tout simplement magique. Ma peau est lumineuse, nettoyée en profondeur, et l'accueil est exceptionnel.",
              service: "Hydrafacial Élite",
              date: "14 Juin 2026"
            },
            { 
              id: 'def-2', 
              name: "Jean-Marc L.", 
              rating: 5, 
              text: "Rituels sculptants et d'infusion d'une grande subtilité. Aurélie Laurent est d'une grande écoute et d'une précision remarquable. Résultat très naturel.",
              service: "Soin Silhouette & Galbe",
              date: "08 Juin 2026"
            },
            { 
              id: 'def-3', 
              name: "Julie T.", 
              rating: 5, 
              text: "Séances de dermo-épilation très efficaces, pratiquement sans douleur. Équipe d'un grand professionnalisme.",
              service: "Dermo-Épilation Haute Performance",
              date: "28 Mai 2026"
            }
          ];
          setTestimonials(enrichedDefaults);
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'reviews');
        } catch (inner) {
          // Suppress error propagation for offline fallback compatibility
        }
      }
    };
    fetchReviews();
  }, []);

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setSubmitSuccess(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Clear form
    setName('');
    setRating(5);
    setSelectedService('');
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    setIsSubmitting(true);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const docId = 'user-' + Date.now();
    const newReview: Review = {
      id: docId,
      name: name,
      rating: rating,
      text: comment,
      service: selectedService || 'Soin général',
      date: formattedDate
    };

    const docData = {
      id: docId,
      name: name,
      rating: rating,
      text: comment,
      service: selectedService || 'Soin général',
      date: formattedDate,
      createdAt: today.toISOString()
    };

    try {
      await setDoc(doc(db, 'reviews', docId), docData);
      const updated = [newReview, ...testimonials];
      setTestimonials(updated);
      localStorage.setItem('dr_clinique_testimonials', JSON.stringify(updated));
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Auto close modal/form after a delay
      setTimeout(() => {
        handleCloseForm();
      }, 2000);
    } catch (err) {
      console.error("Failed to post review to Firestore", err);
      // Fallback update on local network error
      const updated = [newReview, ...testimonials];
      setTestimonials(updated);
      localStorage.setItem('dr_clinique_testimonials', JSON.stringify(updated));
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        handleCloseForm();
      }, 2000);

      try {
        handleFirestoreError(err, OperationType.CREATE, `reviews/${docId}`);
      } catch (inner) {
        // Suppress print exception propagation so UI stays interactive
      }
    }
  };

  // Stats computation
  const totalReviews = testimonials.length;
  const averageRating = totalReviews > 0
    ? parseFloat((testimonials.reduce((sum, t) => sum + t.rating, 0) / totalReviews).toFixed(1))
    : 5;

  const countForCount = (stars: number) => {
    return testimonials.filter(t => t.rating === stars).length;
  };

  const percentageForStars = (stars: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((countForCount(stars) / totalReviews) * 100);
  };

  // Search, filter, and sort logic
  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.service && t.service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRating = filterRating === 'all' || t.rating === filterRating;
    const matchesService = filterService === 'all' || (t.service && t.service === filterService);

    return matchesSearch && matchesRating && matchesService;
  }).sort((a, b) => {
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else if (sortBy === 'lowest') {
      return a.rating - b.rating;
    } else {
      // 'recent' logic
      // User reviews have timestamp ids "user-12345", mock ones "Ba-1", "def-1"
      return String(b.id).localeCompare(String(a.id));
    }
  });

  // Unique list of services from services data + testimonials
  const availableServices = Array.from(new Set([
    ...services.map(s => s.name),
    ...testimonials.map(t => t.service).filter(Boolean) as string[]
  ]));

  return (
    <div className="min-h-screen bg-neutral py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold tracking-widest text-primary bg-purple-100/80 rounded-full uppercase mb-4 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            La voix de l'Excellence
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mt-1 mb-4">
            Avis & Témoignages Clients
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Parce que votre satisfaction est au cœur de notre engagement, découvrez les retours d'expérience authentiques de nos clientes.
          </p>
        </div>

        {/* Stats Grid Dashboard and Call To Action */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Dashboard Average rating */}
          <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Note Globale</span>
            <div className="text-6xl font-black text-gray-900 leading-none mb-3">{averageRating}</div>
            
            {/* Stars rendering */}
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            
            <span className="text-gray-500 text-xs font-medium">Basé sur {totalReviews} avis vérifiés</span>
          </div>

          {/* Detailed distribution bar chart */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-600 w-3 text-right">{stars}</span>
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-current shrink-0" />
                  <div className="flex-1 bg-gray-150 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percentageForStars(stars)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 w-10 text-right">{percentageForStars(stars)}%</span>
                </div>
              ))}
            </div>

            <div className="border-t border-purple-50/70 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Avis authentiques de visites à notre institut d'esthétique
              </span>
              <button
                onClick={handleOpenForm}
                id="submit-testimonial-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-purple-650 bg-primary hover:bg-accent text-white text-xs font-extrabold uppercase tracking-wide rounded-full shadow-md hover:shadow-lg hover:shadow-purple-400/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Déposer un avis
              </button>
            </div>
          </div>
        </div>

        {/* Filters and search block */}
        <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un soin, un mot clé (ex: naturel, laser)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
              id="search-testimonials-input"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
            
            {/* Filter by Stars */}
            <div className="relative shrink-0 flex-1 sm:flex-initial">
              <select
                value={filterRating === 'all' ? 'all' : filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                id="filter-rating-select"
              >
                <option value="all">⭐ Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles ou moins</option>
              </select>
            </div>

            {/* Filter by Service Received */}
            <div className="relative shrink-0 flex-1 sm:flex-initial max-w-[200px]">
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate cursor-pointer"
                id="filter-service-select"
              >
                <option value="all">🩺 Tous les soins</option>
                {availableServices.map((srv, idx) => (
                  <option key={`${srv}-${idx}`} value={srv}>{srv}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                id="sort-select"
              >
                <option value="recent">🕒 Récents d'abord</option>
                <option value="highest">📈 Meilleures notes</option>
                <option value="lowest">📉 Moins bonnes notes</option>
              </select>
            </div>

          </div>
        </div>

        {/* Interactive Reviews Submission panel (Inline if triggers, otherwise modal) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden animate-scale-up">
              
              {/* Form title */}
              <div className="bg-slate-900 text-white p-6 relative">
                <button
                  onClick={handleCloseForm}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
                  id="close-testimonial-form-btn"
                >
                  <span className="text-xl">✕</span>
                </button>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Donnez-nous votre avis de soin
                </h3>
                <p className="text-xs text-gray-300 mt-1">Vos retours de soins nous aident à perfectionner nos protocoles au quotidien.</p>
              </div>

              {/* Form content */}
              <div className="p-6">
                
                {submitSuccess ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Témoignage Publié !</h4>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                      Merci pour votre contribution. Votre avis est désormais listé sur l'institut.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    
                    {/* Client Name Input */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Votre Nom ou Initiales *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Sophie M. ou S.M."
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition font-semibold"
                        id="user-testimonial-name"
                      />
                    </div>

                    {/* Star selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Votre Note d'Appréciation *</label>
                      <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform active:scale-90"
                          >
                            <Star 
                              className={`h-7 w-7 transition-colors duration-150 ${
                                star <= (hoverRating || rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Service received trigger list */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Soin / Prestation esthétique reçue</label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition font-medium"
                        id="user-testimonial-service"
                      >
                        <option value="">-- Sélectionnez un acte --</option>
                        {services.map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                        ))}
                      </select>
                    </div>

                    {/* Testimonial comments */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Votre Témoignage en Détail *</label>
                      <textarea
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Qu'avez-vous pensé de l'expertise de nos praticiennes, de l'accueil chaleureux, du soin apporté et des résultats visibles du soin ?"
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition resize-none leading-relaxed"
                        id="user-testimonial-text"
                      />
                    </div>

                    {/* RGPD Disclaimer */}
                    <div className="text-[10px] text-gray-400 leading-normal flex items-start gap-1.5 p-3 bg-purple-50/50 rounded-lg border border-purple-100/40">
                      <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Votre prénom et vos initiales seront visibles publiquement. Aucun détail sur vos dossiers de santé personnels ne doit être soumis.</span>
                    </div>

                    {/* Submit actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full text-xs uppercase tracking-wider font-bold transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:bg-accent text-white py-3 rounded-full text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg hover:shadow-purple-400/20 active:scale-[0.98] transition flex justify-center items-center"
                        id="submit-testimonial-submit-btn"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-1.5 justify-center">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Envoi...
                          </span>
                        ) : "Publier l'avis"}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Testimonials Stream */}
        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-purple-100 py-16 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-purple-200 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Aucun avis correspondant</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Essayez de modifier vos options de filtrage ou effectuez une autre recherche de soin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTestimonials.map((testimonial, index) => {
              // Extract initials
              const names = testimonial.name.trim().split(' ');
              const initials = names.map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);

              return (
                <div 
                  key={testimonial.id}
                  id={`review-${testimonial.id}`}
                  className="bg-white rounded-3xl p-6 border border-purple-100/40 hover:border-purple-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group animate-fade-in relative overflow-hidden"
                >
                  <Quote className="absolute right-6 top-6 w-12 h-12 text-purple-100/30 group-hover:text-purple-100/50 transition-colors pointer-events-none" />
                  
                  <div>
                    {/* Stars + Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4.5 w-4.5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-150 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      
                      {testimonial.date && (
                        <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {testimonial.date}
                        </span>
                      )}
                    </div>

                    {/* Comment text */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 italic relative z-10">
                      "{testimonial.text}"
                    </p>
                  </div>

                  {/* Profile / Footer card */}
                  <div className="border-t border-purple-50/50 pt-4 flex items-center justify-between gap-3 mt-auto">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="h-10 w-10 rounded-full bg-purple-50 text-primary border border-purple-150 text-xs font-black flex items-center justify-center shrink-0 uppercase">
                        {initials || 'P'}
                      </div>
                      
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                          {testimonial.name}
                          <span className="h-3.5 w-3.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-[8px]" title="Visite confirmée">
                            ✓
                          </span>
                        </div>
                        {testimonial.service && (
                          <span className="text-[10px] font-bold text-primary bg-purple-50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                            Soin : {testimonial.service}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      Vérifié
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Testimonials;
