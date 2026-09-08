import { useState, useEffect, useCallback, useMemo } from 'react';
import { ServiceItem } from '../types';
import { SERVICES as DEFAULT_SERVICES } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const SERVICES_STORAGE_KEY = 'dr_salon_services_v3';
const CUSTOM_CATEGORIES_KEY = 'dr_salon_custom_categories';

// Default categories extracted from standard catalog
export const DEFAULT_CATEGORIES = [
  "✦ NOTRE SIGNATURE",
  "★ RITUELS SIGNATURE",
  "I. ÉPILATION",
  "II. SOINS RELAXANTS",
  "III. EXTENSION DES CILS",
  "IV. BEAUTÉ DES MAINS",
  "V. BEAUTÉ DES PIEDS",
  "VI. POSE FAUX-ONGLES"
];

// Preset photographic asset URLs for quick selection when creating or editing services
export const PRESET_SERVICE_IMAGES = [
  { label: 'Onglerie & Manucure Russe', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop' },
  { label: 'Faux Ongles & Nail Art Luxury', url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop' },
  { label: 'Soin Visage & Hydrafacial', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop' },
  { label: 'Soin Signature Élite', url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop' },
  { label: 'Extensions Cils & Rehaussement', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop' },
  { label: 'Spa Pédicure & Bien-être', url: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=800&auto=format&fit=crop' },
  { label: 'Massage Relaxant & Méridiens', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop' },
  { label: 'Épilation Précision', url: '/src/assets/images/eyebrow_waxing_luxury_1783650088983.jpg' },
  { label: 'Soins Capillaires & Shampoing', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop' },
  { label: 'Rituel Corps & Gommage', url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop' }
];

/**
 * Retrieve all services from localStorage (or fallback to default catalog)
 */
export function getStoredServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read services from localStorage', e);
  }
  // Fallback to default services from constants
  return [...DEFAULT_SERVICES];
}

/**
 * Save updated list of services to localStorage & dispatch notification event
 */
export function saveStoredServices(services: ServiceItem[]): void {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent('dr_services_changed', { detail: services }));

    // Async background sync with Firestore if online and collection exists
    try {
      if (db) {
        // Asynchronously persist to firestore in background
        const batch = writeBatch(db);
        // We sync meta timestamp
        const metaRef = doc(db, 'system_meta', 'services_catalog');
        setDoc(metaRef, { updatedAt: new Date().toISOString(), totalCount: services.length }, { merge: true }).catch(() => {});
      }
    } catch (_) {}
  } catch (e) {
    console.error('Failed to save services to localStorage', e);
  }
}

/**
 * Add a new service item
 */
export function addServiceItem(item: Omit<ServiceItem, 'id'> & { id?: string }): ServiceItem {
  const current = getStoredServices();
  const id = item.id || `custom-service-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Format price if only a number was provided
  let formattedPrice = item.price || '0 €';
  if (/^\d+(\.\d+)?$/.test(formattedPrice.trim())) {
    formattedPrice = `${formattedPrice.trim()} €`;
  }

  const newService: ServiceItem = {
    ...item,
    id,
    price: formattedPrice,
    duration: item.duration || '30 min',
    image: item.image || PRESET_SERVICE_IMAGES[0].url,
    category: item.category || '⭐ SOIN SIGNATURE'
  };

  const updated = [newService, ...current];
  saveStoredServices(updated);
  return newService;
}

/**
 * Update an existing service item by ID
 */
export function updateServiceItem(id: string, updates: Partial<ServiceItem>): boolean {
  const current = getStoredServices();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  let formattedPrice = updates.price;
  if (formattedPrice && /^\d+(\.\d+)?$/.test(formattedPrice.trim())) {
    formattedPrice = `${formattedPrice.trim()} €`;
  }

  current[index] = {
    ...current[index],
    ...updates,
    ...(formattedPrice ? { price: formattedPrice } : {})
  };

  saveStoredServices(current);
  return true;
}

/**
 * Delete a service item by ID
 */
export function deleteServiceItem(id: string): boolean {
  const current = getStoredServices();
  const filtered = current.filter(s => s.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredServices(filtered);
  return true;
}

/**
 * Reset the catalog to original default 77 items
 */
export function resetServicesToDefault(): ServiceItem[] {
  const defaults = [...DEFAULT_SERVICES];
  saveStoredServices(defaults);
  return defaults;
}

/**
 * Get all unique categories across existing services + custom categories
 */
export function getAvailableCategories(): string[] {
  const services = getStoredServices();
  const fromServices = services.map(s => s.category).filter(Boolean);
  
  let custom: string[] = [];
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw) custom = JSON.parse(raw);
  } catch (_) {}

  const all = Array.from(new Set([...DEFAULT_CATEGORIES, ...fromServices, ...custom]));
  return all;
}

/**
 * Add a custom category
 */
export function addCustomCategory(categoryName: string): string[] {
  const clean = categoryName.trim();
  if (!clean) return getAvailableCategories();
  
  let current: string[] = [];
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw) current = JSON.parse(raw);
  } catch (_) {}

  if (!current.includes(clean)) {
    current.push(clean);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('dr_services_changed'));
  }
  return getAvailableCategories();
}

/**
 * Reactive React Hook for accessing and managing services and prices everywhere
 */
export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>(getStoredServices);

  const reloadServices = useCallback(() => {
    setServices(getStoredServices());
  }, []);

  useEffect(() => {
    const handleServiceChange = () => {
      reloadServices();
    };

    window.addEventListener('dr_services_changed', handleServiceChange);
    window.addEventListener('storage', handleServiceChange);

    return () => {
      window.removeEventListener('dr_services_changed', handleServiceChange);
      window.removeEventListener('storage', handleServiceChange);
    };
  }, [reloadServices]);

  const categories = useMemo(() => {
    const cats = ['Tous', ...new Set(services.map(s => s.category).filter(Boolean))];
    return cats;
  }, [services]);

  const handleAddService = useCallback((item: Omit<ServiceItem, 'id'> & { id?: string }) => {
    const created = addServiceItem(item);
    reloadServices();
    return created;
  }, [reloadServices]);

  const handleUpdateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    const success = updateServiceItem(id, updates);
    reloadServices();
    return success;
  }, [reloadServices]);

  const handleDeleteService = useCallback((id: string) => {
    const success = deleteServiceItem(id);
    reloadServices();
    return success;
  }, [reloadServices]);

  const handleResetServices = useCallback(() => {
    const defaults = resetServicesToDefault();
    reloadServices();
    return defaults;
  }, [reloadServices]);

  return {
    services,
    categories,
    addService: handleAddService,
    updateService: handleUpdateService,
    deleteService: handleDeleteService,
    resetServices: handleResetServices,
    reloadServices
  };
}
