// Em: frontend/src/components/ProtectedRoute.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // [ALTERADO] Só age QUANDO isLoading for explicitamente false
    if (isLoading === false) {
      // Se terminou de carregar E não tem token, redireciona
      if (!token) {
        router.replace('/login');
      }
    }
  }, [isLoading, token, router]); // Dependências

  // Enquanto carrega, mostra loader
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Carregando autenticação...</div>;
  }

  // Se terminou de carregar E tem token, mostra o conteúdo
  if (!isLoading && token) {
    return <>{children}</>;
  }

  // Se terminou de carregar e não tem token, espera o redirecionamento acontecer
  // Retornar null evita piscar conteúdo indevido
  return null;
}