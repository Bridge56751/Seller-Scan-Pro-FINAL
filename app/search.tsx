import { Redirect } from "expo-router";

// Keep old Search links usable without restoring the removed tab.
export default function FormerSearchRoute() {
  return <Redirect href="/history" />;
}
