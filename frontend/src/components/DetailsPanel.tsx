'use client';

interface BaseData {
  id: number;
  name: string;
}
interface GameData extends BaseData {
  release_year: number;
  engine?: BaseData;
  genres: BaseData[];
  type: 'game';
}
interface EngineData extends BaseData {
  type: 'engine';
}
interface GenreData extends BaseData {
  type: 'genre';
}

export type DetailsData = GameData | EngineData | GenreData | null;

interface DetailsPanelProps {
  data: DetailsData;
  onClose: () => void;
}

export default function DetailsPanel({ data, onClose }: DetailsPanelProps) {
  const isVisible = data !== null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-gray-800 text-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Detalhes</h2>
        <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl">&times;</button>
      </div>

      {data && (
        <div>
          <p className="mb-2"><span className="font-semibold">Nome:</span> {data.name}</p>
          <p className="mb-2"><span className="font-semibold">ID no Banco:</span> {data.id}</p>
          
          {data.type === 'game' && (
            <>
              <p className="mb-2"><span className="font-semibold">Ano:</span> {data.release_year}</p>
              {data.engine && (
                <p className="mb-2"><span className="font-semibold">Engine:</span> {data.engine.name}</p>
              )}
              <div>
                <span className="font-semibold">Gêneros:</span>
                <ul className="list-disc list-inside pl-2">
                  {data.genres.map(genre => (
                    <li key={genre.id}>{genre.name}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {data.type === 'engine' && (
             <p className="mb-2"><span className="font-semibold">Tipo:</span> Game Engine</p>
          )}
          {data.type === 'genre' && (
             <p className="mb-2"><span className="font-semibold">Tipo:</span> Gênero</p>
          )}
        </div>
      )}
    </div>
  );
}