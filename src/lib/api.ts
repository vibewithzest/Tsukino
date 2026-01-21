// API Service for Tsukino - Uses AnimeKai provider from Consumet API
// Complete implementation of all AnimeKai endpoints

// Use environment variable, or fallback to public Consumet API for production
const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://consumet-api-two-nu.vercel.app';
const PROVIDER = 'animekai';

// ===========================================
// TYPES
// ===========================================

export interface AnimeResult {
  id: string;
  title: string;
  image: string;
  url?: string;
  type?: string;
  releaseDate?: string;
  subOrDub?: string;
  episodeCount?: number;
  episodes?: number;
}

export interface SpotlightResult {
  id: string;
  title: string;
  image: string;
  banner?: string;
  cover?: string;
  description?: string;
  type?: string;
  releaseDate?: string;
  episodes?: number;
  japaneseTitle?: string;
}

export interface AnimeInfo {
  id: string;
  title: string;
  image: string;
  cover?: string;
  description?: string;
  type?: string;
  releaseDate?: string;
  status?: string;
  genres?: string[];
  totalEpisodes?: number;
  episodes?: Episode[];
  duration?: string;
  rating?: number;
  studios?: string[];
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
  url?: string;
}

export interface EpisodeSource {
  sources: VideoSource[];
  subtitles?: Subtitle[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  headers?: Record<string, string>;
}

export interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface Subtitle {
  url: string;
  lang: string;
}

export interface EpisodeServer {
  name: string;
  url: string;
}

export interface SearchResult {
  currentPage: number;
  hasNextPage: boolean;
  totalPages?: number;
  totalResults?: number;
  results: AnimeResult[];
}

export interface ScheduleResult {
  date: string;
  results: AnimeResult[];
}

// ===========================================
// CORE FETCH FUNCTION
// ===========================================

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}/anime/${PROVIDER}${endpoint}`;
  console.log('[API] Fetching:', url);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API] Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// ===========================================
// HOMEPAGE / DISCOVERY ENDPOINTS
// ===========================================

/**
 * GET /anime/animekai/spotlight
 * Featured anime for hero carousel
 */
export async function getSpotlight(): Promise<SpotlightResult[]> {
  const data = await fetchAPI<{ results?: SpotlightResult[] } | SpotlightResult[]>('/spotlight');
  return Array.isArray(data) ? data : (data.results || []);
}

/**
 * GET /anime/animekai/new-releases
 * New anime releases
 */
export async function getNewReleases(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/new-releases?page=${page}`);
}

/**
 * GET /anime/animekai/recent-episodes
 * Recently updated episodes
 */
export async function getRecentEpisodes(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/recent-episodes?page=${page}`);
}

/**
 * GET /anime/animekai/recent-added
 * Recently added anime
 */
export async function getRecentlyAdded(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/recent-added?page=${page}`);
}

/**
 * GET /anime/animekai/latest-completed
 * Recently completed anime
 */
export async function getLatestCompleted(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/latest-completed?page=${page}`);
}

// ===========================================
// ANIME INFO & EPISODES
// ===========================================

/**
 * GET /anime/animekai/info?id=<animeId>
 * Get anime details and episode list
 */
export async function getAnimeInfo(id: string): Promise<AnimeInfo> {
  return fetchAPI<AnimeInfo>(`/info?id=${encodeURIComponent(id)}`);
}

/**
 * GET /anime/animekai/watch/<episodeId>
 * Get video sources for an episode
 * @param episodeId - The episode ID (will be URL encoded)
 * @param dub - Whether to get dubbed version
 */
export async function getEpisodeSources(episodeId: string, dub = false): Promise<EpisodeSource> {
  // Episode IDs from AnimeKai contain special characters like $ that need encoding
  const encodedId = encodeURIComponent(episodeId);
  return fetchAPI<EpisodeSource>(`/watch/${encodedId}?dub=${dub}`);
}

/**
 * GET /anime/animekai/servers/<episodeId>
 * Get available servers for an episode
 */
export async function getEpisodeServers(episodeId: string, dub = false): Promise<EpisodeServer[]> {
  const encodedId = encodeURIComponent(episodeId);
  const data = await fetchAPI<{ sub?: EpisodeServer[]; dub?: EpisodeServer[] }>(`/servers/${encodedId}?dub=${dub}`);
  return dub ? (data.dub || []) : (data.sub || []);
}

// ===========================================
// SEARCH ENDPOINTS
// ===========================================

/**
 * GET /anime/animekai/<query>
 * Search anime by title
 */
export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/${encodeURIComponent(query)}?page=${page}`);
}

