import type { ListingSearchInput, ListingSearch } from "../../shared/shopping";
import { photoSearchQueries } from "../../shared/photo-search-query";
import { normalizeOffers, searchApi } from "./searchapi";
import { throwIfCanceled } from "../../shared/cancellation";

type Provider = typeof searchApi;
/** One normal lookup; at most one broader lookup after a successful empty photo search. */
export async function findListings(
  input: ListingSearchInput, currency: string,
  provider: Provider = searchApi,
  onAttempt: (attempt: number, ms: number, offers: number) => void = () => {},
  signal?: AbortSignal,
): Promise<ListingSearch> {
  const queries = input.automatic ? photoSearchQueries(input.query) : [input.query];
  const started = Date.now();
  let result: ListingSearch | undefined;
  for (const [index, query] of queries.entries()) {
    throwIfCanceled(signal);
    const remaining = 60000 - (Date.now() - started);
    // Do not turn a slow empty first response into another full minute of waiting.
    if (index > 0 && remaining < 10000) break;
    const attemptStart = Date.now();
    const data = await provider({
      engine: "google_shopping", q: query, gl: input.country.toLowerCase(), hl: "en",
      link: "raw",
      ...(!input.condition || input.condition === "any" ? {} : { condition: input.condition }),
    }, { timeoutMs: Math.max(1, remaining), signal });
    throwIfCanceled(signal);
    const normalized = normalizeOffers(data, {
      product: query, country: input.country, condition: input.condition ?? "any",
      size: "N/A", color: "N/A", quantity: 1,
    }, currency);
    onAttempt(index + 1, Date.now() - attemptStart, normalized.offers.length);
    result = { ...normalized, country: input.country, currency,
      fetchedAt: new Date().toISOString(), query, matchStatus: "possible", fallbackUsed: index > 0 };
    if (result.offers.length) break;
  }
  return result!;
}
