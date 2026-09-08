import { useState, useEffect } from 'react';

// Key used in localStorage for replaced images map
const REPLACED_IMAGES_KEY = 'dr_replaced_images';
// Key used for admin login state
const ADMIN_LOGGED_IN_KEY = 'dr_admin_logged_in';

// Get all replaced images mapped by their default path
export function getReplacedImagesMap(): Record<string, string> {
  try {
    const data = localStorage.getItem(REPLACED_IMAGES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load replaced images', e);
    return {};
  }
}

// Get the resolved URL for a given default image URL
export function getResolvedImageUrl(defaultUrl: string): string {
  if (!defaultUrl) return defaultUrl;
  const map = getReplacedImagesMap();
  return map[defaultUrl] || defaultUrl;
}

// Save a new replaced image
export function saveReplacedImage(defaultUrl: string, newUrl: string): void {
  try {
    const map = getReplacedImagesMap();
    if (newUrl) {
      map[defaultUrl] = newUrl;
    } else {
      delete map[defaultUrl];
    }
    localStorage.setItem(REPLACED_IMAGES_KEY, JSON.stringify(map));
    // Dispatch event to notify all listeners
    window.dispatchEvent(new Event('dr_images_changed'));
  } catch (e) {
    console.error('Failed to save replaced image', e);
  }
}

// Clear all replaced images
export function clearReplacedImages(): void {
  localStorage.removeItem(REPLACED_IMAGES_KEY);
  window.dispatchEvent(new Event('dr_images_changed'));
}

// Check if admin is currently logged in
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
}

// Set admin login status
export function setAdminLoggedIn(status: boolean): void {
  localStorage.setItem(ADMIN_LOGGED_IN_KEY, status ? 'true' : 'false');
  window.dispatchEvent(new Event('dr_admin_auth_changed'));
}

// Hook to reactive admin status
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(isAdminLoggedIn());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdmin(isAdminLoggedIn());
    };

    window.addEventListener('dr_admin_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('dr_admin_auth_changed', handleAuthChange);
    };
  }, []);

  return isAdmin;
}

// Hook to reactive image resolution
export function useResolvedImage(defaultUrl: string): string {
  const [resolvedUrl, setResolvedUrl] = useState(getResolvedImageUrl(defaultUrl));

  useEffect(() => {
    // Initial resolution
    setResolvedUrl(getResolvedImageUrl(defaultUrl));

    const handleImagesChange = () => {
      setResolvedUrl(getResolvedImageUrl(defaultUrl));
    };

    window.addEventListener('dr_images_changed', handleImagesChange);
    return () => {
      window.removeEventListener('dr_images_changed', handleImagesChange);
    };
  }, [defaultUrl]);

  return resolvedUrl;
}

// Re-export services & price catalog management tools
export * from './servicesManager';
