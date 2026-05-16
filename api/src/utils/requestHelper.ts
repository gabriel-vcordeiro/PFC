import { ParsedQs } from 'qs';

type QueryValue = string | ParsedQs | (string | ParsedQs)[] | undefined;
export function getQueryString(query: QueryValue): string | undefined {
  const value = Array.isArray(query) ? query[0] : query;

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = decodeURIComponent(value).trim();

  return normalized || undefined;
}
