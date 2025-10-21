'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import toast from 'react-hot-toast'; // Importar toast

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    // Substituído alert por toast
    toast.success('Registro realizado com sucesso! Redirecionando para o login.');
    router.push('/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Registro</h1>
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        <p className="text-sm text-center text-gray-400">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-blue-500 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}