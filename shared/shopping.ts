import { z } from "zod";

// Initial end-to-end coverage: countries documented by both Lens and Shopping.
// Unsupported destinations are rejected, never silently searched as US.
export const COUNTRIES = [
  ["US", "United States", "USD"], ["CA", "Canada", "CAD"],
  ["GB", "United Kingdom", "GBP"], ["AU", "Australia", "AUD"],
  ["AT", "Austria", "EUR"], ["BE", "Belgium", "EUR"], ["BR", "Brazil", "BRL"],
  ["CH", "Switzerland", "CHF"], ["CL", "Chile", "CLP"], ["CO", "Colombia", "COP"],
  ["CZ", "Czech Republic", "CZK"], ["DE", "Germany", "EUR"], ["DK", "Denmark", "DKK"],
  ["ES", "Spain", "EUR"], ["FR", "France", "EUR"], ["ID", "Indonesia", "IDR"],
  ["IE", "Ireland", "EUR"], ["IN", "India", "INR"], ["IT", "Italy", "EUR"],
  ["JP", "Japan", "JPY"], ["KR", "South Korea", "KRW"], ["MX", "Mexico", "MXN"],
  ["MY", "Malaysia", "MYR"], ["NL", "Netherlands", "EUR"], ["NO", "Norway", "NOK"],
  ["NZ", "New Zealand", "NZD"], ["PH", "Philippines", "PHP"], ["PL", "Poland", "PLN"],
  ["PT", "Portugal", "EUR"], ["SE", "Sweden", "SEK"], ["SG", "Singapore", "SGD"],
  ["TR", "Turkey", "TRY"], ["AE", "United Arab Emirates", "AED"],
  ["ZA", "South Africa", "ZAR"],
] as const;

export function countryInfo(code: string) {
  return COUNTRIES.find(([value]) => value === code.toUpperCase());
}

export const PHOTO_DISCLOSURE =
  "Each product photo you accept in the camera is uploaded to this app’s server and shared with SearchApi and Google Lens for identification. Canceling the camera sends no photo. We remove image metadata and temporarily store an encrypted copy. An unlisted image link is accessible to anyone who has it while processing, for at most 2 minutes. The temporary record is deleted after processing; encrypted copies may remain in database backups. SearchApi and Google may retain submitted data under their own policies. Avoid faces, addresses, receipts, and other private information. Clearing a photo does not remove copies already received by providers. Photos are not saved to your photo library.";

export const comparisonSchema = z.object({
  country: z.string().length(2).transform(v => v.toUpperCase()),
  product: z.string().trim().min(3).max(180),
  // An explicit "N/A" is allowed, rather than silently assuming a variant.
  size: z.string().trim().min(1).max(60),
  color: z.string().trim().min(1).max(60),
  quantity: z.number().int().min(1).max(100),
  condition: z.enum(["new", "used"]),
  confirmed: z.literal(true),
}).strict();
export type ComparisonInput = z.infer<typeof comparisonSchema>;
export const listingSearchSchema = z.object({
  country: z.string().length(2).transform(v => v.toUpperCase()),
  query: z.string().trim().min(3).max(180),
  condition: z.enum(["any", "new", "used"]).default("any"),
}).strict();
export type ListingSearchInput = z.input<typeof listingSearchSchema>;
export type ListingSearch = Comparison & { query: string; matchStatus: "possible" };
export type PhotoMatch = { title: string; source: string; url: string | null; imageUrl: string | null };
export type Identification = { matches: PhotoMatch[]; country: string };
export type ShoppingOffer = {
  title: string; seller: string; url: string; priceText: string; imageUrl: string | null;
  linkKind?: "store" | "comparison";
  amount: number | null; currency: string | null; delivery: string;
  condition: string; titleMatches: boolean; restricted: boolean;
};
export type Comparison = {
  offers: ShoppingOffer[]; country: string; currency: string;
  fetchedAt: string; excluded: number;
};
