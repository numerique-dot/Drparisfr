import React, { useState } from 'react';
import { BEFORE_AFTER_GALLERY } from '../constants';
import { Camera, ArrowRightLeft, Grid, HelpCircle as HelpIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { EditableImage } from '../components/EditableImage';
import { getResolvedImageUrl } from '../lib/adminUtils';

const BeforeAfterGallery: React.FC = () => {
  const { language, t, translateText } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [layoutMode, setLayoutMode] = useState<'slider' | 'grid'>('slider');
  
  // Custom Slider positions indexed by item ID
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>({
    'ba-nails-french': 50,
    'ba-lashes-volume': 50,
    'ba-pedicure-spa': 50,
    'ba-nails-extension': 50,
    'ba-lashes-natural': 50,
    'ba-pedicure-semi': 50,
  });

  // Extract unique categories reflecting requested Nails, Lashes, and Hand & Foot Care
  const categories = ['Tous', 'IV. BEAUTÉ DES MAINS', 'V. BEAUTÉ DES PIEDS', 'III. EXTENSION DES CILS', 'VI. POSE FAUX-ONGLES'];
  const allLabel = language === 'zh' ? '全部' : language === 'en' ? 'All' : 'Tous';

  const filteredItems = activeCategory === 'Tous'
    ? BEFORE_AFTER_GALLERY
    : BEFORE_AFTER_GALLERY.filter(item => item.category === activeCategory);

  const handleSliderMove = (id: string, clientX: number, containerRect: DOMRect) => {
    const x = clientX - containerRect.left;
    const percentage = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
    setSliderPositions(prev => ({ ...prev, [id]: percentage }));
  };

  // Local component translations
  const local_t = {
    before: language === 'zh' ? '使用前' : language === 'en' ? 'BEFORE' : 'AVANT',
    after: language === 'zh' ? '使用后' : language === 'en' ? 'AFTER' : 'APRÈS',
    sliderTitle: language === 'zh' ? '互动滑块对比' : language === 'en' ? 'Interactive Slider' : 'Glissière Interactive',
    gridTitle: language === 'zh' ? '左右并排图示' : language === 'en' ? 'Side by Side' : 'Côte à Côte',
    helpSlider: language === 'zh' ? '提示：悬停或用手指滑动滑块来观察前后效果。' : language === 'en' ? 'Tip: Hover or drag to scrub between before and after.' : "Astuce : Survolez ou faites glisser votre doigt sur l'image pour balayer entre l'Avant et l'Après.",
    helpGrid: language === 'zh' ? '所有对比照片均在统一室内光线与相同角度下拍摄，力求最客观真实的呈现。' : language === 'en' ? 'Comparison photos are taken under identical lighting and angle to guarantee accuracy.' : "Les photos de comparaison sont prises sous la même lumière et le même angle pour garantir l'intégrité de la présentation.",
    procedure: language === 'zh' ? '定制美学方案' : language === 'en' ? 'Beauty Blueprint' : 'Protocole Beauté',
    outcome: language === 'zh' ? '顾客当前实拍效果' : language === 'en' ? 'Unretouched Current Outlines' : 'Rendu Final Actuel',
    ctaTitle: language === 'zh' ? '准备好展现您的本真光彩了吗？' : language === 'en' ? 'Ready to reveal your natural radiance?' : 'Prêt à révéler votre éclat naturel ?',
    ctaText: language === 'zh' ? '我们所有的美学和护理项目都提供精细个性化的跟进和建议，以最精准地切合您的身心需求。' : language === 'en' ? 'All illustrated routines include personalized aesthetic check-ups and custom updates tailored to your body needs.' : "Tous les soins illustrés ci-dessus font l'objet d'un suivi attentionné et de conseils esthétiques personnalisés pour répondre au mieux à vos besoins.",
    ctaBook: language === 'zh' ? '在线自助预约预约' : language === 'en' ? 'Secure placement slot' : 'Prendre rendez-vous en ligne',
    ctaQuestion: language === 'zh' ? '向美容顾问提问咨询' : language === 'en' ? 'Inquire with our staff' : 'Poser une question à notre équipe',
    detailsBook: language === 'zh' ? '预订或咨询此项目' : language === 'en' ? 'Reserve or view this care' : 'Consulter ou Réserver ce soin'
  };

  return (
    <div className="bg-neutral min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
          <span className="text-primary font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-1.5 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            {t('transformationsReal')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('beforeAfterTitle')}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('beforeAfterIntro')}
          </p>
        </div>

        {/* Layout Modes & Category Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-purple-100 pb-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category === 'Tous' ? allLabel : translateText(category)}
              </button>
            ))}
          </div>

          {/* Layout Controls */}
          <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-sm shrink-0">
            <button
              onClick={() => setLayoutMode('slider')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                layoutMode === 'slider'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              {local_t.sliderTitle}
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                layoutMode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              {local_t.gridTitle}
            </button>
          </div>
        </div>

        {/* Informative Help Alert */}
        <div className="mb-10 bg-purple-50 rounded-2xl p-4 border border-purple-200 max-w-xl mx-auto flex items-center gap-3.5 text-sm text-purple-950">
          <HelpIcon className="w-5 h-5 text-primary shrink-0" />
          <span>
            {layoutMode === 'slider' ? local_t.helpSlider : local_t.helpGrid}
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {filteredItems.map(item => {
            const position = sliderPositions[item.id] ?? 50;
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden flex flex-col h-full animate-fade-in hover:shadow-xl transition-shadow duration-300"
              >
                
                {/* Visual Area */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 tracking-widest uppercase bg-gray-200 px-3 py-1 rounded-full">
                      {translateText(item.category)}
                    </span>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {translateText(item.title)}
                    </span>
                  </div>

                  {layoutMode === 'slider' ? (
                    /* INTERACTIVE SLIDER VIEW */
                    <div 
                      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl select-none cursor-ew-resize border border-gray-200 shadow-inner group"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        handleSliderMove(item.id, e.clientX, rect);
                      }}
                      onTouchMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (e.touches[0]) {
                          handleSliderMove(item.id, e.touches[0].clientX, rect);
                        }
                      }}
                    >
                      {/* AFTER IMAGE (Background) */}
                      <img 
                        src={getResolvedImageUrl(item.afterImage)} 
                        alt={`${translateText(item.title)} - ${local_t.after}`} 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow select-none">
                        {local_t.after}
                      </span>

                      {/* BEFORE IMAGE (Clipped overlay using clipPath for perfect registration) */}
                      <div 
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
                      >
                        <img 
                          src={getResolvedImageUrl(item.beforeImage)} 
                          alt={`${translateText(item.title)} - ${local_t.before}`} 
                          className="absolute inset-0 w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-3 left-3 bg-primary/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow select-none">
                          {local_t.before}
                        </span>
                      </div>

                      {/* Sliding Divider Bar & Handle */}
                      <div 
                        className="absolute inset-y-0 pointer-events-none z-20 group-hover:scale-y-105 transition-all"
                        style={{ left: `${position}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-primary border-2 border-primary shadow-2xl flex items-center justify-center font-bold text-sm select-none">
                          ↔
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SIDE BY SIDE GRID VIEW */
                    <div className="grid grid-cols-2 gap-3.5 text-xs font-sans">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <EditableImage 
                          src={item.beforeImage} 
                          alt={`${translateText(item.title)} - ${local_t.before}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2.5 left-2.5 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full bg-opacity-90 z-20">
                          {local_t.before}
                        </span>
                      </div>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <EditableImage 
                          src={item.afterImage} 
                          alt={`${translateText(item.title)} - ${local_t.after}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2.5 right-2.5 bg-gray-950 text-white text-xs font-bold px-2.5 py-1 rounded-full bg-opacity-90 z-20">
                          {local_t.after}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Beauty Protocol Card (Procedure & Outcome Descriptions) */}
                <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{translateText(item.title)}</h3>
                    
                    {/* Beauty Procedure details */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{local_t.procedure}</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {translateText(item.procedure)}
                      </p>
                    </div>

                    {/* Outcome Beauty details */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{local_t.outcome}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {translateText(item.outcome)}
                      </p>
                    </div>
                  </div>

                  {/* Booking Trigger Link */}
                  <div className="border-t border-purple-50 pt-6 mt-6">
                    <a 
                      href={`#/reservation?service=${encodeURIComponent(item.title)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors"
                    >
                      {local_t.detailsBook}
                      <span className="text-lg">➔</span>
                    </a>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Dynamic CTA */}
        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 text-center border border-purple-100 shadow-xl max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{local_t.ctaTitle}</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-base">
            {local_t.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#/reservation" 
              className="bg-primary text-white py-3.5 px-8 rounded-full font-bold hover:bg-accent transition transform hover:-translate-y-0.5 shadow-lg shadow-purple-100"
            >
              {local_t.ctaBook}
            </a>
            <a 
              href="#/contact" 
              className="bg-neutral text-primary border border-purple-200 py-3.5 px-8 rounded-full font-bold hover:bg-white transition"
            >
              {local_t.ctaQuestion}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BeforeAfterGallery;
