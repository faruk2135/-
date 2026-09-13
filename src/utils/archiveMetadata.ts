import { ArchiveFile, MovieMetadata, PlayableFile, CopyrightStatus } from '../types';

// In-memory cache to avoid duplicate network requests for the same movie
const metadataCache = new Map<string, MovieMetadata>();

/**
 * Fetch real metadata from the official Internet Archive metadata API
 * https://archive.org/metadata/{identifier}
 */
export async function fetchMovieMetadata(identifier: string): Promise<MovieMetadata | null> {
  if (!identifier) return null;

  // Clean identifier
  const cleanId = identifier.trim();

  // Return cached result if available
  if (metadataCache.has(cleanId)) {
    return metadataCache.get(cleanId)!;
  }

  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(cleanId)}`);
    if (!response.ok) {
      console.warn(`[CineVault] Metadata request returned ${response.status} for identifier: ${cleanId}`);
      return null;
    }

    const data: MovieMetadata = await response.json();
    if (!data || data.is_dark) {
      console.warn(`[CineVault] Item ${cleanId} is dark-archived or has empty metadata`);
      return null;
    }

    metadataCache.set(cleanId, data);
    return data;
  } catch (err) {
    console.error(`[CineVault] Failed to fetch metadata for ${cleanId}:`, err);
    return null;
  }
}

/**
 * Format bytes to readable string (e.g. 540 MB, 1.4 GB)
 */
export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Archival File';
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
  return Math.round(bytes / 1048576) + ' MB';
}

/**
 * Construct verified file URL according to Internet Archive standard:
 * Use file.url if provided, otherwise:
 * https://archive.org/download/{identifier}/{encoded filename}
 * Never use ca.archive.org or guessed server hosts.
 */
export function constructArchiveFileUrl(identifier: string, fileName: string, fileUrl?: string): string {
  if (fileUrl && fileUrl.startsWith('http')) {
    return fileUrl;
  }
  return `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;
}

/**
 * File selection algorithm as mandated by requirements:
 * 1. Read metadata.files
 * 2. Remove: thumbnails, previews, torrent files, metadata XML, images, audio-only files
 * 3. Keep: mp4, webm, ogv
 * 4. Prefer video formats supported by modern browsers (MP4 > WebM > OGV)
 * 5. Prefer reasonable file size (avoiding truncated files or multi-gigabyte uncompressed raw dumps when web derivative is available)
 * 6. Return the actual file URL
 */
