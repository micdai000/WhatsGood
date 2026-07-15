import { LikesProvider } from "@/lib/likes-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LikesProvider>{children}</LikesProvider>;
}
