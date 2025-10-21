'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast'; // Importar toast

interface Engine { id: number; name: string; }
interface Genre { id: number; name: string; }

interface GameFormProps {
  onDataChanged: () => void;
  engines: Engine[];
  genres: Genre[];
}

export default function GameForm({ onDataChanged, engines, genres }: GameFormProps) {
  const [name, setName] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [engineId, setEngineId] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(new Set<number>());
  // const [error, setError] = useState<string | null>(null); // Pode remover
  const [formIsLoading, setFormIsLoading] = useState(false);
  const { token, isLoading: authIsLoading } = useAuth();

  const handleGenreChange = (genreId: number) => {
    const newSelection = new Set(selectedGenres);
    if (newSelection.has(genreId)) { newSelection.delete(genreId); }
    else { newSelection.add(genreId); }
    setSelectedGenres(newSelection);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // setError(null); // Pode remover
    if (selectedGenres.size === 0) {
      toast.error('Por favor, selecione pelo menos um gênero.'); // Usa toast
      return;
    }
    if (authIsLoading) {
        // setError("Verificando autenticação..."); // Pode remover
        return; // Não mostra erro se auth está carregando
    }
    if (!token) {
        toast.error("Você precisa estar logado para adicionar um jogo."); // Usa toast
        return;
    }
    setFormIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/games', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
            name: name,
            release_year: parseInt(releaseYear),
            engine_id: engineId ? parseInt(engineId) : null,
            genre_ids: Array.from(selectedGenres),
         }),
      });

      if (!response.ok) {
        if (response.status === 401) { throw new Error('Sua sessão expirou ou é inválida. Faça login novamente.'); }
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido ao criar o jogo' }));
        throw new Error(errorData.detail || 'Falha ao criar o jogo');
      }

      setName(''); setReleaseYear(''); setEngineId(''); setSelectedGenres(new Set());
      onDataChanged(); // Atualiza a lista (feedback visual implícito)
      // toast.success('Jogo adicionado com sucesso!'); // Toast opcional aqui
    } catch (err: any) {
      console.error(err); // Manter console.error
      // setError(err.message); // Pode remover
      toast.error(`Erro ao adicionar: ${err.message}`); // Usa toast
    }
    finally { setFormIsLoading(false); }
  };

  if (authIsLoading) {
      return <p className="text-center text-gray-400">Carregando formulário...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogo</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required disabled={formIsLoading} />
      </div>
      <div>
        <label htmlFor="release_year" className="block text-sm font-medium text-gray-300 mb-1">Ano de Lançamento</label>
        <input id="release_year" type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required disabled={formIsLoading} />
      </div>
      <div>
        <label htmlFor="engine" className="block text-sm font-medium text-gray-300 mb-1">Engine (Opcional)</label>
        <select id="engine" value={engineId} onChange={(e) => setEngineId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" disabled={formIsLoading}>
          <option value="">Nenhuma / Desconhecida</option>
          {engines.map((engine) => ( <option key={engine.id} value={engine.id}>{engine.name}</option> ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Gêneros (Selecione um ou mais)</label>
        <div className="max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md p-2 grid grid-cols-2 md:grid-cols-3">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center space-x-2 p-1">
              <input type="checkbox" checked={selectedGenres.has(genre.id)} onChange={() => handleGenreChange(genre.id)} className="form-checkbox bg-gray-800 text-purple-500 rounded" disabled={formIsLoading}/>
              <span className="text-sm">{genre.name}</span>
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50" disabled={formIsLoading || authIsLoading}>
        {formIsLoading ? 'Adicionando...' : 'Adicionar Jogo'}
      </button>
    </form>
  );
}