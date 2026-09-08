import rawData from './dr_sante_beaute_data.json';
import { ServiceItem, Review, RecentRealization } from './types';
import { 
  Sparkles, 
  Layers, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Droplets,
  Heart,
  Smile,
  Shield,
  Clock,
  UserCheck,
  Eye,
  Scissors
} from 'lucide-react';

// Configuration Variables
export const PLANITY_URL = "https://www.planity.com/dr-sante-beaute-75011-paris";
export const BOOKING_EMAIL = "drsantebeaute11@gmail.com";

// Business Info
export const COMPANY_INFO = {
  name: "D.R Santé & Beauté",
  tagline: "L'art des soins de beauté de précision et du bien-être absolu.",
  address: "50 rue Popincourt, 75011 Paris",
  phone: "09 80 29 88 88",
  phoneMobile: "07 87 32 49 22",
  whatsappNumber: "33787324922",
  email: "drsantebeaute11@gmail.com",
  schedule: "Lun - Sam : 10h00 - 20h00",
  scheduleSunday: "Dimanche : Fermé"
};

// Practitioners
export interface Practitioner {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
  bio: string;
  experience: string;
}

export const PRACTITIONERS: Practitioner[] = [
  {
    id: 'dr-laurent',
    name: 'Aurélie Laurent',
    role: 'Chef Esthéticienne & Facialiste',
    specialty: 'Spécialiste Soins Visage & Massages Relaxants',
    image: 'https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'Avec plus de 12 ans d\'expertise d\'esthétique d\'exception dans les plus grands spas parisiens. Passionnée par le bien-être holistique, elle excelle dans le Soin Signature d\'éclat et les modelages relaxants chinois.',
    experience: '12 ans d\'expertise'
  },
  {
    id: 'dr-mercier',
    name: 'Thomas Mercier',
    role: 'Styliste Ongulaire Senior',
    specialty: 'Expert Pose Résine, Gel & Décors Nail Art',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'Spécialiste reconnu de la pose de faux-ongles et du Nail Art créatif. Précis et passionné, il saura sublimer vos mains grâce à la pose de gel, de résine ou de vernis semi-permanent ultra-durable.',
    experience: '9 ans d\'expertise'
  },
  {
    id: 'melissa-v',
    name: 'Mélissa Valois',
    role: 'Experte Spa Mains & Pieds',
    specialty: 'Beauté des Pieds & Rituels Spa Détox',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'Mélissa maîtrise à la perfection les protocoles de beauté des pieds et de réflexologie douce. Très méticuleuse, elle réalise des gommages et masques réparateurs haut de gamme pour une détente sensorielle absolue.',
    experience: '7 ans d\'expertise'
  },
  {
    id: 'marine-d',
    name: 'Marine Dubois',
    role: 'Styliste du Regard & Cils',
    specialty: 'Extensions de Cils Naturel & Glamour',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'Formée aux techniques de pointe de rehaussement et d\'extensions de cils (méthode cil à cil et volume russe). Marine sculpte et harmonise votre regard avec une douceur et une précision inégalée.',
    experience: '5 ans d\'expertise'
  }
];