/**
 * GET /anime/animekai/search-suggestions/<query>
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query: string): Promise<AnimeResult[]> {
  const data = await fetchAPI<{ results?: AnimeResult[] } | AnimeResult[]>(
    `/search-suggestions/${encodeURIComponent(query)}`
  );
  return Array.isArray(data) ? data : (data.results || []);
}

// ===========================================
// GENRE ENDPOINTS
// ===========================================

/**
 * GET /anime/animekai/genre/list
 * Get list of all available genres
 */
export async function getGenres(): Promise<string[]> {
  return fetchAPI<string[]>('/genre/list');
}

/**
 * GET /anime/animekai/genre/<genreName>
 * Get anime by genre
 */
export async function getByGenre(genre: string, page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/genre/${encodeURIComponent(genre)}?page=${page}`);
}

// ===========================================
// TYPE FILTER ENDPOINTS
// ===========================================

/**
 * GET /anime/animekai/tv
 * Get TV series
 */
export async function getTV(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/tv?page=${page}`);
}

/**
 * GET /anime/animekai/movies
 * Get anime movies
 */
export async function getMovies(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/movies?page=${page}`);
}

/**
 * GET /anime/animekai/ova
 * Get OVA anime
 */
export async function getOVA(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/ova?page=${page}`);
}

/**
 * GET /anime/animekai/ona
 * Get ONA anime
 */
export async function getONA(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/ona?page=${page}`);
}

/**
 * GET /anime/animekai/specials
 * Get special episodes
 */
export async function getSpecials(page = 1): Promise<SearchResult> {
  return fetchAPI<SearchResult>(`/specials?page=${page}`);
}

// ===========================================
// SCHEDULE ENDPOINT
// ===========================================

/**
 * GET /anime/animekai/schedule/<date>
 * Get anime schedule for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getSchedule(date: string): Promise<AnimeResult[]> {
  const data = await fetchAPI<{ results?: AnimeResult[] } | AnimeResult[]>(`/schedule/${date}`);
  return Array.isArray(data) ? data : (data.results || []);
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get today's schedule
 */
export async function getTodaySchedule(): Promise<AnimeResult[]> {
  const today = new Date().toISOString().split('T')[0];
  return getSchedule(today);
}

/**
 * Get all content for homepage in parallel
 */
export async function getHomepageData() {
  const [spotlight, newReleases, recentEpisodes, recentlyAdded] = await Promise.all([
    getSpotlight().catch(() => []),
    getNewReleases().catch(() => ({ results: [], currentPage: 1, hasNextPage: false })),
    getRecentEpisodes().catch(() => ({ results: [], currentPage: 1, hasNextPage: false })),
    getRecentlyAdded().catch(() => ({ results: [], currentPage: 1, hasNextPage: false })),
  ]);

  return {
    spotlight,
    newReleases: newReleases.results,
    recentEpisodes: recentEpisodes.results,
    recentlyAdded: recentlyAdded.results,
  };
}

// ===========================================
// ENDPOINT REFERENCE
// ===========================================
/*
All AnimeKai Provider Endpoints:

Discovery:
  GET /anime/animekai/spotlight          - Hero spotlight anime
  GET /anime/animekai/new-releases       - New releases
  GET /anime/animekai/recent-episodes    - Recently updated
  GET /anime/animekai/recent-added       - Recently added
  GET /anime/animekai/latest-completed   - Completed anime

Details:
  GET /anime/animekai/info?id=<id>       - Anime info + episodes
  GET /anime/animekai/watch/<episodeId>  - Video sources
  GET /anime/animekai/servers/<episodeId> - Server list

Search:
  GET /anime/animekai/<query>            - Search by title
  GET /anime/animekai/search-suggestions/<query> - Autocomplete

Genres:
  GET /anime/animekai/genre/list         - All genres
  GET /anime/animekai/genre/<name>       - By genre

Types:
  GET /anime/animekai/tv                 - TV series
  GET /anime/animekai/movies             - Movies
  GET /anime/animekai/ova                - OVAs
  GET /anime/animekai/ona                - ONAs
  GET /anime/animekai/specials           - Specials

Schedule:
  GET /anime/animekai/schedule/<date>    - By date (YYYY-MM-DD)
*/
