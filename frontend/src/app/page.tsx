'use client';

import { useState, useEffect, useCallback } from 'react';
import GameForm from '@/components/GameForm';
import GraphContainer from '@/components/GraphContainer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import EditGameModal from '@/components/EditGameModal';
import toast from 'react-hot-toast';

// --- Interfaces ---
interface Engine { id: number; name: string; }
interface Game { id: number; name: string; release_year: number; engine?: Engine; genres: Genre[]; }
interface Genre { id: number; name: string; }
// Interface para Contagens (Simplificada)
interface MetricsCountsData { games: number; }
interface MostPopularGenreData { genre: Genre | null; game_count: number; }

export default function HomePage() {
  // --- Estados ---
  const [games, setGames] = useState<Game[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [genreFilter, setGenreFilter] = useState<string>('');
  const { token, isLoading: authIsLoading, logout } = useAuth();
  const [counts, setCounts] = useState<MetricsCountsData | null>(null);
  const [popularGenre, setPopularGenre] = useState<MostPopularGenreData | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // --- Funções ---
  const fetchData = useCallback(async () => {
    console.log("fetchData: Iniciando busca...");
    setIsLoadingData(true);
    setCounts(null);
    setPopularGenre(null);
    try {
      const responses = await Promise.all([
        fetch('http://127.0.0.1:8000/games', { cache: 'no-store' }),
        fetch('http://127.0.0.1:8000/engines', { cache: 'no-store' }),
        fetch('http://127.0.0.1:8000/genres', { cache: 'no-store' }),
        fetch('http://127.0.0.1:8000/metrics/counts', { cache: 'no-store' }),
        fetch('http://127.0.0.1:8000/metrics/most_popular_genre', { cache: 'no-store' })
      ]);
      console.log("fetchData: Respostas recebidas. Status:", responses.map(r => r.status));
      const [gamesRes, enginesRes, genresRes, countsRes, popularRes] = responses;
      let gotGames = false, gotEngines = false, gotGenres = false;

      if (gamesRes.ok) { try { const d = await gamesRes.json(); setGames(d); gotGames = true; console.log("fetchData: Jogos ok."); } catch (e) { console.error("JSON Jogos:", e); } } else { console.error("Req Jogos:", gamesRes.status, await gamesRes.text()); }
      if (enginesRes.ok) { try { const d = await enginesRes.json(); setEngines(d); gotEngines = true; console.log("fetchData: Engines ok."); } catch (e) { console.error("JSON Engines:", e); } } else { console.error("Req Engines:", enginesRes.status, await enginesRes.text()); }
      if (genresRes.ok) { try { const d = await genresRes.json(); setGenres(d); gotGenres = true; console.log("fetchData: Gêneros ok."); } catch (e) { console.error("JSON Gêneros:", e); } } else { console.error("Req Gêneros:", genresRes.status, await genresRes.text()); }
      if (countsRes.ok) { try { const d = await countsRes.json(); setCounts(d); console.log("fetchData: Contagens ok."); } catch (e) { console.error("JSON Contagens:", e); } } else { console.error("Req Contagens:", countsRes.status, await countsRes.text()); }
      if (popularRes.ok) { try { const d = await popularRes.json(); setPopularGenre(d); console.log("fetchData: Populares ok."); } catch (e) { console.error("JSON Populares:", e); } } else { console.error("Req Populares:", popularRes.status, await popularRes.text()); }

      if(gotGames && gotEngines && gotGenres) { console.log("fetchData: Dados principais carregados."); }
      else { console.error("fetchData: Falha ao carregar dados principais!"); }

    } catch (error) { console.error("fetchData: Erro geral:", error); }
    finally { setIsLoadingData(false); console.log("fetchData: Finalizado."); }
  }, []);

  useEffect(() => { if (!authIsLoading) { fetchData(); } }, [fetchData, authIsLoading]);

  const handleDelete = useCallback(async (gameId: number) => { /* ... código sem alteração ... */ }, [fetchData, token, authIsLoading]);
  const handleLogout = () => { /* ... código sem alteração ... */ };
  const handleEditClick = (game: Game) => { setEditingGame(game); };
  const handleCloseModal = () => { setEditingGame(null); };
  const handleGameUpdated = () => { setEditingGame(null); fetchData(); };

  // --- Renderização ---
  return (
    <ProtectedRoute>
      <main className="container mx-auto p-8 bg-gray-900 min-h-screen text-white">
        {/* Botão Logout */}
        <div className="flex justify-end mb-4">
            <button onClick={handleLogout} className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">Logout</button>
        </div>
        <h1 className="text-4xl font-bold mb-6">GameDev Knowledge Graph</h1>

        {/* Seção Métricas (Simplificada) */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Estatísticas</h2>
          {isLoadingData ? (<p className="text-center">Carregando estatísticas...</p>) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="bg-gray-700 p-4 rounded">
                <p className="text-3xl font-bold">{counts?.games ?? '-'}</p>
                <p className="text-sm text-gray-400">Jogos Cadastrados</p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <p className="text-xl font-bold">{popularGenre?.genre ? popularGenre.genre.name : 'N/A'}</p>
                <p className="text-sm text-gray-400">Gênero Mais Popular ({popularGenre?.game_count ?? 0} jogos)</p>
              </div>
            </div>
          )}
        </div>

        {/* Seção Adicionar Jogo */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Adicionar Novo Jogo</h2>
          <GameForm onDataChanged={fetchData} engines={engines} genres={genres} />
        </div>

        {/* Seção Grafo */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Visualização em Grafo</h2>
            <div>
              <label htmlFor="genre-filter" className="text-sm mr-2">Filtrar por Gênero:</label>
              <select id="genre-filter" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                <option value="">Todos</option>
                {genres.map(genre => ( <option key={genre.id} value={genre.id}>{genre.name}</option> ))}
              </select>
            </div>
          </div>
          {isLoadingData ? ( <p className="text-center">Carregando grafo...</p> ) : (
            <GraphContainer games={games} engines={engines} genres={genres} filter={genreFilter} />
          )}
        </div>

        <hr className="border-gray-700 mb-8" />

        {/* Seção Lista de Jogos */}
        <h2 className="text-3xl font-bold mb-6">Lista de Jogos</h2>
        {isLoadingData ? (<p className="text-center">Carregando jogos...</p>) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <div key={game.id} className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{game.name}</h2>
                  <p className="text-gray-400">Lançamento: {game.release_year}</p>
                  {game.engine && <p className="text-sm text-blue-400">Engine: {game.engine.name}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {game.genres.map(genre => ( <span key={genre.id} className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{genre.name}</span> ))}
                  </div>
                </div>
                {token && (
                  <div className="flex justify-end gap-2 mt-4">
                     <button onClick={() => handleEditClick(game)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-sm">Editar</button>
                     <button onClick={() => handleDelete(game.id)} className="bg-red-600 hover:bg-red-700 font-bold py-1 px-3 rounded-md text-sm">Deletar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        {editingGame && token && (
          <EditGameModal
            game={editingGame}
            engines={engines}
            genres={genres}
            onClose={handleCloseModal}
            onSave={handleGameUpdated}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}