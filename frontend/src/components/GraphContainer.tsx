'use client';

import { useState, useCallback, useRef } from 'react'; // Importa o useRef
import GameGraph, { NodeData } from '@/components/GameGraph';
import DetailsPanel, { DetailsData } from '@/components/DetailsPanel';
import cytoscape from 'cytoscape'; // Importa o tipo do cytoscape

interface Engine { id: number; name: string; }
interface Game { id: number; name: string; release_year: number; engine?: Engine; genres: Genre[]; }
interface Genre { id: number; name: string; }

interface GraphContainerProps {
  games: Game[];
  engines: Engine[];
  genres: Genre[];
  filter: string;
}

export default function GraphContainer({ games, engines, genres, filter }: GraphContainerProps) {
  const [selectedData, setSelectedData] = useState<DetailsData>(null);
  // Guarda a referência da instância do Cytoscape
  const cyRef = useRef<cytoscape.Core | null>(null);

  const handleNodeClick = useCallback((nodeData: NodeData) => {
    const [type, idStr] = nodeData.id.split('-');
    const id = parseInt(idStr);

    if (type === 'game') {
      const game = games.find(g => g.id === id);
      if (game) setSelectedData({ ...game, type: 'game' });
    } else if (type === 'engine') {
      const engine = engines.find(e => e.id === id);
      if (engine) setSelectedData({ ...engine, type: 'engine' });
    } else if (type === 'genre') {
      const genre = genres.find(g => g.id === id);
      if (genre) setSelectedData({ ...genre, type: 'genre' });
    }
    
    // [NOVO] Lógica do Zoom
    if (cyRef.current) {
      const node = cyRef.current.getElementById(nodeData.id);
      cyRef.current.animate({
        fit: {
          eles: node, // Foca no nó clicado
          padding: 100 // Deixa um espaço ao redor
        },
        duration: 500, // Duração da animação em ms
        easing: 'ease-in-out-sine'
      });
    }
  }, [games, engines, genres]);

  const handleClosePanel = () => {
    setSelectedData(null);
  };

  return (
    <div className="relative">
      <GameGraph
        games={games}
        engines={engines}
        genres={genres}
        onNodeClick={handleNodeClick}
        filter={filter}
        // Passa a função para o GameGraph guardar a referência
        cyRef={(cy) => { cyRef.current = cy; }}
      />
      <DetailsPanel data={selectedData} onClose={handleClosePanel} />
    </div>
  );
}