export function getPlayableFiles(metadata: MovieMetadata): PlayableFile[] {
  if (!metadata || !metadata.files || !Array.isArray(metadata.files)) {
    return [];
  }

  const identifier = metadata.identifier;
  const validExtensions = ['.mp4', '.webm', '.ogv'];

  // Identify trailers/previews to exclude them from the main movie playback list
  const isTrailerOrSample = (name: string, title?: string) => {
    const s = `${name} ${title || ''}`.toLowerCase();
    return s.includes('trailer') || s.includes('preview') || s.includes('sample_') || s.includes('_sample');
  };

  const rawPlayable = metadata.files.filter((file: ArchiveFile) => {
    if (!file.name) return false;
    const lowerName = file.name.toLowerCase();

    // 1. Must have a valid web video extension
    const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));
    if (!hasValidExt) return false;

    // 2. Remove torrent, thumbs, xml, metadata, audio
    if (lowerName.includes('.thumbs') || lowerName.endsWith('.torrent') || lowerName.endsWith('.xml')) {
      return false;
    }

    // Exclude trailers from main movie stream
    if (isTrailerOrSample(file.name, file.title)) {
      return false;
    }

    return true;
  });

  const playableFiles: PlayableFile[] = rawPlayable.map((file: ArchiveFile) => {
    const lower = file.name.toLowerCase();
    let format: 'mp4' | 'webm' | 'ogv' = 'mp4';
    if (lower.endsWith('.webm')) format = 'webm';
    else if (lower.endsWith('.ogv')) format = 'ogv';

    const bytes = typeof file.size === 'string' ? parseInt(file.size, 10) : (file.size || 0);
    const lengthSec = typeof file.length === 'string' ? parseFloat(file.length) : (file.length || undefined);

    let formatLabel = file.format || format.toUpperCase();
    if (format === 'mp4') {
      if (lower.includes('1080') || (file.height && Number(file.height) >= 1080)) formatLabel = 'MP4 1080p';
      else if (lower.includes('720') || (file.height && Number(file.height) >= 720)) formatLabel = 'MP4 720p';
      else if (lower.includes('512kb')) formatLabel = 'MP4 Web Stream';
      else formatLabel = 'MP4 / H.264';
    } else if (format === 'webm') {
      formatLabel = 'WebM';
    } else if (format === 'ogv') {
      formatLabel = 'Ogg Video';
    }

    const url = constructArchiveFileUrl(identifier, file.name, file.url);

    return {
      name: file.name,
      format,
      formatLabel,
      url,
      bytes: isNaN(bytes) ? 0 : bytes,
      sizeFormatted: formatBytes(bytes),
      lengthSeconds: lengthSec,
      isTrailer: false
    };
  });

  // Sort files:
  // 1. MP4 first (broadest browser compatibility: Chrome, Safari, iOS, Firefox), then WebM, then OGV
  // 2. For same format, prefer medium/high quality (500MB - 3GB) over massive 10GB raw files or tiny <10MB snippets
  playableFiles.sort((a, b) => {
    const formatPriority = { mp4: 1, webm: 2, ogv: 3 };
    const pA = formatPriority[a.format] || 4;
    const pB = formatPriority[b.format] || 4;
    if (pA !== pB) return pA - pB;

    // Prefer web-optimized files (h.264 derivatives or files between 150MB and 2.5GB)
    const isPreferredSizeA = a.bytes >= 150 * 1024 * 1024 && a.bytes <= 3000 * 1024 * 1024;
    const isPreferredSizeB = b.bytes >= 150 * 1024 * 1024 && b.bytes <= 3000 * 1024 * 1024;
    if (isPreferredSizeA && !isPreferredSizeB) return -1;
    if (!isPreferredSizeA && isPreferredSizeB) return 1;

    // Default to larger size if both are within reason
    return b.bytes - a.bytes;
  });

  return playableFiles;
}

/**
 * Check if the archive metadata contains a real trailer or clip
 * Never pretend a full movie is a trailer.
 */
export function getTrailerFile(metadata: MovieMetadata): PlayableFile | null {
  if (!metadata || !metadata.files || !Array.isArray(metadata.files)) {
    return null;
  }

  const identifier = metadata.identifier;
  const validExtensions = ['.mp4', '.webm', '.ogv'];

  const trailerFile = metadata.files.find((file: ArchiveFile) => {
    if (!file.name) return false;
    const s = `${file.name} ${file.title || ''}`.toLowerCase();
    const isTrailerName = s.includes('trailer') || s.includes('preview') || s.includes('clip') || s.includes('teaser');
    if (!isTrailerName) return false;

    return validExtensions.some(ext => s.endsWith(ext));
  });

  if (!trailerFile) return null;

  const lower = trailerFile.name.toLowerCase();
  let format: 'mp4' | 'webm' | 'ogv' = 'mp4';
  if (lower.endsWith('.webm')) format = 'webm';
  else if (lower.endsWith('.ogv')) format = 'ogv';

  const bytes = typeof trailerFile.size === 'string' ? parseInt(trailerFile.size, 10) : (trailerFile.size || 0);

  return {
    name: trailerFile.name,
    format,
    formatLabel: 'Trailer / Clip',
    url: constructArchiveFileUrl(identifier, trailerFile.name, trailerFile.url),
    bytes: isNaN(bytes) ? 0 : bytes,
    sizeFormatted: formatBytes(bytes),
    isTrailer: true
  };
}

/**
 * If primary thumbnail (https://archive.org/services/img/{identifier}) fails:
 * Inspect metadata files for: .jpg, .jpeg, .png
 * Looking for: poster, cover, thumb, thumbnail, __ia_thumb
 * Never return fake posters or unrelated images.
 */
