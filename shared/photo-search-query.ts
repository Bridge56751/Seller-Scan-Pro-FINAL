/** Conservative title cleanup: preserve brand/model/variant tokens, remove web-page noise. */
export function photoSearchQueries(title: string): string[] {
  const cleaned = title
    .replace(/&amp;/gi, "&").replace(/&quot;|&#34;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/https?:\/\/\S+/gi, "")
    .split(/\s+[|•]\s+/)[0]
    .replace(/^(?:buy|shop)\s+(?:the\s+)?/i, "")
    .replace(/\s+[-–—:]\s+(?:buy|shop|free shipping|prices?|reviews?|official store|online store)\b.*$/i, "")
    .replace(/\s+/g, " ").trim();
  const primary = (cleaned.length >= 3 ? cleaned : title.trim()).slice(0, 180).trim();
  const words = primary.split(/\s+/);
  const shorter = words.filter(word => !/^(best|sale|discount|cheap|online|authentic|genuine|original)$/i.test(word))
    .slice(0, 8).join(" ");
  return shorter.length >= 3 && shorter.toLowerCase() !== primary.toLowerCase()
    ? [primary, shorter] : [primary];
}
