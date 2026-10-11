import { useState, useEffect } from 'react';

// Key used in localStorage for replaced images map
const REPLACED_IMAGES_KEY = 'dr_replaced_images';
// Key used for admin login state
const ADMIN_LOGGED_IN_KEY = 'dr_admin_logged_in';

// SHA-256 hash of admin password
export const ADMIN_PASSWORD_HASH = 'fd76d69ca50967a2ec5698cc69945e19f85c00f3153bab250821b987d45d423d';

/**
 * Compute SHA-256 hash using the Web Crypto API
 */
export async function computeSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify admin password using SHA-256 hash comparison
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  try {
    const inputHash = await computeSha256(password);
    return inputHash === ADMIN_PASSWORD_HASH;
  } catch (err) {
    console.error('Failed to verify admin password:', err);
    return false;
  }
}


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
