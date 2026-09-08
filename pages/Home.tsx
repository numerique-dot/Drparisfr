import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, ArrowRight, Heart, Clock, User, Sparkles, MessageCircle, Eye, X, ShieldCheck, Award, ThumbsUp, Check } from 'lucide-react';
import { COMPANY_INFO, REVIEWS, RECENT_REALIZATIONS, PRACTITIONERS } from '../constants';
import { RecentRealization } from '../types';
import { InstagramFeed } from '../components/InstagramFeed';
import { useLanguage } from '../lib/LanguageContext';
import { EditableImage } from '../components/EditableImage';
import { useServices } from '../lib/adminUtils';

const Home: React.FC = () => {
  const { language, t, translateText } = useLanguage();
  const { services } = useServices();
  
  // Dynamic realizations loaded from localStorage with fallback to RECENT_REALIZATIONS
  const [realizations, setRealizations] = useState<RecentRealization[]>(() => {
    const saved = localStorage.getItem('dr_recent_realizations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return RECENT_REALIZATIONS;
  });

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [selectedRealization, setSelectedRealization] = useState<RecentRealization | null>(null);

  // Sync back to local storage on rating/liking
  React.useEffect(() => {
    localStorage.setItem('dr_recent_realizations', JSON.stringify(realizations));
  }, [realizations]);

  // Dynamic Hero Image loaded from admin-modifiable localStorage
  const [heroImage] = useState<string>(() => {
    const saved = localStorage.getItem('dr_banner_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hero = parsed.find((b: any) => b.id === 'banner_hero');
        if (hero && hero.imageUrl) {
          return hero.imageUrl;
        }
      } catch (e) {
        // ignore
      }
    }
    return "/src/assets/images/luxury_nail_art_hero_1783649707172.jpg";
  });

  const [heroAlt] = useState<any>(() => {
    const saved = localStorage.getItem('dr_banner_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hero = parsed.find((b: any) => b.id === 'banner_hero');
        if (hero && hero.altTexts) {
          return hero.altTexts;
        }
      } catch (e) {
        // ignore
      }
    }
    return {
      FR: "Maison de Beauté Paris 11 - D.R. Santé & Beauté",
      ZH: "D.R. Santé & Beauté - 巴黎专业理疗与高品质美甲美睫沙龙",
      EN: "Luxury Paris Beauty House - D.R. Salon Paris 11"
    };
  });

  const currentAlt = typeof heroAlt === 'object' 
    ? (heroAlt[language.toUpperCase()] || heroAlt.FR) 
    : (heroAlt || "Maison de Beauté");

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the modal
    if (likedIds.includes(id)) {
      // Unlike
      setRealizations(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes - 1 } : item));
      setLikedIds(prev => prev.filter(item => item !== id));
    } else {
      // Like
      setRealizations(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
      setLikedIds(prev => [...prev, id]);
    }
  };

  const [homeReviews, setHomeReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const snapshot = await getDocs(collection(db, 'reviews'));
        if (!snapshot.empty) {
          const loaded: any[] = [];
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
          setHomeReviews(loaded.slice(0, 6)); // display up to 6 highlighted reviews
          return;
        }
      } catch (e) {
        console.warn("Firestore not ready or failed on home page, using defaults", e);
      }
      
      // Fallback
      const local = localStorage.getItem('dr_clinique_testimonials');
      if (local) {
        try {
          setHomeReviews(JSON.parse(local).slice(0, 6));
          return;
        } catch (e) {
          // ignore
        }
      }
      
      // Fallback to static reviews
      const defaults: any[] = [
        { 
          id: 'def-1', 
          name: "Sophie M.", 
          rating: 5, 
          text: language === 'zh' ? "这里的全脸焕颜皮肤调理真的太神奇了！做完以后皮肤非常有光泽，整个人彻底放松。Aurélie的技术和服务绝对是行业天花板。" : language === 'en' ? "The Signature Facial treatment at D.R. Santé & Beauté is simply magical. My skin is glowing, facial features relaxed, and Aurélie's hospitality is outstanding." : "Le Soin Signature du visage chez D.R. Santé & Beauté est tout simplement magique. Ma peau est lumineuse, nettoyée en profondeur, et l'accueil d'Aurélie est exceptionnel.",
          service: "⭐ SOIN SIGNATURE — Visage",
          date: "14 Juin 2026"
        },
        { 
          id: 'def-2', 
          name: "Jean-Marc L.", 
          rating: 5, 
          text: language === 'zh' ? "非常温和精细的足部排毒SPA与穴位按摩。理疗师Mélissa特别温柔专注，极具耐心。这里是绝佳的心灵避风港！" : language === 'en' ? "Foot pedicure and massage executed with outstanding gentleness and premium precision. Mélissa is incredibly attentive. A pure therapeutic moment!" : "Beauté des pieds de luxe et massage d'une grande douceur et d'une précision remarquable. Mélissa Valois est d'une grande écoute. Un pur moment de décompression !",
          service: "V. BEAUTÉ DES PIEDS",
          date: "08 Juin 2026"
        },
        { 
          id: 'def-3', 
          name: "Julie T.", 
          rating: 5, 
          text: language === 'zh' ? "非常自然且有质感的美睫嫁接！已经保持了快四个星期，完全没有异物感。店里的氛围特别高端温馨，技师都非常专业。" : language === 'en' ? "Very natural-looking and long-lasting eyelash extensions. Kept flawless after 3 weeks. Warm team and extremely qualified specialists." : "Pose d'extensions de cils glamour très naturelles et de grande qualité. Tenue impeccable après 3 semaines. Équipe chaleureuse et très professionnelle.",
          service: "III. EXTENSION DES CILS",
          date: "28 Mai 2026"
        },
        {
          id: 'def-4',
          name: "Elise R.",
          rating: 5,
          text: language === 'zh' ? "第一次尝试精细日式美甲与建构，thomas的手艺太完美了！线条和色泽无比细腻高级，真的是极致体验！" : language === 'en' ? "I am absolutely delighted with my precision gel nails! Perfectly clean lines and brilliant shine. Thomas has remarkable attention to detail." : "Je suis ravie de ma manucure de précision et pose de gel semi-permanent ! Travail extrêmement soigné et lignes impeccables par Thomas.",
          service: "IV. BEAUTÉ DES MAINS",
          date: "12 Mai 2026"
        }
      ];
      setHomeReviews(defaults);
    };

    fetchReviews();
  }, [language]);

  const categories = [
    'Tous', 
    '⭐ SOIN SIGNATURE', 
    'IV. BEAUTÉ DES MAINS', 
    'V. BEAUTÉ DES PIEDS', 
    'III. EXTENSION DES CILS', 
    'II. SOINS RELAXANTS', 
    'VI. POSE FAUX-ONGLES',
    'VII. SOINS DU VISAGE',
    'VIII. SOINS DU CORPS',
    'IX. COIFFURE & STYLISME'
  ];

  const filteredRealizations = activeFilter === 'Tous'
    ? realizations
    : realizations.filter(item => item.category === activeFilter);

  // Helper to find matching service name for the pre-fill link
  const getServiceBookingUrl = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      return `/reservation?service=${encodeURIComponent(service.name)}`;
    }
    return '/reservation';
  };

  // Local Home Page translations
  const local_t = {
    heroTagline: language === 'zh' ? '开启法式卓越护肤与奢华美学仪轨' : language === 'en' ? 'Unveil your natural elegance starting at the heart of Paris' : COMPANY_INFO.tagline,
    aboutTitle: language === 'zh' ? '为您专属定制的' : language === 'en' ? 'Your Modern & ' : 'Votre escale beauté ',
    aboutTitleAccent: language === 'zh' ? '现代都市解压与优雅港湾' : language === 'en' ? 'Refined Beauty Stop' : 'moderne & raffinée',
    aboutParagraph1: language === 'zh' ? `坐落于巴黎市中心十一区 (${COMPANY_INFO.address})，${COMPANY_INFO.name} 是您的全新美学美化与深度解压地标。` : language === 'en' ? `Located in the beating heart of Paris at ${COMPANY_INFO.address}, ${COMPANY_INFO.name} is your prime wellness and aesthetic destination.` : `Situé au cœur de Paris, au ${COMPANY_INFO.address}, ${COMPANY_INFO.name} est votre nouvelle destination dédiée au bien-être et à l'élégance.`,
    aboutParagraph2: language === 'zh' ? '我们的资深美学团队竭力为您设计高度精细化定制的高端体验：日韩法式精细美甲、美足健康舒缓护理、定制仿真睫毛嫁接以及卓越身体赋活及全面部护肤沙龙。我们珍视每位顾客，对每处细节都力求无可挑剔。' : language === 'en' ? 'Our skilled team offers fully custom, professional sessions: precise nail beauty, nourishing pedicures, extensions, and relaxing wellness rituals. We believe in providing personalized attentive service.' : "Notre équipe experte vous accueille pour des prestations sur mesure : manucure de précision, beauté des pieds, extensions de cils et soins relaxants. Nous mettons un point d'honneur à offrir un service attentionné à chacun de nos clients.",
    findUs: language === 'zh' ? '找到我们 / 联系地址' : language === 'en' ? 'Locate Our Salon' : 'Nous trouver',
    allServicesSubtitle: language === 'zh' ? '我们为您臻选高档健康无毒耗材及纯手工匠心技艺，提供全系列的身心美化方案。' : language === 'en' ? 'A comprehensive array of sessions to elevate your vibe, executed using only high-end clean formulas.' : 'Une gamme complète de soins pour vous sublimer, réalisée avec des produits de haute qualité.',
    learnMore: language === 'zh' ? '了解护理详情' : language === 'en' ? 'Explore details' : 'En savoir plus',
    viewWholeCatalog: language === 'zh' ? '查看 77 项完整服务价目单' : language === 'en' ? 'View Entire Offer Catalog' : 'Voir toute la carte',
    advantages: language === 'zh' ? ["无菌安全卫生", "大牌健康耗材", "沉浸舒缓氛围", "资深美学团队"] : language === 'en' ? ["Faultless Hygiene", "Premium Clean Brands", "Relaxing Sanctuary", "Expert Artistry Team"] : ["Hygiène irréprochable", "Produits de qualité", "Ambiance relaxante", "Équipe experte"],
    liveTitle: language === 'zh' ? '沙龙实景最新案例' : language === 'en' ? 'Live Achievement Records' : 'Les Dernières Réalisations',
    liveSubtitle: language === 'zh' ? '实时追踪店内本周的精细设计。均由沙龙理疗师实拍，带给您最直观、真实的灵感启发。' : language === 'en' ? 'Follow unretouched aesthetic outcomes this week. True pictures taken inside our salon to guide your choices.' : 'Suivez en temps réel les actes esthétiques de la semaine. Des résultats authentiques, capturés au sein de notre institut pour vous inspirer.',
    liveTag: language === 'zh' ? '沙龙实拍' : language === 'en' ? 'Live Salon Output' : 'Direct Institut',
    liveToday: language === 'zh' ? '今日已接待服务' : language === 'en' ? 'Treatments today' : 'Soins aujourd\'hui',
    liveSatisfaction: language === 'zh' ? '实时满意度' : language === 'en' ? 'Live satisfaction' : 'Satisfaction live',
    liveExperts: language === 'zh' ? '在线技师专家' : language === 'en' ? 'Active experts' : 'Experts actifs',
    examineDetails: language === 'zh' ? '仔细看对比图' : language === 'en' ? 'Examine outputs' : 'Examiner les détails',
    likesCount: language === 'zh' ? '好评点赞' : language === 'en' ? 'Likes' : 'Aimer',
    practitionerTitle: language === 'zh' ? '认识我们的卓越技师与美学大工' : language === 'en' ? 'Meet Our Artistic Experts' : 'Rencontrez Nos Experts',
    practitionerSubtitle: language === 'zh' ? '将精湛的皮肤药理学、高级美甲技艺与时尚格调完美融合。每一位持证高级技师和面部调理专家都将根据您的生理特质，进行纯手工定制。' : language === 'en' ? 'A unique blend of derm-aesthetic expertise and luxury passion. Our certified practitioners create high-precision custom programs.' : 'Notre équipe experte marie avec exigence l’art de l’esthétique et de la précision.',
    customAdviceTitle: language === 'zh' ? '1对1奢华美容美学诊疗沟通' : language === 'en' ? 'Personalized Aesthetic Check-up' : 'Conseil Beauté Personnalisé',
    customAdviceText: language === 'zh' ? '在每一项护理正式开始前，我们的美容顾问会与您进行细致交流，分析指甲、睫毛、头皮或皮肤现状，为您打造100%切合心意的极致奢享体验。' : language === 'en' ? 'Each reservation begins with an in-depth dialogue with your specialist to inspect your nails, skin, or lashes, creating a routine that ticks all your visual boxes.' : 'Chaque rendez-vous débute par un échange privilégié avec votre esthéticienne pour analyser la nature de vos cils, de vos mains ou de votre peau et concevoir un rituel de soin 100% personnalisé et adapté à vos envies.',
    bookMySoin: language === 'zh' ? '立即预约属于我的项目' : language === 'en' ? 'Book my personalized care' : 'Réserver mon soin',
    objectiveTitle: language === 'zh' ? '服务美学诉求' : language === 'en' ? 'Aesthetic Goal' : 'Objectif Clé',
    objectiveContent: language === 'zh' ? '全流程无痛精细化操作，结合高端有机护理品牌，实现精致持久、温和无负担的贵妇级光泽与卓越细节。' : language === 'en' ? 'High-end styling, thorough skin friendliness, maximum sensory relief, and a highly polished radiant outcome.' : 'Mise en beauté, précision, détente absolue et utilisation de produits haut de gamme pour un fini éclatant et soigné.',
    realizedInSalon: language === 'zh' ? '店内真实写照' : language === 'en' ? 'Salon Verified Output' : 'Réalisé à l\'Institut',
    practitionerRdv: language === 'zh' ? '向Ta预约预约' : language === 'en' ? 'Book with specialist' : 'Prendre RDV',
    yearsExp: language === 'zh' ? '从业经验' : language === 'en' ? 'exp.' : 'd\'expérience',
    testimonialsTitle: language === 'zh' ? '真实宾客的温情评价' : language === 'en' ? 'Hear From Our Beloved Clients' : 'Avis de nos clientes',
    testimonialsButton: language === 'zh' ? '查看全部评价并为我们留言打分' : language === 'en' ? 'View All Stories & Leave Your Feedback' : 'Voir tous les témoignages & Déposer un Avis',
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Dynamic Hero Image - Manicure/Salon with Zoom Animation loaded from administration database */}
          <EditableImage 
            src={heroImage} 
            imageKey="banner_hero"
            alt={currentAlt} 
            className="w-full h-full object-cover opacity-60 animate-slow-zoom"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-semibold tracking-wider text-purple-200 uppercase bg-purple-900/50 rounded-full backdrop-blur-sm border border-purple-500/30">
            {t('heroSubtitle')}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            {COMPANY_INFO.name}
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-10 font-light max-w-2xl mx-auto">
            {local_t.heroTagline}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/reservation" 
              className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-full hover:bg-accent transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-purple-500/50"
            >
              {t('bookNow')}
            </Link>
            <Link 
              to="/services" 
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
            >
              {t('viewServices')}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-100 rounded-full z-0 group-hover:bg-purple-200 transition-colors duration-500"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-50 rounded-full z-0"></div>
              {/* Image of staff serving a client */}
              <EditableImage 
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600&h=800" 
                alt="Équipe au service du client" 
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover h-[500px] transform transition duration-500 group-hover:scale-[1.01]"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {local_t.aboutTitle}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{local_t.aboutTitleAccent}</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {local_t.aboutParagraph1}
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {local_t.aboutParagraph2}
              </p>
              <Link to="/contact" className="text-primary font-bold hover:text-accent inline-flex items-center text-lg transition-colors">
                {local_t.findUs} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('viewServices')}</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">{local_t.allServicesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-purple-50 hover:border-purple-200">
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="text-white font-bold tracking-wider px-4 py-2 border-2 border-white rounded-full">VOIR</span>
                  </div>
                  <EditableImage src={service.image} alt={translateText(service.name)} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">{translateText(service.name)}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-2">{translateText(service.description)}</p>
                  <Link to="/services" className="text-sm font-bold text-primary uppercase tracking-wide flex items-center hover:underline">
                    {local_t.learnMore} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="inline-block px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
              {local_t.viewWholeCatalog}
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {local_t.advantages.map((item, index) => (
              <div key={index} className="flex items-center p-6 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
                <CheckCircle className="text-primary h-6 w-6 mr-4 flex-shrink-0" />
                <span className="font-semibold text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Realizations Real-Time Live Feed */}
      <section className="py-24 bg-purple-50/20 border-t border-b border-purple-100/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-widest text-primary bg-primary/10 rounded-full uppercase mb-4 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {local_t.liveTag}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {local_t.liveTitle}
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {local_t.liveSubtitle}
              </p>
            </div>
            
            {/* Real-Time Live Counters */}
            <div className="flex flex-wrap gap-4 bg-white/80 p-4 rounded-2xl border border-purple-100/60 backdrop-blur-sm shadow-sm font-sans">
              <div className="px-4 py-2 border-r border-purple-100 last:border-0 text-center">
                <span className="block text-2xl font-black text-primary">12</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{local_t.liveToday}</span>
              </div>
              <div className="px-4 py-2 border-r border-purple-100 last:border-0 text-center">
                <span className="block text-2xl font-black text-emerald-600">98%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">{local_t.liveSatisfaction}</span>
              </div>
              <div className="px-4 py-2 last:border-0 text-center">
                <span className="block text-2xl font-black text-accent">4</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{local_t.liveExperts}</span>
              </div>
            </div>
          </div>

          {/* Realization Filters */}
          <div className="flex flex-wrap gap-2.5 mb-10 justify-start items-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 transform active:scale-95 ${
                  activeFilter === category
                    ? 'bg-primary text-white shadow-md shadow-purple-500/20 border border-primary'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-purple-100'
                }`}
              >
                {category === 'Tous' ? t('home').replace("Accueil", "Tous") || "Tous" : translateText(category)}
              </button>
            ))}
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRealizations.map((item) => {
              const isLiked = likedIds.includes(item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedRealization(item)}
                  className="bg-white rounded-2xl border border-purple-100/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full hover:border-primary/30"
                  id={`gallery-realization-${item.id}`}
                >
                  {/* Photo Container */}
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                    
                    {/* Live Pulser Dot */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {local_t.liveTag}
                    </div>

                    {/* Timestamp Bubble */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-[10px] font-extrabold text-gray-700">
                      <Clock className="w-3 h-3 text-primary" />
                      {item.timestamp}
                    </div>

                    {/* Image */}
                    <EditableImage 
                      src={item.image} 
                      alt={translateText(item.title)} 
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Hover Visual Screen effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white text-xs font-bold inline-flex items-center gap-1.5 bg-primary px-4 py-2 rounded-full uppercase tracking-wider shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        {local_t.examineDetails}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-0.5 bg-purple-50 text-primary text-[10px] font-bold uppercase rounded-md tracking-wider border border-purple-150">
                        {translateText(item.category)}
                      </span>
                      <button 
                        onClick={(e) => handleLike(e, item.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border transition-all active:scale-75 ${
                          isLiked 
                            ? 'bg-rose-50 text-rose-600 border-rose-200' 
                            : 'bg-white text-gray-500 border-gray-150 hover:bg-rose-50/30'
                        }`}
                        title={isLiked ? "Unlike" : "Like"}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400'}`} />
                        <span>{item.likes}</span>
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 leading-snug">
                      {translateText(item.title)}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mb-4 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Soin : <span className="font-bold text-gray-700">{translateText(item.treatment)}</span>
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {item.physician}
                      </span>
                      <span className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                        RDV
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-book direct visual banner */}
          <div className="mt-16 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-purple-500/20 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest bg-purple-500/30 text-accent rounded-full border border-purple-400/20 uppercase mb-4">
                {local_t.realizedInSalon}
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                {language === 'zh' ? '开启属于您的私人美学定制蜕变' : language === 'en' ? 'Desire identical unretouched custom finishes?' : 'Vous désirez les mêmes résultats sur-mesure ?'}
              </h3>
              <p className="text-purple-200/80 text-sm md:text-base font-light leading-relaxed">
                {local_t.customAdviceText}
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link 
                to="/reservation" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white hover:bg-accent font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/30 active:translate-y-0.5 transform hover:-translate-y-0.5 border border-purple-400/30"
              >
                {t('bookNow')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-24 bg-white relative overflow-hidden" id="notre-equipe">
        {/* Ambient background decoration */}
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-purple-50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest text-[#9333EA] bg-purple-50 rounded-full uppercase mb-4 border border-purple-100">
              <Sparkles className="w-3.5 h-3.5 text-[#9333EA]" />
              L'Art de la Précision
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              {local_t.practitionerTitle}
            </h2>
            <div className="w-16 h-1 bg-[#9333EA] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              {local_t.practitionerSubtitle}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRACTITIONERS.map((practitioner) => (
              <div 
                key={practitioner.id}
                id={`practitioner-card-${practitioner.id}`}
                className="bg-white rounded-3xl border border-purple-100/40 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden group"
              >
                {/* Photo Placeholder / Image wrapper */}
                <div className="relative h-80 overflow-hidden bg-purple-50 shrink-0">
                  <EditableImage 
                    src={practitioner.image} 
                    alt={practitioner.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle glass overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Experience Badge */}
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {practitioner.experience} {local_t.yearsExp}
                  </span>
                </div>

                {/* Content Panel */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    {/* Header: Name and Role */}
                    <div className="mb-4">
                      <span className="inline-block text-[10px] font-black tracking-wider text-primary uppercase bg-purple-50/80 px-2.5 py-1 rounded-full border border-purple-100 mb-2">
                        {translateText(practitioner.role)}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {practitioner.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#8B5CF6] mt-1 leading-normal">
                        {translateText(practitioner.specialty)}
                      </p>
                    </div>

                    {/* Bio text */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                      {translateText(practitioner.bio)}
                    </p>
                  </div>

                  {/* Call To Action Book Provider */}
                  <div className="pt-4 border-t border-purple-100/50 mt-auto">
                    <Link
                      to={`/reservation?practitioner=${practitioner.id}`}
                      id={`book-practitioner-${practitioner.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 text-white hover:bg-primary text-xs font-bold uppercase tracking-wide shadow-md hover:shadow-lg hover:shadow-purple-400/20 active:scale-95 transition-all duration-300"
                    >
                      {local_t.practitionerRdv}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Core Values banner */}
          <div className="mt-20 p-8 md:p-10 bg-purple-50/40 rounded-3xl border border-purple-100/50 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-sm backdrop-blur-sm">
            <div className="max-w-xl text-center md:text-left">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{local_t.customAdviceTitle}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {local_t.customAdviceText}
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Link 
                to="/reservation"
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-primary text-white hover:bg-accent font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-purple-400/10 active:scale-[0.98] transition-all"
              >
                {t('bookNow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Achievement Detail Lightbox Modal */}
      {selectedRealization && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setSelectedRealization(null)}
        >
          {/* Modal Container */}
          <div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] md:max-h-none flex flex-col md:flex-row border border-purple-100/50 animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
            id={`modal-realization-${selectedRealization.id}`}
          >
            {/* Close Button Inside Modal */}
            <button
              onClick={() => setSelectedRealization(null)}
              className="absolute top-4 right-4 z-30 bg-slate-900/80 text-white hover:bg-primary p-2 md:p-2.5 rounded-full transition-all border border-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Split Screen - Left side: Big high-quality Photo */}
            <div className="md:w-1/2 h-72 md:h-auto bg-slate-100 relative shrink-0">
              <EditableImage 
                src={selectedRealization.image} 
                alt={translateText(selectedRealization.title)} 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {local_t.realizedInSalon}
              </div>
            </div>

            {/* Split Screen - Right side: Live Information Sheet */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-50 text-primary text-xs font-bold uppercase rounded-full border border-purple-100">
                    {translateText(selectedRealization.category)}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-150">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                    {local_t.realizedInSalon}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {translateText(selectedRealization.title)}
                </h3>

                <p className="text-xs text-gray-500 font-mono mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {selectedRealization.timestamp}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {selectedRealization.physician}
                  </span>
                </p>

                {/* Treatment Facts */}
                <div className="space-y-4 mb-8 bg-purple-50/35 p-5 rounded-2xl border border-purple-100/50">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Soin Réalisé</span>
                    <span className="text-sm font-bold text-gray-800">{translateText(selectedRealization.treatment)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">{local_t.objectiveTitle}</span>
                    <p className="text-xs text-gray-650 leading-relaxed mt-1">
                      {local_t.objectiveContent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking & Interaction Action Footer inside Modal */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={(e) => handleLike(e, selectedRealization.id)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                    likedIds.includes(selectedRealization.id)
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedIds.includes(selectedRealization.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                  {local_t.likesCount} ({selectedRealization.likes})
                </button>

                <Link
                  to={getServiceBookingUrl(selectedRealization.serviceId)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-white hover:bg-accent font-bold rounded-full shadow-lg hover:shadow-purple-400/20 transition-all duration-300 uppercase tracking-wider text-xs active:scale-95"
                  onClick={() => setSelectedRealization(null)}
                >
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  {t('bookNow')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Live Feed */}
      <InstagramFeed />

      {/* Dynamic Trust and Feedback Highlights Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden" id="confiance-clients">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest text-purple-300 bg-purple-900/40 rounded-full uppercase mb-4 border border-purple-500/30">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              {language === 'zh' ? '卓越美学·宾客之选' : language === 'en' ? 'Aesthetic Trust & Satisfaction' : 'Indice de Confiance & Satisfaction'}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {language === 'zh' ? '为什么数千名宾客选择我们' : language === 'en' ? 'Why Thousands of Clients Trust Us' : 'Pourquoi nos clientes nous adorent'}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light font-sans">
              {language === 'zh' ? '我们珍视每一位顾客的体验反馈。以下是来自我们尊贵宾客的真实感受，见证我们对卓越细节的不懈追求。' : language === 'en' ? 'We treasure every single piece of feedback. Discover real, unedited stories from our beloved guests in Paris.' : 'Nous accordons une importance capitale à l\'expérience de chacun. Découvrez les témoignages authentiques de nos clientes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Side: Trust & Rating Metrics Panel */}
            <div className="lg:col-span-4 bg-slate-800/60 backdrop-blur-md rounded-3xl p-8 border border-slate-700/60 space-y-8 shadow-xl">
              
              {/* Score summary */}
              <div className="text-center md:text-left space-y-3">
                <div className="flex justify-center md:justify-start items-center gap-3">
                  <div className="text-5xl font-black text-white tracking-tight">4.9</div>
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">Sur 240+ avis vérifiés</p>
                  </div>
                </div>
                <p className="text-xs text-purple-200 leading-relaxed font-light">
                  {language === 'zh' ? '我们在巴黎以无可挑剔的手艺、无菌安全卫生标准以及舒缓高雅的氛围而闻名。' : language === 'en' ? 'Highly appreciated in Paris for flawless hygiene, precision artisan designs, and ultimate mental recovery.' : 'Une réputation d\'excellence forgée autour de l\'hygiène, de la précision d’exécution et du bien-être absolu.'}
                </p>
              </div>

              {/* Star Rating Distribution Bars */}
              <div className="space-y-2.5 pt-4 border-t border-slate-700/60">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Répartition des Notes</h4>
                
                {/* 5 Stars bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1">5 <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline" /></span>
                    <span className="text-gray-400 font-mono text-[11px]">96%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                {/* 4 Stars bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1">4 <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline" /></span>
                    <span className="text-gray-400 font-mono text-[11px]">4%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>

                {/* 3 Stars & below */}
                <div className="space-y-1 opacity-45">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1">3 <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline" /></span>
                    <span className="text-gray-400 font-mono text-[11px]">0%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              {/* Secure Verified Seals */}
              <div className="pt-4 border-t border-slate-700/60 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>{language === 'zh' ? '安全无菌卫生百分百' : language === 'en' ? '100% Sanitized & Sterile' : 'Protocoles d\'hygiène stricts'}</strong> : {language === 'zh' ? '严格无菌器械消毒' : language === 'en' ? 'Autoclave level precision tool care' : 'Désinfection rigoureuse du matériel'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <ThumbsUp className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>
                    <strong>{language === 'zh' ? '资深高级美容美睫师' : language === 'en' ? 'Expert Certified Masters' : 'Esthéticiennes diplômées d\'État'}</strong> : {language === 'zh' ? '均具备多年行业高级资质与精细操作经验' : language === 'en' ? 'Top tier certified technicians with decades of practice' : 'Plus de 10 ans de savoir-faire combiné'}
                  </span>
                </div>
              </div>

              {/* Interactive action */}
              <div className="pt-2">
                <Link
                  to="/reservation"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-purple-500/20 active:translate-y-0.5 transform transition-all"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  {language === 'zh' ? '体验我们的品质服务' : language === 'en' ? 'Experience Excellence Now' : 'Réserver mon soin de rêve'}
                </Link>
              </div>

            </div>

            {/* Right Side: Visual Bento-Grid Customer Feedback Highlight Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {homeReviews.map((review, index) => (
                <div 
                  key={review.id || index} 
                  className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50 hover:border-primary/50 hover:bg-slate-800/70 transition-all duration-300 shadow-md flex flex-col justify-between space-y-4 group"
                  id={`home-testimonial-card-${review.id || index}`}
                >
                  <div className="space-y-3">
                    {/* Header line: Stars & category tag */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                      
                      {review.service && (
                        <span className="px-2.5 py-0.5 bg-purple-900/30 text-purple-200 text-[9px] font-bold uppercase rounded-md tracking-wider border border-purple-500/15 max-w-[160px] truncate" title={translateText(review.service)}>
                          {translateText(review.service)}
                        </span>
                      )}
                    </div>

                    {/* Testimonial body text */}
                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic font-light group-hover:text-white transition-colors">
                      "{translateText(review.text)}"
                    </p>
                  </div>

                  {/* Customer author card with verified checkmark */}
                  <div className="flex items-center justify-between border-t border-slate-700/40 pt-4 mt-2">
                    <div className="flex items-center gap-3">
                      {/* Generates a nice colored letter-avatar based on name */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/80 to-accent/80 flex items-center justify-center font-black text-xs text-white uppercase shadow-sm">
                        {review.name ? review.name.charAt(0) : 'G'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {review.name}
                          <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold scale-95 shrink-0">
                            <Check className="w-2.5 h-2.5 shrink-0" /> Verified
                          </span>
                        </div>
                        {review.date && (
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                            {review.date}
                          </span>
                        )}
                      </div>
                    </div>

                    <MessageCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="mt-16 text-center pb-2">
            <Link 
              to="/services"
              id="home-view-services-cta"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-full text-xs uppercase tracking-widest border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98] transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              Consulter nos Tarifs & Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
