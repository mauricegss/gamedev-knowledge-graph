'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean; // Indica se ainda estamos carregando o token inicial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando

  useEffect(() => {
    try {
      // Tenta ler o token do localStorage ao iniciar
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setTokenState(storedToken);
      }
    } catch (error) {
       console.error("Erro ao acessar localStorage:", error);
       // Lidar com erro se localStorage não estiver disponível
    } finally {
        setIsLoading(false); // Termina o carregamento inicial
    }
  }, []); // Roda apenas uma vez na montagem

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    try {
        if (newToken) {
          localStorage.setItem('authToken', newToken);
        } else {
          localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error("Erro ao acessar localStorage:", error);
    }
  };
  
  const logout = () => {
    setToken(null); // Limpa o estado e o localStorage
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};