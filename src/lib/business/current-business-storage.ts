const STORAGE_KEY = "meritt.currentBusinessId";

export function readStoredBusinessId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeBusinessId(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignore quota / private-mode failures.
  }
}
