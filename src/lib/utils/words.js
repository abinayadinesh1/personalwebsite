// Words data access with localStorage caching.
// Cache-first: callers render loadWordsFromCache() instantly, then refresh via fetchWords().

const CACHE_KEY = 'words_data';

function emptyData() {
  return { words: [], annotations: [] };
}

// Synchronously read cached words/annotations from localStorage
export function loadWordsFromCache() {
  if (typeof window === 'undefined') return emptyData();

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return emptyData();
    const data = JSON.parse(raw);
    return {
      words: data.words || [],
      annotations: data.annotations || []
    };
  } catch (error) {
    console.error('Failed to read words cache:', error);
    return emptyData();
  }
}

// Persist words/annotations to localStorage
export function saveWordsToCache(words, annotations) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ words, annotations }));
    localStorage.setItem('words_last_sync', new Date().toISOString());
  } catch (error) {
    console.error('Failed to cache words:', error);
  }
}

// Fetch from the API, caching on success; fall back to cache on failure
export async function fetchWords() {
  if (typeof window === 'undefined') return emptyData();

  try {
    const response = await fetch('/api/words');
    if (response.ok) {
      const data = await response.json();
      const words = data.words || [];
      const annotations = data.annotations || [];
      saveWordsToCache(words, annotations);
      return { words, annotations };
    }
    return loadWordsFromCache();
  } catch (error) {
    console.error('Failed to fetch words:', error);
    return loadWordsFromCache();
  }
}
