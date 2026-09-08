import React, { useState } from 'react';
import { Instagram, Heart, MessageCircle, Play, ExternalLink, Camera, Sparkles } from 'lucide-react';

interface InstagramPost {
  id: string;
  type: 'image' | 'video';
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  date: string;
  link: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'inst_1',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
    caption: 'Une manucure impeccable aux tons floraux pour embellir votre début de semaine ! 💅🌸 Notre équipe d\'experts est là pour vous chouchouter au salon Paris 11. Prenez RDV en quelques clics via le site ! #beauté #manucure #paris11 #nailsart',
    likes: 184,
    comments: 24,
    date: 'Il y a 2 heures',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_2',
    type: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    caption: 'Zoom sur notre d\'extensions de cils Volume Glamour en direct des cabines 💆‍♀️✨ Isolation cil à cil parfaite et bouquets d\'une légèreté incomparable. #lashes #volumeglamour #cils #regard #parisbeauty',
    likes: 312,
    comments: 48,
    date: 'Hier',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_3',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1583001809072-730e192513c2?q=80&w=600&auto=format&fit=crop',
    caption: 'Sublimez l’intensité de votre regard grâce au rehaussement de cils Signature ! Un rendu glamour, courbé et résistant à l\'eau pendant plus de 6 semaines. On adore le résultat naturel 🥰💫 #cils #eyelashes #rehaussementdecils #parisbeauty',
    likes: 226,
    comments: 18,
    date: 'Il y a 3 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_4',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop',
    caption: 'Notre espace d\'onglerie a fait peau neuve ! Un cocon de pure détente mêlant marbre blanc et postes de manucure professionnelle pour votre bien-être total. Venez vous évader... 💅🍵 #luxuryinstitutes #nailsalon #manucureparis',
    likes: 418,
    comments: 57,
    date: 'Il y a 5 jours',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_5',
    type: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=600&auto=format&fit=crop',
    caption: 'Pédicure divine aux huiles essentielles de lavande sauvage suivi d\'un massage revitalisant des zones réflexes 🦶💆‍♂️ Offrez un moment suspendu à vos jambes fatiguées. #pedicurespa #wellnessparis #reflexology',
    likes: 195,
    comments: 14,
    date: 'Il y a 1 semaine',
    link: 'https://www.instagram.com/'
  },
  {
    id: 'inst_6',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    caption: 'Kit de soin haut de gamme et vernis semi-permanent utilisés par nos experts pour votre confort et bien-être. Demandez conseil à nos praticiens lors de votre visite ! 🧴🤍 #nails #pedicurespa #professionalskincare #beautytips',
    likes: 275,
    comments: 29,
    date: 'Il y a 1 semaine',
    link: 'https://www.instagram.com/'
  }
];

export const InstagramFeed: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>(INSTAGRAM_POSTS);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

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

  return (
    <div className="bg-white border-y border-purple-100 py-16" id="instagram-live-feed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Widget Header Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-widest text-[#E1306C] bg-rose-50 rounded-full uppercase mb-3 border border-rose-100">
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              Suivez notre quotidien
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Abonnez-vous à <span className="text-[#E1306C]">@dr_sante_beaute</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-lg leading-relaxed">
              Retrouvez nos conseils bien-être, manucures exclusives et l'envers du décor de l'institut. Flux synchronisé en direct de notre compte officiel.
            </p>
          </div>

          {/* Social Stats pill */}
          <div className="flex items-center gap-6 bg-slate-50 border border-purple-100/80 rounded-2xl p-4 md:px-6 shadow-sm">
            <div className="text-center border-r border-gray-200 pr-5">
              <span className="block text-xl font-black text-slate-800">4.8k</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Abonnés</span>
            </div>
            <div className="text-center border-r border-gray-200 pr-5">
              <span className="block text-xl font-black text-slate-800">284</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Publications</span>
            </div>
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] text-white text-xs font-black tracking-wider uppercase rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all text-center"
            >
              Rejoindre
            </a>
          </div>
        </div>

        {/* Instagrid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => {
            const isLiked = likedPosts.includes(post.id);
            return (
              <div 
                key={post.id}
                className="bg-zinc-50 rounded-2xl overflow-hidden border border-purple-50/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                id={`insta-post-${post.id}`}
              >
                {/* Media stage */}
                <div className="relative aspect-square overflow-hidden bg-slate-200">
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Icon badge based on type */}
                  <div className="absolute top-4 right-4 z-10 bg-slate-900/60 backdrop-blur-md p-2 rounded-lg text-white text-xs border border-white/10">
                    {post.type === 'video' ? (
                      <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Dark Glass Overlay with Stats on Hover */}
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 text-white z-10"
                  >
                    <div className="flex gap-6 items-center">
                      <button 
                        onClick={(e) => handleLikePost(post.id, e)}
                        className={`flex items-center gap-2 hover:scale-110 active:scale-90 transition-all ${isLiked ? 'text-rose-500' : 'text-white'}`}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span className="font-extrabold text-lg">{post.likes}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="font-extrabold text-lg">{post.comments}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1 hover:bg-white/20">
                      <ExternalLink className="w-3.5 h-3.5" /> Voir sur Instagram
                    </span>
                  </a>
                </div>

                {/* Text section */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-purple-100/50 mb-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wide">{post.date}</span>
                      <button 
                        onClick={(e) => handleLikePost(post.id, e)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition active:scale-90 ${
                          isLiked 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-white text-gray-500 border-gray-150 hover:bg-rose-50/20'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-650 leading-relaxed font-light line-clamp-3">
                      <span className="font-bold text-gray-900 mr-1">@dr_sante_beaute</span>
                      {post.caption}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wide text-primary uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" /> Actu Live
                    </span>
                    <a 
                      href={post.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-gray-400 hover:text-primary transition flex items-center gap-1"
                    >
                      Commenter <ArrowRightCircle className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Quick helper to prevent compiler/lucide icon issues
const ArrowRightCircle = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16l4-4-4-4" />
    <path d="M8 12h8" />
  </svg>
);
