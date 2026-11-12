import { File, Paths } from "expo-file-system";

/** Delete only app cache files, never saved history data URLs or library photos. */
export function discardTemporaryPhoto(uri: string) {
  if (!uri.startsWith("file://")) return;
  try {
    if (!uri.startsWith(Paths.cache.uri)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    console.warn("[Shopping] Local photo cleanup delayed; file remains in app cache.");
  }
}
