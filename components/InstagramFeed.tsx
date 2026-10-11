import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Heart, 
  MessageCircle, 
  Play, 
  ExternalLink, 
  Camera, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  X, 
  MapPin, 
  SlidersHorizontal,
  Bookmark,
  Share2
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export interface InstagramPost {
  id: string;
  category: 'ongles' | 'cils' | 'visage' | 'pieds' | 'bien-etre';
  type: 'image' | 'video';
  imageUrl: string;
  treatmentName: string;
  bookingServiceId?: string;
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  date: string;
  link: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'inst_1',
    category: 'ongles',
    type: 'image',
    imageUrl: '/src/assets/images/luxury_nail_art_hero_1783649707172.jpg',
    treatmentName: 'Nail Art Haute Couture & Semi-Permanent',
    bookingServiceId: 'beaute_mains-sub-0-service-2',
    caption: 'Manucure russe d\'une précision chirurgicale avec pose de vernis semi-permanent poudré et détails feuilles d\'or 💅✨ Réalisé ce matin par notre experte onglerie. Vos mains méritent le meilleur de l\'artisanat parisien.',
    tags: ['#nailartparis', '#manucurerusse', '#drsantebeaute', '#paris11', '#onglesnaturels'],
    likes: 248,
    comments: 31,
    date: 'Il y a 2 heures',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_2',
    category: 'cils',
    type: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'Extensions de Cils Volume Glamour 4D',
    bookingServiceId: 'extension_cils-service-1',
    caption: 'Focus cabine sur une pose de Volume Russe ultra-légère en éventails soyeux 👁️💫 Un regard envoûtant du réveil au coucher, sans aucun paquet. Tenue 4 à 6 semaines garantie.',
    tags: ['#volumerusse', '#extensioncils', '#cilsnaturels', '#beauteduregard', '#parisbeaute'],
    likes: 412,
    comments: 52,
    date: 'Hier',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_3',
    category: 'visage',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344cc?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'Soin du Visage Éclat Dermo-Esthétique Signature',
    bookingServiceId: 'signature-facial',
    caption: 'Glow instantané après notre Soin Signature du Visage (40 min) 🌸💆‍♀️ Nettoyage en profondeur, infusion d\'acide hyaluronique et massage liftant relaxant. Une peau repulpée et lumineuse !',
    tags: ['#soinduvisage', '#glowingskin', '#skincareparis', '#beautenaturelle', '#drsantebeaute'],
    likes: 326,
    comments: 28,
    date: 'Il y a 2 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_4',
    category: 'pieds',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'Spa Beauté des Pieds & Semi-Permanent Écarlate',
    bookingServiceId: 'beaute_pieds-sub-2-service-2',
    caption: 'Le grand rituel pédicure en fauteuil massant 🦶🫧 Gommage doux aux sels marins, râpe soyeuse et pose de semi-permanent rouge carmin longue tenue. Vos pieds légers comme une plume !',
    tags: ['#pedicurespa', '#beautedespieds', '#vernisrouge', '#detenteparis', '#soinspieds'],
    likes: 194,
    comments: 17,
    date: 'Il y a 3 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_5',
    category: 'ongles',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'French Manucure Pastel & Babyboomer Délicat',
    bookingServiceId: 'beaute_mains-sub-0-service-3',
    caption: 'L\'élégance absolue du dégradé Babyboomer sur ongles naturels 🕊️💅 Un rendu propre, intemporel et ultra-chic qui sublime toutes vos tenues.',
    tags: ['#babyboomernails', '#frenchnails', '#manucurechic', '#parisienne', '#drsantebeaute'],
    likes: 389,
    comments: 44,
    date: 'Il y a 4 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_6',
    category: 'cils',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1583001809072-730e192513c2?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'Rehaussement de Cils & Soin Kératine Lash Botox',
    bookingServiceId: 'extension_cils-service-2',
    caption: 'Courbure spectaculaire 100% naturelle ! Grâce au rehaussement combiné au soin fortifiant kératine, vos cils naturels gagnent en longueur visible et en densité 🥰',
    tags: ['#lashlift', '#rehaussementcils', '#lashbotox', '#yeuxdebiche', '#paris11'],
    likes: 271,
    comments: 23,
    date: 'Il y a 5 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_7',
    category: 'visage',
    type: 'video',
    imageUrl: '/src/assets/images/eyebrow_waxing_luxury_1783650088983.jpg',
    treatmentName: 'Restructuration du Regard & Épilation Haute Précision',
    bookingServiceId: 'epilation',
    caption: 'Ligne de sourcils redéfinie au millimètre près en harmonie avec les traits du visage 📐✨ Cire tiède hypoallergénique et finitions pinceau pour un résultat net et longue durée.',
    tags: ['#sourcils', '#epilationsourcils', '#restructurationregard', '#esthetiqueparis'],
    likes: 215,
    comments: 19,
    date: 'Il y a 6 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_8',
    category: 'bien-etre',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    treatmentName: 'Massage Relaxant & Réflexologie Plantaire Thaï',
    bookingServiceId: 'soins_relaxants-sub-0-service-1',
    caption: 'Moment suspendu en cabine tamisée aux senteurs de jasmin et fleur de tiaré 🕯️🌿 Décongestion des tensions nerveuses et harmonisation des énergies vitales.',
    tags: ['#massagerelaxant', '#bienetreparis', '#spaparis', '#reflexologie', '#zenitude'],
    likes: 358,
    comments: 36,
    date: 'Il y a 1 semaine',
    link: 'https://www.instagram.com/'
  }
];

