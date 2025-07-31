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
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    console.log("AuthContext: useEffect disparado. Token no localStorage:", storedToken);

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Verifica se o token não expirou (adiciona 5 minutos de margem)
        const now = Date.now();
        const expirationTime = decodedToken.exp * 1000;
        const isExpired = now >= (expirationTime - 5 * 60 * 1000); // 5 min antes da expiração
        
        console.log("Token expires at:", new Date(expirationTime));
        console.log("Current time:", new Date(now));
        console.log("Is expired:", isExpired);
        
        if (!isExpired) {
          setToken(storedToken);
          
          // Usa os dados do usuário salvos se disponíveis, senão decodifica do token
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log("AuthContext: Dados do usuário recuperados do localStorage:", userData);
            } catch (parseError) {
              console.error("Error parsing stored user data:", parseError);
              // Se houver erro ao parsear, use os dados do token
              setUser(decodedToken);
              localStorage.setItem("user", JSON.stringify(decodedToken));
            }
          } else {
            setUser(decodedToken);
            localStorage.setItem("user", JSON.stringify(decodedToken));
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
      // Use user data from login response and save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      console.log("AuthContext: User data from login:", userData);
    } else {
      try {
        const decodedUser = jwtDecode(token);
        localStorage.setItem("user", JSON.stringify(decodedUser));
        setUser(decodedUser);
        console.log("AuthContext: Token decodificado. Usuário:", decodedUser);
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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


