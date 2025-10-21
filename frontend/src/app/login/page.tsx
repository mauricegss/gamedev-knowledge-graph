'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast'; // Importar toast

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();

  const handleLoginSuccess = (receivedToken: string) => {
    try {
        setToken(receivedToken);
        toast.success('Login bem-sucedido! Redirecionando...');
        router.replace('/');
    } catch (error) {
        console.error("Erro ao salvar token ou redirecionar:", error);
        toast.error("Ocorreu um erro após o login. Verifique o console.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <p className="text-sm text-center text-gray-400">
          Ainda não tem conta?{' '}
          <Link href="/register" className="font-medium text-blue-500 hover:underline">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}