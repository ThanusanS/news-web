import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, adminLogout, getAdminUser } from '../lib/appwrite';

const AuthContext = createContext(null);
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAllowedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      try {
        const u = await getAdminUser();
        if (!mounted) return;
        if (u && !isAllowedAdmin(u)) {
          await adminLogout().catch(() => {});
          setUser(null);
        } else {
          setUser(u);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email, password) {
    await adminLogin(email, password);
    const u = await getAdminUser();
    if (!isAllowedAdmin(u)) {
      await adminLogout().catch(() => {});
      throw new Error('This account is not authorized for admin access.');
    }
    setUser(u);
  }

  async function logout() {
    await adminLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
