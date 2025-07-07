import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tmdbId, setTmdbId] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tmdbId) {
      alert('Please enter a TMDB ID');
      return;
    }

    if (mediaType === 'movie') {
      navigate(`/movie/${tmdbId}`);
    } else {
      if (!season || !episode) {
        alert('Please enter season and episode numbers for TV shows');
        return;
      }
      navigate(`/tv/${tmdbId}/${season}/${episode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          NetPlayer Stream Demo
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                TMDB ID
              </label>
              <input
                type="text"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                placeholder="e.g., 329 for Jurassic Park"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Media Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
              </select>
            </div>

            {mediaType === 'tv' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Season
                  </label>
                  <input
                    type="number"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Episode
                  </label>
                  <input
                    type="number"
                    value={episode}
                    onChange={(e) => setEpisode(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Watch Now
            </button>
          </form>

          <div className="mt-8 text-gray-400 text-sm">
            <h3 className="font-medium text-white mb-2">Example TMDB IDs:</h3>
            <ul className="space-y-1">
              <li>• Movies: 329 (Jurassic Park), 550 (Fight Club), 13 (Forrest Gump)</li>
              <li>• TV Shows: 1399 (Game of Thrones), 1396 (Breaking Bad), 60735 (The Flash)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;