export function getAlternativePoster(metadata: MovieMetadata): string | null {
  if (!metadata || !metadata.files || !Array.isArray(metadata.files)) {
    return null;
  }

  const identifier = metadata.identifier;
  const imgFiles = metadata.files.filter((f: ArchiveFile) => {
    if (!f.name) return false;
    const lower = f.name.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
  });

  if (imgFiles.length === 0) return null;

  // 1. Look for explicit poster or cover keywords
  const posterKeywords = ['poster', 'cover', '__ia_thumb', 'thumb', 'title'];
  for (const kw of posterKeywords) {
    const match = imgFiles.find(f => f.name.toLowerCase().includes(kw));
    if (match) {
      return constructArchiveFileUrl(identifier, match.name, match.url);
    }
  }

  // 2. Return first genuine still/image if available (excluding small icon files)
  const still = imgFiles.find(f => {
    const lower = f.name.toLowerCase();
    return !lower.includes('icon') && !lower.endsWith('_thumb.jpg');
  });

  if (still) {
    return constructArchiveFileUrl(identifier, still.name, still.url);
  }

  return constructArchiveFileUrl(identifier, imgFiles[0].name, imgFiles[0].url);
}

/**
 * Inspect metadata to determine genuine rights status.
 * Do not label every Internet Archive movie as Public Domain.
 * Inspect rights, license, licenseurl, description, metadata.
 * Only set Public Domain when source metadata clearly supports it.
 */
export function verifyMetadataRights(metadata: MovieMetadata, releaseYear?: number | string): {
  copyrightStatus: CopyrightStatus;
  rightsVerified: boolean;
  downloadAllowed: boolean;
  license: string;
  licenseUrl: string;
} {
  const meta = metadata.metadata || {};
  const licenseurl = String(meta.licenseurl || '').toLowerCase();
  const rights = String(meta.rights || '').toLowerCase();
  const description = String(meta.description || '').toLowerCase();
  const yearNum = Number(releaseYear || meta.year || 0);

  // Creative Commons CC0 / Public Domain dedication
  if (licenseurl.includes('publicdomain/zero') || licenseurl.includes('cc0') || rights.includes('cc0')) {
    return {
      copyrightStatus: 'CC0',
      rightsVerified: true,
      downloadAllowed: true,
      license: 'Creative Commons CC0 1.0 Universal (Public Domain Dedication)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
    };
  }

  // Creative Commons licenses
  if (licenseurl.includes('by-sa')) {
    return {
      copyrightStatus: 'Creative Commons',
      rightsVerified: true,
      downloadAllowed: true,
      license: 'Creative Commons Attribution-ShareAlike (CC BY-SA)',
      licenseUrl: meta.licenseurl || 'https://creativecommons.org/licenses/by-sa/4.0/'
    };
  }

  if (licenseurl.includes('by/')) {
    return {
      copyrightStatus: 'Creative Commons',
      rightsVerified: true,
      downloadAllowed: true,
      license: 'Creative Commons Attribution (CC BY)',
      licenseUrl: meta.licenseurl || 'https://creativecommons.org/licenses/by/4.0/'
    };
  }

  // Explicit Public Domain mark or license
  if (
    licenseurl.includes('publicdomain') ||
    rights.includes('public domain') ||
    description.includes('public domain') ||
    description.includes('in the public domain') ||
    (yearNum > 0 && yearNum <= 1928) // Published in or before 1928: Worldwide Public Domain by operation of law
  ) {
    return {
      copyrightStatus: 'Public Domain',
      rightsVerified: true,
      downloadAllowed: true,
      license: yearNum > 0 && yearNum <= 1928 
        ? 'Public Domain (Works published before 1929)' 
        : 'Public Domain (Open Cultural Archive)',
      licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/'
    };
  }

  // If unclear, do not assume
  return {
    copyrightStatus: 'Unknown',
    rightsVerified: false,
    downloadAllowed: false,
    license: 'Rights verification pending from archive source record',
    licenseUrl: `https://archive.org/details/${metadata.identifier}`
  };
}
