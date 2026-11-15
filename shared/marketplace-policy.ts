/**
 * A curated destination list, not a guarantee about individual marketplace sellers.
 * Add official domains deliberately; never infer authorization from a seller label.
 */
const domains = [
  "ebay.com", "ebay.co.uk", "ebay.ca", "ebay.com.au", "ebay.de", "ebay.fr", "ebay.it", "ebay.es",
  "mercari.com", "poshmark.com", "poshmark.ca", "depop.com", "grailed.com",
  "stockx.com", "goat.com", "etsy.com", "therealreal.com", "vestiairecollective.com",
  "amazon.com", "amazon.ca", "amazon.co.uk", "amazon.com.au", "amazon.de", "amazon.fr", "amazon.it", "amazon.es", "amazon.co.jp",
  "walmart.com", "walmart.ca", "target.com", "bestbuy.com", "bestbuy.ca", "costco.com", "costco.ca",
  "nordstrom.com", "nordstromrack.com", "macys.com", "bloomingdales.com",
  "rei.com", "dickssportinggoods.com", "homedepot.com", "lowes.com", "gamestop.com",
  "bhphotovideo.com", "adorama.com", "zappos.com", "footlocker.com",
  "apple.com", "nike.com", "adidas.com", "newbalance.com", "patagonia.com",
  "thenorthface.com", "lululemon.com", "lego.com", "sony.com", "samsung.com",
];

export function isApprovedMarketplaceUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
    const host = url.hostname.toLowerCase();
    return domains.some(domain => host === domain || host.endsWith(`.${domain}`));
  } catch { return false; }
}
