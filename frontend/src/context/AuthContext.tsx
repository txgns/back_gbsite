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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    console.log("AuthContext: useEffect disparado. Token no localStorage:", storedToken);

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Verifica se o token não expirou
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          
          // Usa os dados do usuário salvos se disponíveis, senão decodifica do token
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("AuthContext: Dados do usuário recuperados do localStorage:", userData);
          } else {
            setUser(decodedToken);
            console.log("AuthContext: Token decodificado. Usuário:", decodedToken);
          }
        } else {
          console.log("AuthContext: Token expirado. Removendo do localStorage.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Falha ao decodificar token ou token inválido:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
      console.log("AuthContext: Nenhum token encontrado no localStorage.");
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const login = (token: string, userData?: any) => {
    console.log("AuthContext: Fazendo login. Token:", token);
    localStorage.setItem("token", token);
    setToken(token);
    
    if (userData) {
      // Use user data from login response
      setUser(userData);
      console.log("AuthContext: User data from login:", userData);
    } else {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        console.log("AuthContext: Token decodificado. Usuário:", decodedUser);
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
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


