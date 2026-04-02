import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, adminLogout, getAdminUser } from '../lib/appwrite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    await adminLogin(email, password);
    const u = await getAdminUser();
    setUser(u);
  }

  async function logout() {
    await adminLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
