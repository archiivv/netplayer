import React, { useState, useEffect } from 'react';
import NetPlayer from '../..';
import { streamingService } from '../../services/streamingService';
import { Source } from '../../types';

interface StreamPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: string;
  episode?: string;
  className?: string;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({
  tmdbId,
  type,
  season,
  episode,
  className = ''
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    const loadStream = async () => {
      try {
        setLoading(true);
        setError(null);

        if (type === 'movie') {
          const { source, title: movieTitle } = await streamingService.getMovieStream(tmdbId);
          setSources([{ file: source, label: 'Auto' }]);
          setTitle(movieTitle);
        } else if (type === 'tv' && season && episode) {
          const { source, title: tvTitle } = await streamingService.getTVStream(tmdbId, season, episode);
          setSources([{ file: source, label: 'Auto' }]);
          setTitle(tvTitle);
        } else {
          throw new Error('Invalid parameters for TV show');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stream');
      } finally {
        setLoading(false);
      }
    };

    loadStream();
  }, [tmdbId, type, season, episode]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-black ${className}`}>
        <div className="text-white text-lg">Loading stream...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-black ${className}`}>
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-black ${className}`}>
        <div className="text-white text-lg">No streams available</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="text-white text-xl font-bold mb-4 text-center">{title}</h2>
      )}
      <NetPlayer
        sources={sources}
        autoPlay
        className="w-full h-full"
      />
    </div>
  );
};

export default StreamPlayer;