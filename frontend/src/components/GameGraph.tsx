'use client';

import { memo, useMemo, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape'; // Stylesheet type was removed from here

// --- Interfaces ---
interface Engine { id: number; name: string; }
interface Game { id: number; name: string; engine?: Engine; genres: Genre[]; }
interface Genre { id: number; name: string; }
export interface NodeData { id: string; label: string; }

interface GameGraphProps {
  games: Game[];
  engines: Engine[];
  genres: Genre[];
  onNodeClick: (nodeData: NodeData) => void;
  filter: string;
  cyRef: (cy: cytoscape.Core | null) => void;
}

const GameGraph = ({ games, engines, genres, onNodeClick, filter, cyRef: parentCyRef }: GameGraphProps) => {
  const internalCyRef = useRef<cytoscape.Core | null>(null);
  console.log("GameGraph Render - Start");

  const elements = useMemo(() => {
    console.log("GameGraph useMemo - Calculando elements...");
    const filterId = filter ? parseInt(filter) : null;
    let nodesAndEdges: cytoscape.ElementDefinition[] = [];
    if (!filterId) {
      // --- Lógica sem filtro (mostrar tudo) ---
      const gameNodes = games.map((game) => ({ data: { id: `game-${game.id}`, label: game.name }, classes: 'game-node' }));
      const engineNodes = engines.map((engine) => ({ data: { id: `engine-${engine.id}`, label: engine.name }, classes: 'engine-node' }));
      const genreNodes = genres.map((genre) => ({ data: { id: `genre-${genre.id}`, label: genre.name }, classes: 'genre-node' }));
      const engineEdges = games.filter(g => g.engine).map(g => ({ data: { id: `edge-eng-${g.id}-${g.engine!.id}`, source: `game-${g.id}`, target: `engine-${g.engine!.id}` } }));
      const genreEdges = games.flatMap(game => game.genres.map(genre => ({ data: { id: `edge-gen-${game.id}-${genre.id}`, source: `game-${game.id}`, target: `genre-${genre.id}` } })));
      nodesAndEdges = [...gameNodes, ...engineNodes, ...genreNodes, ...engineEdges, ...genreEdges];
    } else {
      // --- Lógica COM filtro (Corrigida) ---
      const selectedGenre = genres.find(e => e.id === filterId);
      const filteredGames = games.filter(g => g.genres.some(genre => genre.id === filterId));
      const usedEngineIds = new Set(filteredGames.map(g => g.engine?.id).filter(Boolean));
      const filteredEngines = engines.filter(e => usedEngineIds.has(e.id));
      const gameNodes = filteredGames.map((game) => ({ data: { id: `game-${game.id}`, label: game.name }, classes: 'game-node' }));
      const genreNode = selectedGenre ? [{ data: { id: `genre-${selectedGenre.id}`, label: selectedGenre.name }, classes: 'genre-node' }] : [];
      const engineNodes = filteredEngines.map((engine) => ({ data: { id: `engine-${engine.id}`, label: engine.name }, classes: 'engine-node' }));
      const genreEdges = filteredGames.flatMap(game => game.genres.filter(g => g.id === filterId).map(genre => ({ data: { id: `edge-gen-${game.id}-${genre.id}`, source: `game-${game.id}`, target: `genre-${genre.id}` } })));
      const engineEdges = filteredGames.filter(g => g.engine).map(g => ({ data: { id: `edge-eng-${g.id}-${g.engine!.id}`, source: `game-${g.id}`, target: `engine-${g.engine!.id}` } }));
      nodesAndEdges = [...gameNodes, ...genreNode, ...engineNodes, ...genreEdges, ...engineEdges];
    }
    console.log(`GameGraph useMemo - Elements calculados: ${nodesAndEdges.length}`);
    return nodesAndEdges;
  }, [games, engines, genres, filter]);

  useEffect(() => {
    const cy = internalCyRef.current;
    console.log("GameGraph useEffect - Start. cy existe?", !!cy);

    if (cy) {
      console.log("GameGraph useEffect - cy existe. Rodando layout e adicionando listeners.");
      cy.layout({ name: 'cose', animate: false, padding: 30 }).run();
      console.log("GameGraph useEffect - Layout executado.");

      const handleTap = (event: cytoscape.EventObject) => {
        if (!internalCyRef.current) { console.warn("GameGraph handleTap - Instância cy é null. Abortando."); return; }
        console.log("GameGraph handleTap - Nó clicado:", event.target.data());
        onNodeClick(event.target.data());
      };

      cy.on('tap', 'node', handleTap);
      console.log("GameGraph useEffect - Listener 'tap' adicionado.");

      return () => {
        console.log("GameGraph useEffect - Limpeza executando...");
        if (internalCyRef.current) {
             console.log("GameGraph useEffect - Limpeza: Removendo listener 'tap'.");
             internalCyRef.current.removeListener('tap', 'node', handleTap);
        } else { console.warn("GameGraph useEffect - Limpeza: Instância cy já era null."); }
        console.log("GameGraph useEffect - Limpeza finalizada.");
      };
    } else { console.log("GameGraph useEffect - cy é null, listeners não adicionados."); }
  }, [elements, onNodeClick]);

  // Stylesheet sem a anotação de tipo explícita
  const stylesheet = [
    { selector: 'node', style: { label: 'data(label)', color: '#fff', textValign: 'center', fontSize: '10px' } },
    { selector: '.game-node', style: { backgroundColor: '#4299E1' } }, // Azul para jogos
    { selector: '.engine-node', style: { backgroundColor: '#48BB78', shape: 'rectangle' as const } }, // Verde para engines
    { selector: '.genre-node', style: { backgroundColor: '#9F7AEA', shape: 'diamond' as const } }, // Roxo para gêneros (cor ajustada)
    { selector: 'edge', style: { width: 1, lineColor: '#4A5568', targetArrowColor: '#4A5568', targetArrowShape: 'triangle' as const, curveStyle: 'bezier' as const } },
  ];

  console.log("GameGraph Render - Renderizando CytoscapeComponent...");
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '500px', backgroundColor: '#2d3748' }}
        stylesheet={stylesheet}
        cy={(cyInstance) => {
          console.log("CytoscapeComponent cy prop callback - cyInstance existe?", !!cyInstance);
          internalCyRef.current = cyInstance;
          parentCyRef(cyInstance); // Chama a prop do pai
          console.log("CytoscapeComponent cy prop callback - Refs atualizadas.");
        }}
      />
    </div>
  );
};

export default memo(GameGraph);