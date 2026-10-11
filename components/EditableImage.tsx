import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Wand2, RefreshCw, X, Check, Eye, Upload, Trash2 } from 'lucide-react';
import { useAdminAuth, useResolvedImage, saveReplacedImage } from '../lib/adminUtils';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  imageKey?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  className = '',
  imageKey,
  ...props
}) => {
  const isAdmin = useAdminAuth();
  const defaultKey = imageKey || src;
  const resolvedSrc = useResolvedImage(defaultKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isLoading, setIsLoading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Suggested prompts depending on Unsplash or Gemini
  const SUGGESTED_PROMPTS = [
    { label: "💅 Nail Art de Luxe", text: "Luxury elite nail art design with delicate gold foils and emerald green polish on well-groomed hands, professional salon lighting, 8k" },
    { label: "💆 Spa & Massage Zen", text: "Traditional Chinese massage treatment in a luxurious zen spa room, hot stones, candlelight, soft orchids, warm glow, high-end, 8k" },
    { label: "👁️ Extension Cils & Sourcils", text: "Perfect professional eyelash extensions and eyebrow styling on beautiful woman's face, clean skin, intense gaze, luxury beauty salon, macro" },
    { label: "🌸 Soin de Visage", text: "Organic facial skin care treatment cream being applied on a glowing, clear skin, professional cosmetology clinic, serene, premium" }
  ];

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setTempImage(null);
    setError(null);
    setIsFallback(false);
    
    // Auto-detect a good default prompt based on alt or path
    const lowerAlt = alt.toLowerCase();
    const lowerSrc = src.toLowerCase();
    
    if (lowerAlt.includes('nail') || lowerAlt.includes('ongle') || lowerSrc.includes('nail') || lowerSrc.includes('ongle')) {
      setPrompt(SUGGESTED_PROMPTS[0].text);
    } else if (lowerAlt.includes('massage') || lowerAlt.includes('spa') || lowerSrc.includes('massage') || lowerSrc.includes('spa')) {
      setPrompt(SUGGESTED_PROMPTS[1].text);
    } else if (lowerAlt.includes('cil') || lowerAlt.includes('lash') || lowerAlt.includes('wax') || lowerAlt.includes('sourcil') || lowerSrc.includes('lash') || lowerSrc.includes('wax')) {
      setPrompt(SUGGESTED_PROMPTS[2].text);
    } else {
      setPrompt(SUGGESTED_PROMPTS[3].text);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setTempImage(null);
    setIsFallback(false);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageSize }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la génération de l'image.");
      }

      if (data.imageUrl) {
        setTempImage(data.imageUrl);
        if (data.fallback) {
          setIsFallback(true);
        }
      } else {
        throw new Error("Aucun visuel n'a été retourné par le serveur.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de communication avec le module de création visuelle IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    // 3MB = 3 * 1024 * 1024 bytes
    if (file.size > 3 * 1024 * 1024) {
      setError("Image trop lourde (max 3 Mo)");
      alert("Image trop lourde (max 3 Mo)");
      if (e.target) e.target.value = '';
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setTempImage(base64);
        setIsFallback(false);
      }
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier image.");
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  const handleSave = () => {
    if (tempImage) {
      saveReplacedImage(defaultKey, tempImage);
      setIsOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Supprimer cette image et rétablir l'image d'origine ?")) {
      saveReplacedImage(defaultKey, '');
      setIsOpen(false);
    }
  };

  const handleRestore = () => {
    if (window.confirm("Supprimer cette image et rétablir l'image d'origine ?")) {
      saveReplacedImage(defaultKey, '');
      setIsOpen(false);
    }
  };

  const isCustomized = resolvedSrc !== src;

  return (
    <>
      <div className={`relative group ${isAdmin ? 'z-20' : ''} ${className}`}>
        {/* Render actual image with resolved URL */}
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          {...props}
        />

        {/* Admin floating management buttons (visible for logged-in admins) */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-30">
            {/* Delete / Revert button: shown ONLY when image has been replaced */}
            {isCustomized && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-rose-600/90 hover:bg-rose-500 border border-rose-400/50 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
                title="Supprimer cette image et rétablir l'originale"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Wand button: opens edit dialog */}
            <button
              type="button"
              onClick={handleOpen}
              className="bg-slate-950/90 hover:bg-primary border border-purple-500/40 text-purple-300 hover:text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
              title="Modifier l'image (IA ou Téléversement)"
            >
              <Wand2 className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        )}
        
        {/* Admin hover controls */}
        {isAdmin && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-10 p-2 text-center select-none"
          >
            <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-2 max-w-xs animate-scale-up">
              <span className="text-[10px] uppercase tracking-widest font-black text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                Mode Édition Image
              </span>
              <p className="text-[10px] text-gray-300 line-clamp-2">
                Identifiant : <code className="font-mono text-purple-200">{defaultKey.substring(0, 30)}...</code>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpen}
                  className="px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-extrabold uppercase text-[9px] rounded-xl hover:opacity-90 flex items-center gap-1.5 shadow-lg transform active:scale-95 transition-all"
                >
                  <Wand2 className="w-3 h-3" /> Modifier l'image
                </button>
                {isCustomized && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase text-[9px] rounded-xl flex items-center gap-1 shadow-lg transform active:scale-95 transition-all"
                    title="Rétablir l'image d'origine"
                  >
                    <Trash2 className="w-3 h-3" /> Rétablir
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL WINDOW FOR IMAGE REPLACEMENT */}
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in text-xs font-sans">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 animate-scale-up text-left text-slate-100 shadow-[0_20px_50px_rgba(112,26,236,0.15)] max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" /> Remplacement Visuel
                </h3>
                <p className="text-[11px] text-slate-400">
                  Générez une image de luxe avec l'IA Gemini ou importez directement une photo depuis votre appareil.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-full transition-all"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Content split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: AI generation & Manual Upload */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Option 1 · Génération IA (Prompt)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="Saisissez les consignes esthétiques détaillées en anglais ou français..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary outline-none resize-none text-xs"
                  />
                </div>

                {/* Quick Templates */}
                <div className="space-y-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Modèles esthétiques :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SUGGESTED_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(p.text)}
                        className="text-[10px] bg-slate-900 hover:bg-purple-950/20 text-slate-300 hover:text-white p-2 rounded-xl text-left border border-slate-850 truncate hover:border-purple-900/40"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution selectors */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Résolution du rendu IA</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1K', '2K', '4K'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setImageSize(size)}
                        className={`py-1.5 px-2 rounded-xl border font-bold text-center transition-all text-[10px] ${
                          imageSize === size
                            ? 'bg-primary/20 border-primary text-primary shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {size} {size === '1K' ? '(Standard)' : size === '2K' ? '(HD)' : '(4K)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generation Action Button */}
                <button
                  type="button"
                  disabled={isLoading || !prompt.trim()}
                  onClick={handleGenerate}
                  className="w-full py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Générer le visuel IA
                    </>
                  )}
                </button>

                {/* Separator "ou" */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    ou
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Manual Photo Upload Section */}
                <div className="space-y-1.5">
                  <label className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-purple-500/30 hover:border-purple-500 transition-all shadow-md group">
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Importer une photo</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-[10px] text-center text-slate-500 font-medium">
                    JPG, PNG ou WebP · 3 Mo max
                  </p>
                </div>
              </div>

              {/* Right Column: Previews and confirmation */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2 flex-grow">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aperçu du Rendu</span>
                  
                  <div className="relative border border-slate-800 rounded-2xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center h-48">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-mono text-[10px] animate-pulse">Traitement de l'index de pixels...</p>
                      </div>
                    ) : tempImage ? (
                      <>
                        <img 
                          src={tempImage} 
                          alt="Nouveau rendu sélectionné" 
                          className="w-full h-full object-cover"
                        />
                        {isFallback && (
                          <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/95 border border-purple-900/40 rounded-xl p-2 text-[9.5px] text-purple-300 leading-relaxed font-mono">
                            ⚠️ Fallback : Mode démonstration actif. Visuel de haute qualité sélectionné.
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                          Nouveau Rendu (Non sauvegardé)
                        </div>
                      </>
                    ) : (
                      <>
                        <img 
                          src={resolvedSrc} 
                          alt="Visuel actif actuel" 
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center p-4">
                          <Eye className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="font-bold text-slate-300 text-[11px]">Aperçu de l'image actuelle</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Générez une image IA ou importez une photo pour voir le nouvel aperçu.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-950/50 border border-rose-500/20 text-rose-300 text-[10px] rounded-xl font-mono leading-relaxed">
                    ❌ {error}
                  </div>
                )}

                {/* Final controls */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 justify-end items-center">
                  {/* Supprimer / Rétablir button */}
                  {isCustomized && (
                    <button
                      type="button"
                      onClick={handleRestore}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-xl font-bold uppercase text-[10px] mr-auto transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer / Rétablir
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl font-bold uppercase text-[10px] transition-all"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    disabled={!tempImage}
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 text-white rounded-xl font-bold uppercase text-[10px] flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" /> Appliquer et Sauvegarder
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EditableImage;
