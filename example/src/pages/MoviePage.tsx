import React from 'react';
import { useParams } from 'react-router-dom';
import StreamPlayer from '../../../src/components/StreamPlayer/StreamPlayer';

const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Movie ID not provided</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back
          </button>
        </div>
        
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <StreamPlayer
            tmdbId={id}
            type="movie"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default MoviePage;