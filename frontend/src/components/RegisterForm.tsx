'use client';

import { useState } from 'react';
import toast from 'react-hot-toast'; // Importar toast

interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState<string | null>(null); // Pode remover
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // setError(null); // Pode remover
    setIsLoading(true);

    if (password.length < 6) {
       toast.error('A senha deve ter pelo menos 6 caracteres.'); // Usa toast
       setIsLoading(false);
       return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido no registro' }));
        throw new Error(errorData.detail || 'Falha no registro');
      }

      onRegisterSuccess();

    } catch (err: any) {
      // setError(err.message); // Pode remover
      toast.error(err.message); // Usa toast para erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}
      <div>
        <label htmlFor="email-register" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          id="email-register" name="email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="password-register" className="block text-sm font-medium text-gray-300 mb-1">Senha (mínimo 6 caracteres)</label>
        <input
          id="password-register" name="password" type="password" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
          disabled={isLoading}
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}