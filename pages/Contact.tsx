import React, { useState } from 'react';
import { COMPANY_INFO, PLANITY_URL } from '../constants';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate email sending
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header with Background */}
      <div className="bg-gray-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-900/50"></div>
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Contactez-nous</h1>
          <p className="text-purple-200 text-xl font-light max-w-2xl mx-auto">
            Une question sur nos soins ? Besoin d'un renseignement ? Notre équipe est à votre écoute.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* Phone Card */}
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50 flex items-center hover:-translate-y-1 transition duration-300 group">
             <div className="bg-purple-50 p-4 rounded-full mr-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
               <Phone size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Téléphone</p>
               <a href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`} className="text-lg font-bold text-gray-900 hover:text-primary transition">
                 {COMPANY_INFO.phone}
               </a>
             </div>
           </div>

           {/* Email Card */}
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50 flex items-center hover:-translate-y-1 transition duration-300 group">
             <div className="bg-purple-50 p-4 rounded-full mr-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
               <Mail size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email</p>
               <a href={`mailto:${COMPANY_INFO.email}`} className="text-lg font-bold text-gray-900 hover:text-primary transition truncate block max-w-[200px] md:max-w-none">
                 {COMPANY_INFO.email}
               </a>
             </div>
           </div>

           {/* Address Card */}
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50 flex items-center hover:-translate-y-1 transition duration-300 group">
             <div className="bg-purple-50 p-4 rounded-full mr-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
               <MapPin size={24} />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Adresse</p>
               <a href="#interactive-google-map" className="text-base font-black text-gray-900 hover:text-primary transition block">
                 50 rue Popincourt
               </a>
               <p className="text-xs text-purple-700 font-semibold">75011 Paris &bull; Métro Saint-Ambroise</p>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Map & Hours */}
          <div className="flex flex-col gap-8">
            {/* Map */}
            <InteractiveMap />

            {/* Hours & Booking */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-50">
               <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                 <Clock className="mr-3 text-primary" /> 
                 Horaires d'ouverture
               </h3>
               <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-3 border-dashed">
                   <span>Lundi - Samedi</span>
                   <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">10:00 - 20:00</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600 pb-2">
                   <span>Dimanche</span>
                   <span className="font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full text-sm">Fermé</span>
                 </div>
               </div>
               
               <a 
                 href={PLANITY_URL} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl text-center shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group"
               >
                 <span>Réserver sur Planity</span>
                 <ExternalLink className="ml-2 h-5 w-5 group-hover:rotate-45 transition-transform" />
               </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="p-8 sm:p-10 flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
              <p className="text-gray-600 mb-8">Remplissez le formulaire ci-dessous, nous vous répondrons dans les plus brefs délais.</p>
              
              {isSent ? (
                <div className="bg-green-50 rounded-2xl p-8 text-center animate-fade-in border border-green-100 h-64 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message envoyé !</h3>
                  <p className="text-green-700">Merci de nous avoir contactés. Nous reviendrons vers vous très vite.</p>
                  <button onClick={() => setIsSent(false)} className="mt-6 text-green-700 font-bold hover:text-green-900 underline transition-colors">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">Sujet</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      placeholder="Demande d'information..."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea 
                      id="message" 
                      required 
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;