// Reconstruct SERVICES dynamically from rawData (covering the 6 official categories + Signatures + Rituals)
const parseServices = (): ServiceItem[] => {
  const list: ServiceItem[] = [];

  // 1. Add Signature Treatment first (✦ NOTRE SIGNATURE)
  if (rawData.signature_treatment) {
    list.push({
      id: "signature-facial",
      name: rawData.signature_treatment.name_fr,
      description: rawData.signature_treatment.description_fr,
      duration: rawData.signature_treatment.duration,
      price: `${rawData.signature_treatment.price} €`,
      category: "✦ NOTRE SIGNATURE",
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop",
      icon: Sparkles
    });
  }

  // 2. Add Signature Rituals (★ RITUELS SIGNATURE)
  if (rawData.signature_rituals) {
    rawData.signature_rituals.forEach((ritual: any, rIdx: number) => {
      list.push({
        id: `ritual-${ritual.number || rIdx}`,
        name: ritual.name,
        description: `${ritual.description}${ritual.note ? ` (${ritual.note})` : ''}`,
        duration: ritual.duration || "60 min",
        price: `${ritual.price} €`,
        category: "★ RITUELS SIGNATURE",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        icon: Sparkles
      });
    });
  }

  // 3. Loop through the 6 categories and their subgroups
  if (rawData.categories) {
    rawData.categories.forEach((cat: any) => {
      let catIcon = Sparkles;
      let catImage = "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop";

      if (cat.id === 'epilation') {
        catIcon = Zap;
        catImage = "/src/assets/images/eyebrow_waxing_luxury_1783650088983.jpg";
      } else if (cat.id === 'soins_relaxants') {
        catIcon = Activity;
        catImage = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop";
      } else if (cat.id === 'extension_cils') {
        catIcon = Eye;
        catImage = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop";
      } else if (cat.id === 'beaute_mains') {
        catIcon = Droplets;
        catImage = "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop";
      } else if (cat.id === 'beaute_pieds') {
        catIcon = Heart;
        catImage = "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=800&auto=format&fit=crop";
      } else if (cat.id === 'faux_ongles') {
        catIcon = Smile;
        catImage = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop";
      }

      if (cat.subgroups) {
        cat.subgroups.forEach((sub: any, subIdx: number) => {
          if (sub.services) {
            sub.services.forEach((service: any, sIdx: number) => {
              let priceStr = "";
              if (service.price_female && service.price_male) {
                priceStr = `Femme ${service.price_female}€ / Homme ${service.price_male}€`;
              } else if (service.price_female) {
                priceStr = `${service.price_female} €`;
              } else if (service.price !== undefined) {
                priceStr = `${service.price} €`;
              } else {
                priceStr = "Sur devis";
              }

              const desc = service.description_fr || `${cat.name_fr} · ${sub.name_fr}. Réalisé avec soin et précision.`;

              list.push({
                id: `${cat.id}-${subIdx}-${sIdx}`,
                name: `${service.name_fr}`,
                description: desc,
                duration: service.duration || "20 min",
                price: priceStr,
                category: cat.name_fr,
                image: catImage,
                icon: catIcon
              });
            });
          }
        });
      }
    });
  }

  return list;
};

export const SERVICES: ServiceItem[] = parseServices();

// Before & After Gallery Data
export interface BeforeAfterItem {
  id: string;
  category: string;
  title: string;
  procedure: string;
  outcome: string;
  beforeImage: string;
  afterImage: string;
}

export const BEFORE_AFTER_GALLERY: BeforeAfterItem[] = [
  {
    id: 'ba-nails-french',
    category: 'IV. BEAUTÉ DES MAINS',
    title: 'French Semi-Permanent Perfect',
    procedure: 'Dépose douce, manucure russe de précision, préparation de la plaque et pose de vernis semi-permanent French avec renfort.',
    outcome: 'Des ongles parfaitement dessinés, renforcés et une French ultra-propre avec une brillance miroir durable.',
    beforeImage: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ba-lashes-volume',
    category: 'III. EXTENSION DES CILS',
    title: 'Extension de Cils Volume Glamour',
    procedure: 'Isolation rigoureuse cil à cil, application de bouquets faits mains en fibre de soie premium pour un effet étiré sur-mesure.',
    outcome: 'Un regard instantanément agrandi, des cils denses et légers sans aucune surcharge sur la racine naturelle.',
    beforeImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ba-pedicure-spa',
    category: 'V. BEAUTÉ DES PIEDS',
    title: 'Rituel Beauté des Pieds & SPA',
    procedure: 'Bain aux sels marins, gommage enzymatique aux pépins de fruits, traitement anti-callosités indolore et massage hydratant.',
    outcome: 'Des talons incroyablement doux, libérés des rugosités et des callosités, avec des ongles coupés et nettoyés.',
    beforeImage: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ba-nails-extension',
    category: 'VI. POSE FAUX-ONGLES',
    title: 'Pose Faux Ongles Résine & Beauté',
    procedure: 'Rallongement haut de gamme au chablon avec gel de construction auto-égalisant pour restructurer les ongles rongés ou cassants.',
    outcome: 'Des ongles longs, robustes et à l\'aspect incroyablement naturel, prêts pour une pose de couleur unie.',
    beforeImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ba-lashes-natural',
    category: 'III. EXTENSION DES CILS',
    title: 'Extension Naturel Regard',
    procedure: 'Pose de cils individuels ultra-fins cil à cil pour souligner la ligne des yeux tout en discrétion.',
    outcome: 'Effet mascara naturel, courbure parfaite sans paquet qui dure de 4 à 6 semaines.',
    beforeImage: 'https://images.unsplash.com/photo-1590156546746-cf3375d9c07e?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ba-pedicure-semi',
    category: 'V. BEAUTÉ DES PIEDS',
    title: 'Beauté des Pieds de Luxe & Semi',
    procedure: 'Soin des cuticules, râpe dermatologique, hydratation intense et pose de vernis semi-permanent longue tenue.',
    outcome: 'Des orteils impeccables et un vernis ultra-brillant à l\'épreuve des chocs pour plus d\'un mois.',
    beforeImage: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=600&auto=format&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=600&auto=format&fit=crop'
  }
];