const STORY_HIGHLIGHTS = [
  { id: 'all', label: 'Toutes', icon: '✨', category: 'all' as const },
  { id: 'ongles', label: 'Nail Art', icon: '💅', category: 'ongles' as const },
  { id: 'cils', label: 'Cils & Regard', icon: '👁️', category: 'cils' as const },
  { id: 'visage', label: 'Soins Visage', icon: '🌸', category: 'visage' as const },
  { id: 'pieds', label: 'Pédicure Spa', icon: '🦶', category: 'pieds' as const },
  { id: 'bien-etre', label: 'Bien-être', icon: '💆‍♀️', category: 'bien-etre' as const }
];

export const InstagramFeed: React.FC = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<InstagramPost[]>(INSTAGRAM_POSTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const handleLikePost = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedPosts.includes(id)) {
      setLikedPosts(prev => prev.filter(pId => pId !== id));
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p));
    } else {
      setLikedPosts(prev => [...prev, id]);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  const handleSavePost = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedPosts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ongles': return '💅 Onglerie & Nail Art';
      case 'cils': return '👁️ Cils & Regard';
      case 'visage': return '✨ Soins Visage';
      case 'pieds': return '🦶 Pédicure & Spa';
      case 'bien-etre': return '💆‍♀️ Bien-être';
      default: return '✦ Toutes les Réalisations';
    }
  };

  return (
    <section className="bg-gradient-to-b from-white via-purple-50/25 to-white py-20 border-y border-purple-100/70 relative overflow-hidden" id="instagram-live-feed">
      {/* Decorative ambient elements */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-bl from-pink-200/30 via-purple-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200/25 via-purple-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Instagram Profile Header Widget */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Instagram Avatar with Gradient Ring */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md">
                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                  <img 
                    src="/src/assets/images/luxury_nail_art_hero_1783649707172.jpg" 
                    alt="D.R Santé & Beauté Paris"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-tr from-[#E1306C] to-[#833AB4] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                <Instagram className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                  dr_sante_beaute
                  <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500 text-white" />
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#E1306C] border border-rose-200">
                  Salon Vérifié
                </span>
              </div>
              <p className="text-xs font-bold text-gray-700">
                D.R Santé & Beauté • Institut de Beauté & Bien-être
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                50 rue Popincourt, 75011 Paris • Métro Voltaire / St-Ambroise
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-5 pt-1 text-xs">
                <span className="text-gray-900 font-extrabold font-mono">
                  342 <span className="text-gray-500 font-sans font-normal text-[11px]">publications</span>
                </span>
                <span className="text-gray-900 font-extrabold font-mono">
                  5,4k <span className="text-gray-500 font-sans font-normal text-[11px]">abonnés</span>
                </span>
                <span className="text-gray-900 font-extrabold font-mono">
                  196 <span className="text-gray-500 font-sans font-normal text-[11px]">abonnements</span>
                </span>
              </div>
            </div>
          </div>

          {/* Direct External Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
            <a 
              href="https://www.instagram.com/"
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] hover:from-[#c21f59] hover:to-[#6c2898] text-white text-xs font-black tracking-wider uppercase rounded-xl transition shadow-md hover:shadow-purple-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              S'abonner @dr_sante_beaute
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/reservation"
              className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-purple-300" />
              Prendre RDV
            </Link>
          </div>
        </div>

        {/* Story Highlights Interactive Ring Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Stories Récentes à la Une (Cliquez pour filtrer)
            </span>
            <span className="text-[11px] text-gray-400 font-medium">Mises à jour quotidiennes</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {STORY_HIGHLIGHTS.map(story => {
              const isSelected = activeCategory === story.category;
              return (
                <button
                  key={story.id}
                  onClick={() => setActiveCategory(story.category)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
                >
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 scale-105 shadow-md shadow-purple-500/20 ring-2 ring-primary/40' 
                      : 'bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-200 group-hover:from-rose-400 group-hover:to-purple-500'
                  }`}>
                    <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center text-xl sm:text-2xl shadow-inner group-hover:scale-95 transition-transform">
                      <span>{story.icon}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold transition-colors whitespace-nowrap ${
                    isSelected ? 'text-primary font-black' : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    {story.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills Category Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-purple-100/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Catégorie :
            </span>
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'ongles', label: '💅 Onglerie' },
              { key: 'cils', label: '👁️ Cils & Regard' },
              { key: 'visage', label: '✨ Soins Visage' },
              { key: 'pieds', label: '🦶 Pédicure' },
              { key: 'bien-etre', label: '💆‍♀️ Bien-être' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white hover:bg-purple-50 text-gray-600 border border-gray-200 hover:border-purple-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-mono">
            <strong>{filteredPosts.length}</strong> visuels affichés
          </div>
        </div>

        {/* Instagram Visuals Realizations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredPosts.map(post => {
            const isLiked = likedPosts.includes(post.id);
            const isSaved = savedPosts.includes(post.id);

            return (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                id={`insta-card-${post.id}`}
              >
                {/* Media Container */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.treatmentName}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badge top-right (Video vs Image) */}
                  <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white text-xs border border-white/10 shadow-xs">
                    {post.type === 'video' ? (
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>

                  {/* Category Pill top-left */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/90 text-slate-900 shadow-xs backdrop-blur-xs">
                      {getCategoryLabel(post.category).split(' ')[1]}
                    </span>
                  </div>

                  {/* Hover Overlay with Stats & External Instagram Link */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white z-10">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => handleSavePost(post.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition ${
                          isSaved ? 'bg-amber-400 text-slate-950' : 'bg-white/20 hover:bg-white/40 text-white'
                        }`}
                        title="Enregistrer l'inspiration"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={(e) => handleLikePost(post.id, e)}
                          className="flex items-center gap-1.5 text-white hover:text-rose-400 transition"
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span className="font-bold text-sm font-mono">{post.likes}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-white">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-bold text-sm font-mono">{post.comments}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full flex items-center gap-1 transition">
                          <Instagram className="w-3 h-3 text-[#E1306C]" /> Voir la publication
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-3.5 space-y-2 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {post.treatmentName}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                      {post.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-mono">{post.date}</span>
                    <span className="font-bold text-primary flex items-center gap-0.5 hover:underline">
                      Détails & RDV →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Community Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Instagram className="w-3.5 h-3.5 text-rose-400" />
              #DRSanteBeaute • Communauté Paris
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Partagez votre nouvelle manucure ou soin éclat !
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-light">
              Mentionnez <strong>@dr_sante_beaute</strong> ou taguez notre salon dans vos stories et posts Instagram pour être republiée et recevoir une surprise fidélité lors de votre prochain passage.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a 
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-[#E1306C] to-[#833AB4] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-2 active:scale-95"
            >
              <Instagram className="w-4 h-4" />
              Voir notre Instagram Officiel
            </a>
            <Link
              to="/reservation"
              className="px-5 py-3 bg-white text-slate-900 hover:bg-gray-100 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-primary" />
              Réserver une Prestation
            </Link>
          </div>
        </div>

      </div>

      {/* Lightbox / Post Detail Quick View Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-purple-100 flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Image Column */}
            <div className="md:w-1/2 relative bg-slate-950 aspect-square md:aspect-auto flex items-center justify-center overflow-hidden">
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.treatmentName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedPost.type === 'video' && (
                <div className="absolute top-4 left-4 bg-black/60 text-white p-2 rounded-lg backdrop-blur-md">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
              )}
            </div>

            {/* Right Details Column */}
            <div className="md:w-1/2 p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Author Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                      <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
                        <img 
                          src="/src/assets/images/luxury_nail_art_hero_1783649707172.jpg" 
                          alt="D.R" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 flex items-center gap-1">
                        dr_sante_beaute
                        <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500 text-white" />
                      </h4>
                      <p className="text-[10px] text-gray-500">Paris 11e • Institut Privilège</p>
                    </div>
                  </div>
                  <a 
                    href={selectedPost.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#E1306C] hover:underline flex items-center gap-1"
                  >
                    Suivre <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Post Title & Category */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-1">
                    {getCategoryLabel(selectedPost.category)}
                  </span>
                  <h3 className="text-base font-black text-gray-900">
                    {selectedPost.treatmentName}
                  </h3>
                </div>

                {/* Caption */}
                <p className="text-xs text-gray-650 leading-relaxed font-light">
                  {selectedPost.caption}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] font-medium text-purple-700 hover:underline">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleLikePost(selectedPost.id, e)}
                      className={`flex items-center gap-1.5 font-bold transition active:scale-95 ${
                        likedPosts.includes(selectedPost.id) ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.includes(selectedPost.id) ? 'fill-rose-500' : ''}`} />
                      <span>{selectedPost.likes} j'aime</span>
                    </button>
                    <span className="text-gray-400 font-mono">{selectedPost.date}</span>
                  </div>

                  <a 
                    href={selectedPost.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#E1306C]" /> Sur Instagram
                  </a>
                </div>

                {/* Booking Call-to-action */}
                <div className="flex items-center gap-3">
                  <Link
                    to={selectedPost.bookingServiceId ? `/reservation?service=${selectedPost.bookingServiceId}` : '/reservation'}
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 py-3 bg-primary hover:bg-accent text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95 text-center"
                  >
                    <Calendar className="w-4 h-4" />
                    Réserver cette prestation
                  </Link>
                  <a
                    href="https://wa.me/33787324922"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md flex items-center justify-center"
                    title="Poser une question sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
