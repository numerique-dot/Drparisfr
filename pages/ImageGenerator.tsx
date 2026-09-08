import React, { useState } from 'react';
import { Loader2, Wand2, Download, AlertTriangle, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "Nail art élégant rouge bordeaux avec motifs dorés",
  "Maquillage mariée naturel et lumineux, peau fraîche",
  "Extension de cils volume russe, regard intense",
  "Salle de massage zen avec bougies et orchidées",
  "Pédicure spa relaxante avec galets chauds"
];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsFallback(false);
    setFallbackReason(null);

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
        throw new Error(data.error || 'Une erreur est survenue lors de la génération de l\'image.');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        if (data.fallback) {
          setIsFallback(true);
          setFallbackReason(data.reason);
        }
        setTimeout(() => {
          document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error("Aucune image n'a été générée. Veuillez réessayer.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la génération.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 animate-slide-up">
            <Wand2 className="text-primary h-8 w-8 animate-pulse" />
            Studio d'Inspiration IA
          </h1>
          <p className="mt-2 text-gray-600 animate-slide-up">
            Visualisez et concevez des créations sur-mesure pour vos ongles, maquillage et soins en exclusivité chez {document.title.split(' - ')[0] || 'D.R. Santé & Beauté'}.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 border border-purple-100 animate-fade-in">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold text-gray-800 mb-3">
                Décrivez votre idée de création
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex : Un nail art élégant rouge bordeaux avec des motifs floraux dorés..."
                className="w-full h-32 p-4 rounded-xl border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-base outline-none resize-none"
                required
              />
              
              {/* Quick Suggestions */}
              <div className="mt-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Idées d'inspiration :</span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="text-xs bg-purple-50 text-purple-700 hover:bg-primary hover:text-white px-3 py-2 rounded-full transition duration-200 flex items-center shadow-sm select-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Format de l'image
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['1K', '2K', '4K'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`
                      py-3.5 px-4 rounded-xl border-2 font-bold text-base transition duration-200
                      ${imageSize === size 
                        ? 'border-primary bg-purple-50 text-primary shadow-md' 
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {size === '1K' ? '1K (Standard)' : size === '2K' ? '2K (HD)' : '4K (Ultra HD)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt}
              className={`
                w-full py-4.5 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-200 flex items-center justify-center
                ${isLoading || !prompt 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-accent hover:shadow-xl hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  Génération en cours (environ 15 secondes)...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-6 w-6" />
                  Générer mon inspiration beauté
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start">
               <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
          )}

          {generatedImage && (
            <div className="mt-12 animate-fade-in scroll-mt-20" id="result">
              <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6"></div>

              {isFallback && (
                <div className="max-w-2xl mx-auto mb-8 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900 text-sm leading-relaxed shadow-sm flex items-start animate-fade-in">
                  <Sparkles className="h-6 w-6 mr-3.5 flex-shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-amber-950 mb-1">
                      {fallbackReason === 'quota_exceeded' 
                        ? "Mode Galerie d'Inspiration activé (Limite de quota IA)" 
                        : "Mode Suggestion de notre Catalogue"}
                    </h4>
                    <p className="text-amber-800">
                      {fallbackReason === 'quota_exceeded'
                        ? "La clé API gratuite a atteint sa limite de quota d'images. Notre système a recherché et sélectionné une magnifique réalisation de notre catalogue correspondant exactement à votre idée !"
                        : "Le système a sélectionné l'un des plus magnifiques exemples de notre catalogue de créations réelles pour illustrer au mieux votre demande."}
                    </p>
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Votre Création Unique</h3>
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50 max-w-2xl mx-auto">
                <img 
                    src={generatedImage} 
                    alt="Création d'inspiration générée par l'IA" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain max-h-[600px] mx-auto" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                    <a 
                        href={generatedImage} 
                        download={`inspiration-beaute-${Date.now()}.png`}
                        className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition flex items-center transform scale-95 group-hover:scale-100 duration-200 shadow-xl pointer-events-auto"
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Télécharger l'image
                    </a>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4 leading-relaxed max-w-md mx-auto">
                Conseil : Téléchargez cette image et montrez-la à notre équipe lors de votre rendez-vous pour la recréer en salon !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