// Reviews Data
export const REVIEWS: Review[] = [
  { id: 1, name: "Sophie M.", rating: 5, text: "Le Soin Signature du visage chez D.R. Santé & Beauté est tout simplement magique. Ma peau est lumineuse, les traits sont détendus, et l'accueil d'Aurélie est exceptionnel." },
  { id: 2, name: "Jean-Marc L.", rating: 5, text: "Beauté des pieds et massage d'une grande douceur et d'une précision remarquable. Mélissa Valois est d'une grande écoute. Un pur moment de décompression !" },
  { id: 3, name: "Julie T.", rating: 5, text: "Pose d'extensions de cils glamour très naturelles et de grande qualité. Tenue impeccable après 3 semaines. Équipe chaleureuse et très professionnelle." }
];

// Recent Real-Time Achievements & Gallery Data
export const RECENT_REALIZATIONS: RecentRealization[] = [
  {
    id: 'rec-nails',
    title: 'French Semi-Permanent Parfait',
    category: 'IV. BEAUTÉ DES MAINS',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop',
    serviceId: 'beaute_mains-sub-0-service-2',
    timestamp: 'Il y a 2 heures',
    likes: 47,
    treatment: 'Manucure avec Semi-Permanent',
    physician: 'Thomas Mercier'
  },
  {
    id: 'rec-facial',
    title: 'Soin Eclat du Visage Signature',
    category: '⭐ SOIN SIGNATURE',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344cc?q=80&w=800&auto=format&fit=crop',
    serviceId: 'signature-facial',
    timestamp: 'Hier, 16h15',
    likes: 34,
    treatment: '⭐ SOIN SIGNATURE — Soin du Visage',
    physician: 'Aurélie Laurent'
  },
  {
    id: 'rec-lashes',
    title: 'Extension de Cils Volume Glamour',
    category: 'III. EXTENSION DES CILS',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    serviceId: 'extension_cils-service-1',
    timestamp: 'Il y a 1 jour',
    likes: 41,
    treatment: 'Extension de Cils Glamour',
    physician: 'Marine Dubois'
  },
  {
    id: 'rec-relax',
    title: 'Réflexologie Méditative des Pieds',
    category: 'II. SOINS RELAXANTS',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop',
    serviceId: 'soins_relaxants-sub-0-service-1',
    timestamp: 'Il y a 2 jours',
    likes: 28,
    treatment: 'Soins Ciblés - Pieds (30 min)',
    physician: 'Mélissa Valois'
  },
  {
    id: 'rec-nails-art',
    title: 'Pose Faux Ongles Résine & Beauté',
    category: 'VI. POSE FAUX-ONGLES',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop',
    serviceId: 'faux_ongles-sub-0-service-2',
    timestamp: 'Il y a 3 jours',
    likes: 54,
    treatment: 'Résine + Semi-Permanent',
    physician: 'Thomas Mercier'
  },
  {
    id: 'rec-pedicure',
    title: 'Rituel Beauté des Pieds & SPA',
    category: 'V. BEAUTÉ DES PIEDS',
    image: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=800&auto=format&fit=crop',
    serviceId: 'beaute_pieds-sub-2-service-2',
    timestamp: 'Il y a 4 jours',
    likes: 39,
    treatment: 'SPA Semi-Permanent avec Masque',
    physician: 'Mélissa Valois'
  }
];

