import { useState, useCallback } from 'react';
import { getKey, setStoredKey, clearKey } from '@/api/client';

export function useAuth() {
  const [key, setKeyState] = useState<string | null>(() => getKey() || null);

  const authenticate = useCallback((k: string) => {
    setStoredKey(k);
    setKeyState(k);
  }, []);

  const logout = useCallback(() => {
    clearKey();
    window.location.reload();
  }, []);

  return { isAuthed: !!key, key, authenticate, logout };
}
