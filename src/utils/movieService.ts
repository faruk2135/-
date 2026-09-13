import { Movie, WatchHistoryItem, FilterState } from '../types';
import { SEED_MOVIES } from '../data/seedMovies';

const MY_LIST_KEY = 'cinevault_my_list';
const WATCH_HISTORY_KEY = 'cinevault_watch_history';

export class MovieService {
  private static cachedMovies: Movie[] = [...SEED_MOVIES];
  private static isLoaded = false;
  private static loadPromise: Promise<Movie[]> | null = null;

  public static async getAllMovies(): Promise<Movie[]> {
    if (this.isLoaded && this.cachedMovies.length > 50) {
      return this.cachedMovies;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const response = await fetch('/data/verified_movies.json');
        if (response.ok) {
          const data: Movie[] = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            this.cachedMovies = data;
            this.isLoaded = true;
            return data;
          }
        }
      } catch (err) {
        console.warn('Could not load local verified_movies.json, using seed movies:', err);
      }
      this.isLoaded = true;
      return this.cachedMovies;
    })();

    return this.loadPromise;
  }

  public static getInitialSyncMovies(): Movie[] {
    return this.cachedMovies;
  }

  // Get My List
  public static getMyList(): string[] {
    try {
      const saved = localStorage.getItem(MY_LIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static toggleMyList(movieId: string): boolean {
    const list = this.getMyList();
    const index = list.indexOf(movieId);
    let isAdded = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.unshift(movieId);
      isAdded = true;
    }
    try {
      localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return isAdded;
  }

  public static isInMyList(movieId: string): boolean {
    return this.getMyList().includes(movieId);
  }

  // Watch History
  public static getWatchHistory(): WatchHistoryItem[] {
    try {
      const saved = localStorage.getItem(WATCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public static updateWatchHistory(movieId: string, position: number, duration: number): void {
    const history = this.getWatchHistory().filter(h => h.movieId !== movieId);
    history.unshift({
      movieId,
      position: Math.round(position),
      duration: Math.round(duration || 1),
      lastWatched: Date.now()
    });
    // Keep top 30
    const trimmed = history.slice(0, 30);
    try {
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error(e);
    }
  }

  public static getWatchPosition(movieId: string): number {
    const item = this.getWatchHistory().find(h => h.movieId === movieId);
    return item ? item.position : 0;
  }

  public static clearWatchHistory(): void {
    localStorage.removeItem(WATCH_HISTORY_KEY);
  }

  // Dynamic live search query to Internet Archive if needed
  public static async searchInternetArchiveLive(query: string): Promise<Movie[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const cleanQ = query.trim().replace(/[^\w\s]/gi, '');
      const searchUrl = `https://archive.org/advancedsearch.php?q=collection:(feature_films+OR+silent_films)+AND+title:(${encodeURIComponent(cleanQ)})+AND+mediatype:(movies)&fl[]=identifier,title,year,description,subject,downloads,licenseurl,publicdate,language,creator&sort[]=downloads+desc&rows=25&output=json`;
      const res = await fetch(searchUrl);
      if (!res.ok) return [];
      const data = await res.json();
      const docs = data.response?.docs || [];

      return docs.map((doc: any) => {
        const title = String(doc.title || doc.identifier).replace(/\.(avi|mp4|mkv)$/i, '').trim();
        const year = doc.year || (doc.publicdate ? doc.publicdate.slice(0, 4) : 1950);
        return {
          id: `ia_${doc.identifier}`,
          identifier: doc.identifier,
          title,
          originalTitle: title,
          year,
          country: 'USA',
          language: doc.language || 'English',
          genres: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : [doc.subject || 'Classic'],
          runtime: '80 min',
          description: doc.description ? String(doc.description).replace(/<[^>]*>?/gm, '').slice(0, 280) : `Archival feature "${title}" on Internet Archive.`,
          posterUrl: `https://archive.org/services/img/${doc.identifier}`,
          backdropUrl: `https://archive.org/services/img/${doc.identifier}`,
          rating: '8.0',
          views: doc.downloads || 10000,
          sourceUrl: `https://archive.org/details/${doc.identifier}`,
          watchUrl: `https://archive.org/embed/${doc.identifier}`,
          downloadUrl: `https://archive.org/download/${doc.identifier}`,
          license: doc.licenseurl || 'Public Domain',
          licenseUrl: doc.licenseurl || 'https://creativecommons.org/publicdomain/mark/1.0/',
          copyrightStatus: 'Public Domain' as const,
          rightsVerified: true,
          downloadAllowed: true,
          attributionRequired: false,
          quality: 'HD' as const
        };
      });
    } catch (e) {
      console.error('Internet Archive live query failed:', e);
      return [];
    }
  }

  // Filter movies
  public static filterMovies(movies: Movie[], filters: FilterState): Movie[] {
    return movies.filter(m => {
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const match = 
          m.title.toLowerCase().includes(q) ||
          m.originalTitle.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q) ||
          m.language.toLowerCase().includes(q) ||
          m.genres.some(g => g.toLowerCase().includes(q)) ||
          String(m.year).includes(q) ||
          (m.director && m.director.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Genre
      if (filters.genre && filters.genre !== 'All') {
        if (!m.genres.some(g => g.toLowerCase() === filters.genre.toLowerCase())) {
          return false;
        }
      }

      // Country
      if (filters.country && filters.country !== 'All') {
        if (m.country.toLowerCase() !== filters.country.toLowerCase()) {
          return false;
        }
      }

      // Language
      if (filters.language && filters.language !== 'All') {
        if (!m.language.toLowerCase().includes(filters.language.toLowerCase())) {
          return false;
        }
      }

      // Year range
      if (filters.yearRange && filters.yearRange !== 'All') {
        const y = Number(m.year);
        if (filters.yearRange === 'pre-1930' && (isNaN(y) || y >= 1930)) return false;
        if (filters.yearRange === '1930s' && (y < 1930 || y > 1939)) return false;
        if (filters.yearRange === '1940s' && (y < 1940 || y > 1949)) return false;
        if (filters.yearRange === '1950s' && (y < 1950 || y > 1959)) return false;
        if (filters.yearRange === '1960s+' && y < 1960) return false;
      }

      // License / Copyright
      if (filters.license && filters.license !== 'All') {
        if (filters.license === 'Public Domain' && m.copyrightStatus !== 'Public Domain') return false;
        if (filters.license === 'Creative Commons' && m.copyrightStatus !== 'Creative Commons' && m.copyrightStatus !== 'CC0') return false;
        if (filters.license === 'CC0' && m.copyrightStatus !== 'CC0') return false;
      }

      // Min Rating
      if (filters.minRating > 0) {
        if (parseFloat(m.rating) < filters.minRating) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'popular') {
        return b.views - a.views;
      }
      if (filters.sortBy === 'latest') {
        return Number(b.year) - Number(a.year);
      }
      if (filters.sortBy === 'oldest') {
        return Number(a.year) - Number(b.year);
      }
      if (filters.sortBy === 'rating') {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      if (filters.sortBy === 'a-z') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }
}
