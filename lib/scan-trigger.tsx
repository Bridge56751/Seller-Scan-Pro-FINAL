import { createContext, useContext, useState, type ReactNode } from "react";

const ScanTriggerContext = createContext({ request: 0, requestScan: () => {} });

export function ScanTriggerProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState(0);
  return <ScanTriggerContext.Provider value={{ request, requestScan: () => setRequest(value => value + 1) }}>
    {children}
  </ScanTriggerContext.Provider>;
}

export function useScanTrigger() { return useContext(ScanTriggerContext); }
