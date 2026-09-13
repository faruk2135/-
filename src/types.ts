export type CopyrightStatus = 'Public Domain' | 'Creative Commons' | 'CC0' | 'Licensed' | 'Unknown';

export interface ArchiveFile {
  name: string;
  source?: string;
  format?: string;
  original?: string;
  size?: string | number;
  length?: string | number;
  height?: string | number;
  width?: string | number;
  url?: string;
  title?: string;
}

export interface PlayableFile {
  name: string;
  format: 'mp4' | 'webm' | 'ogv';
  formatLabel: string;
  url: string;
  bytes: number;
  sizeFormatted: string;
  lengthSeconds?: number;
  isTrailer?: boolean;
  quality?: string;
}

export interface MovieMetadata {
  identifier: string;
  server?: string;
  dir?: string;
  files?: ArchiveFile[];
  metadata?: Record<string, any>;
  is_dark?: boolean | number;
}

export interface Movie {
  id: string;
  identifier: string;
  title: string;
  originalTitle: string;
  year: number | string;
  country: string;
  language: string;
  genres: string[];
  runtime: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  rating: string;
  views: number;
  sourceUrl: string;
  watchUrl: string;
  downloadUrl: string;
  license: string;
  licenseUrl: string;
  copyrightStatus: CopyrightStatus;
  rightsVerified: boolean;
  downloadAllowed: boolean;
  attributionRequired: boolean;
  director?: string;
  quality?: 'HD' | '4K' | 'FHD' | 'SD' | 'Archival Restored';
  format?: string;
  fileSize?: string;
  playableFiles?: PlayableFile[];
}

export interface WatchHistoryItem {
  movieId: string;
  position: number; // in seconds
  duration: number; // in seconds
  lastWatched: number; // timestamp
}

export type ActiveView = 
  | 'home' 
  | 'movies' 
  | 'genres' 
  | 'countries' 
  | 'languages' 
  | 'latest' 
  | 'popular' 
  | 'free-movies' 
  | 'my-list' 
  | 'search';

export interface FilterState {
  searchQuery: string;
  genre: string;
  country: string;
  language: string;
  yearRange: string;
  license: string;
  minRating: number;
  sortBy: 'popular' | 'latest' | 'oldest' | 'a-z' | 'rating';
}
