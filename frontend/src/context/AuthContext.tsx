import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  user: any | null; // You might want to define a more specific User type
  login: (newToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("AuthContext: useEffect disparado. Token no localStorage:", storedToken);

    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        // Verifica se o token não expirou
        if (decodedUser.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decodedUser);
          console.log("AuthContext: Token válido e decodificado. Usuário:", decodedUser);
        } else {
          console.log("AuthContext: Token expirado. Removendo do localStorage.");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Falha ao decodificar token ou token inválido:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
      console.log("AuthContext: Nenhum token encontrado no localStorage.");
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


