import { useEffect, useState } from "react";

/**
 * Local input state that stays in sync when the URL-driven value changes
 * (navigation, back/forward, filter updates from other controls).
 */
export function useUrlSyncedState(urlValue: string | undefined) {
  const normalized = urlValue ?? "";
  const [value, setValue] = useState(normalized);

  useEffect(() => {
    setValue(normalized);
  }, [normalized]);

  return [value, setValue] as const;
}
