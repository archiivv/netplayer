const API_SERVER = "https://mbp.pirxcy.dev";
const TMDB_API_KEY = "1070730380f5fee0d87cf0382670b255";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface StreamSource {
  path: string;
  real_quality: string;
  quality: string;
}

export interface StreamData {
  list: StreamSource[];
}

export interface MediaDetails {
  id: string;
  title: string;
  year: string;
  tmdb_id: number;
  type: 'movie' | 'tv';
}

export interface TMDBMovieResult {
  id: number;
  title: string;
  release_date: string;
  poster_path?: string;
  overview?: string;
}

export interface TMDBTVResult {
  id: number;
  name: string;
  first_air_date: string;
  poster_path?: string;
  overview?: string;
}

export class StreamingService {
  private async fetchTMDBData(tmdbId: string, type: 'movie' | 'tv'): Promise<{ title: string; year: string }> {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch TMDB data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (type === 'movie') {
      return {
        title: data.title,
        year: new Date(data.release_date).getFullYear().toString()
      };
    } else {
      return {
        title: data.name,
        year: new Date(data.first_air_date).getFullYear().toString()
      };
    }
  }

  private async searchMedia(title: string, type: 'movie' | 'tv', year: string): Promise<any[]> {
    const searchUrl = `${API_SERVER}/search?q=${encodeURIComponent(title)}&type=${type}&year=${year}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  }

  private async getMediaDetails(type: 'movie' | 'tv', id: string): Promise<any> {
    const detailUrl = `${API_SERVER}/details/${type}/${id}`;
    const response = await fetch(detailUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to get media details: ${response.status}`);
    }
    
    return response.json();
  }

  private async findMediaByTMDBId(title: string, type: 'movie' | 'tv', year: string, tmdbId: string): Promise<string> {
    const searchResults = await this.searchMedia(title, type, year);
    
    if (searchResults.length === 0) {
      throw new Error("No results found in search.");
    }

    for (const result of searchResults) {
      try {
        const detailData = await this.getMediaDetails(type, result.id);
        if (detailData.data && detailData.data.tmdb_id.toString() === tmdbId) {
          return result.id;
        }
      } catch (error) {
        // Continue to next result if detail fetch fails
        continue;
      }
    }

    throw new Error("Could not find a matching media item for the given TMDB ID.");
  }

  private async getStreamData(type: 'movie' | 'tv', mediaId: string, season?: string, episode?: string): Promise<StreamData> {
    let streamUrlPath = type === 'movie' 
      ? `/movie/${mediaId}` 
      : `/tv/${mediaId}/${season}/${episode}`;
    
    const response = await fetch(`${API_SERVER}${streamUrlPath}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get streams: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  }

  private selectBestStream(streams: StreamSource[]): StreamSource {
    // Filter for MP4 streams
    const mp4Streams = streams.filter(s => s.path && new URL(s.path).pathname.endsWith('.mp4'));
    
    if (mp4Streams.length === 0) {
      throw new Error("No playable MP4 streams found.");
    }

    // Quality preference order
    const qualityOrder = ['4K', '1080p', '720p', 'HDTV', '480p', '360p'];
    
    for (const quality of qualityOrder) {
      const stream = mp4Streams.find(s => s.real_quality === quality);
      if (stream) return stream;
    }
    
    // Fallback to first available stream
    return mp4Streams[0];
  }

  public async getMovieStream(tmdbId: string): Promise<{ source: string; title: string; year: string }> {
    // Get movie details from TMDB
    const { title, year } = await this.fetchTMDBData(tmdbId, 'movie');
    
    // Find the internal media ID
    const mediaId = await this.findMediaByTMDBId(title, 'movie', year, tmdbId);
    
    // Get stream data
    const streamData = await this.getStreamData('movie', mediaId);
    
    // Select best quality stream
    const bestStream = this.selectBestStream(streamData.list);
    
    return {
      source: bestStream.path,
      title,
      year
    };
  }

  public async getTVStream(tmdbId: string, season: string, episode: string): Promise<{ source: string; title: string; year: string }> {
    // Get TV show details from TMDB
    const { title, year } = await this.fetchTMDBData(tmdbId, 'tv');
    
    // Find the internal media ID
    const mediaId = await this.findMediaByTMDBId(title, 'tv', year, tmdbId);
    
    // Get stream data
    const streamData = await this.getStreamData('tv', mediaId, season, episode);
    
    // Select best quality stream
    const bestStream = this.selectBestStream(streamData.list);
    
    return {
      source: bestStream.path,
      title: `${title} S${season}E${episode}`,
      year
    };
  }

  public async getAllStreams(type: 'movie' | 'tv', tmdbId: string, season?: string, episode?: string): Promise<StreamSource[]> {
    // Get media details from TMDB
    const { title, year } = await this.fetchTMDBData(tmdbId, type);
    
    // Find the internal media ID
    const mediaId = await this.findMediaByTMDBId(title, type, year, tmdbId);
    
    // Get stream data
    const streamData = await this.getStreamData(type, mediaId, season, episode);
    
    return streamData.list;
  }
}

export const streamingService = new StreamingService();