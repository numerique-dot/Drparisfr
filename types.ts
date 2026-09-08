export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration?: string;
  price?: string;
  image?: string;
  icon?: any;
  category: string;
}

export interface Review {
  id: number | string;
  name: string;
  rating: number;
  text: string;
  service?: string;
  date?: string;
}

export interface RecentRealization {
  id: string;
  image: string;
  title: string;
  category: string;
  serviceId: string;
  timestamp: string;
  likes: number;
  treatment: string;
  physician: string;
}

export interface BookingFormData {
  service: string;
  date: string;
  time: string;
  staff?: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  rgpdConsent: boolean;
}

export enum BookingStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}