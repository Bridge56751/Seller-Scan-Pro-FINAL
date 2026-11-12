import { Redirect } from "expo-router";

// Scan is an action in the tab bar, never a landing page.
export default function Index() {
  return <Redirect href="/history" />;
}
