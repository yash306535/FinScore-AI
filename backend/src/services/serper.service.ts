import { SearchSource, createAppError } from '../types';

type SerperSearchType = 'search' | 'news';

interface SerperOrganicResult {
  position?: number;
  title?: string;
  link?: string;
  snippet?: string;
}

interface SerperNewsResult {
  position?: number;
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  date?: string;
}

interface SerperSearchResponse {
  organic?: SerperOrganicResult[];
  news?: SerperNewsResult[];
}

const getSerperApiKey = (): string => {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw createAppError('SERPER_API_KEY is not configured', 500);
  }

  return apiKey;
};

const sanitizeSource = (source: SearchSource): SearchSource | null => {
  const title = source.title.trim();
  const link = source.link.trim();

  if (!title || !link) {
    return null;
  }

  return {
    ...source,
    title,
    link,
    snippet: source.snippet.trim()
  };
};

export const searchWithSerper = async (
  query: string,
  type: SerperSearchType = 'search',
  num = 5
): Promise<SearchSource[]> => {
  const endpoint = `https://google.serper.dev/${type}`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': getSerperApiKey()
      },
      body: JSON.stringify({
        q: query,
        gl: 'in',
        hl: 'en',
        num
      })
    });
  } catch (error) {
    throw createAppError(
      `Serper request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      502
    );
  }

  if (!response.ok) {
    throw createAppError(`Serper request failed with status ${response.status}`, 502);
  }

  const payload = (await response.json()) as SerperSearchResponse;
  const rawResults =
    type === 'news'
      ? (payload.news || []).map((item, index) => ({
          position: item.position || index + 1,
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || '',
          source: item.source,
          date: item.date
        }))
      : (payload.organic || []).map((item, index) => ({
          position: item.position || index + 1,
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || ''
        }));

  const deduped = new Map<string, SearchSource>();

  rawResults.forEach((result) => {
    const sanitized = sanitizeSource(result);

    if (!sanitized || deduped.has(sanitized.link)) {
      return;
    }

    deduped.set(sanitized.link, sanitized);
  });

  return Array.from(deduped.values()).slice(0, num);
};

export const formatSourcesForPrompt = (sources: SearchSource[]): string => {
  if (!sources.length) {
    return 'No live web sources were available.';
  }

  return sources
    .map(
      (source) =>
        `[${source.position}] ${source.title}\nURL: ${source.link}\nSnippet: ${source.snippet || 'No snippet provided.'}${
          source.source ? `\nPublisher: ${source.source}` : ''
        }${source.date ? `\nDate: ${source.date}` : ''}`
    )
    .join('\n\n');
};
