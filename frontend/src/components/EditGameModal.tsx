// Em: frontend/src/components/EditGameModal.tsx (Refatorado com shadcn/ui Dialog)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
// [NOVO] Importa os componentes do Dialog do shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Opcional, podemos usar se quisermos
  DialogFooter,
  DialogClose, // Para botões que fecham o dialog
} from "@/components/ui/dialog";
// Importa componentes shadcn/ui que o formulário pode usar (opcional, mas bom)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Para os gêneros
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Para o dropdown de engine


// Interfaces (sem alteração)
interface Engine { id: number; name: string; }
interface Game { id: number; name: string; release_year: number; engine?: Engine; genres: Genre[]; }
interface Genre { id: number; name: string; }

interface EditGameModalProps {
  game: Game | null; // Pode ser null quando não estiver aberto
  engines: Engine[];
  genres: Genre[];
  onClose: () => void;
  onSave: () => void;
}

export default function EditGameModal({ game, engines, genres, onClose, onSave }: EditGameModalProps) {
  // Estados locais para o formulário
  const [name, setName] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [engineId, setEngineId] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(new Set<number>());
  const [isSaving, setIsSaving] = useState(false);
  const { token, isLoading: authIsLoading } = useAuth();

  // Efeito para preencher o formulário quando o 'game' (prop) muda
  useEffect(() => {
    if (game) {
      setName(game.name);
      setReleaseYear(game.release_year.toString());
      setEngineId(game.engine?.id?.toString() ?? '');
      setSelectedGenres(new Set(game.genres.map(g => g.id)));
    } else {
      // Limpa o form se o modal for fechado (game se torna null)
      setName(''); setReleaseYear(''); setEngineId(''); setSelectedGenres(new Set());
    }
  }, [game]); // Depende do 'game' que vem das props

  const handleGenreChange = (genreId: number) => { /* ... sem alteração ... */ };
  const handleSave = async (event: React.FormEvent) => { /* ... sem alteração, mas usaremos Button type="submit" ... */ };

  // --- Funções handleGenreChange e handleSave (sem alteração na lógica interna) ---
  const fullHandleGenreChange = (genreId: number) => {
    const newSelection = new Set(selectedGenres);
    if (newSelection.has(genreId)) { newSelection.delete(genreId); }
    else { newSelection.add(genreId); }
    setSelectedGenres(newSelection);
  };

  const fullHandleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedGenres.size === 0) { toast.error('Selecione pelo menos um gênero.'); return; }
    if (authIsLoading || !token) { toast.error("Você precisa estar logado para editar."); return; }
    setIsSaving(true);
    const updatedGameData = { name, release_year: parseInt(releaseYear), engine_id: engineId ? parseInt(engineId) : null, genre_ids: Array.from(selectedGenres) };
    try {
      const response = await fetch(`http://127.0.0.1:8000/games/${game?.id}`, { // Usa game?.id
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updatedGameData),
      });
      if (!response.ok) {
        if (response.status === 401) { throw new Error('Sessão inválida.'); }
        const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || 'Falha ao atualizar.');
      }
      toast.success('Jogo atualizado!');
      onSave(); // Fecha modal e atualiza lista
    } catch (err: any) { toast.error(`Erro: ${err.message}`); console.error(err); }
    finally { setIsSaving(false); }
  };
  // --------------------------------------------------------------------------

  // Se não houver jogo selecionado, não renderiza nada (o Dialog controla a abertura)
  if (!game) {
    return null;
  }

  // A visibilidade é controlada pela prop 'open' do Dialog
  // A função 'onOpenChange' lida com o fechamento (clicar fora, ESC, botão fechar)
  return (
    <Dialog open={!!game} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Jogo: {game.name}</DialogTitle>
          {/* <DialogDescription>Faça as alterações necessárias aqui.</DialogDescription> */}
        </DialogHeader>
        <form onSubmit={fullHandleSave} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name" className="text-right">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSaving} className="col-span-3 bg-gray-700 border-gray-600"/>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-year" className="text-right">Ano</Label>
            <Input id="edit-year" type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} required disabled={isSaving} className="col-span-3 bg-gray-700 border-gray-600"/>
          </div>
          <div className="grid gap-2">
             <Label htmlFor="edit-engine" className="text-right">Engine</Label>
             {/* Usando o Select do shadcn/ui */}
             <Select value={engineId} onValueChange={setEngineId} disabled={isSaving}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Nenhuma / Desconhecida" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    <SelectItem value="" className="text-gray-400">Nenhuma / Desconhecida</SelectItem>
                    {engines.map((engine) => (
                        <SelectItem key={engine.id} value={engine.id.toString()}>{engine.name}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-right pt-2">Gêneros</Label>
            <div className="col-span-3 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md p-2 grid grid-cols-2">
              {genres.map((genre) => (
                <div key={genre.id} className="flex items-center space-x-2 p-1">
                  {/* Usando o Checkbox do shadcn/ui */}
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={selectedGenres.has(genre.id)}
                    onCheckedChange={() => fullHandleGenreChange(genre.id)}
                    disabled={isSaving}
                    className="border-gray-500 data-[state=checked]:bg-purple-600"
                  />
                  <label htmlFor={`genre-${genre.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
             {/* Botão Cancelar usando DialogClose */}
             <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSaving}>Cancelar</Button>
             </DialogClose>
             {/* Botão Salvar */}
             <Button type="submit" disabled={isSaving || authIsLoading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50">
               {isSaving ? 'Salvando...' : 'Salvar Alterações'}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}