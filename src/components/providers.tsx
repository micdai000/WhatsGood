"use client";

import { LibrariesProvider } from "@/lib/libraries-store";
import { LikesProvider } from "@/lib/likes-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LikesProvider>
      <LibrariesProvider>{children}</LibrariesProvider>
    </LikesProvider>
  );
}
