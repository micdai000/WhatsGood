import { useNavigate } from "react-router-dom";
import { useTransition } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { useUrlSyncedState } from "@/hooks/use-url-synced-state";
import { buildSearchUrl } from "@/lib/search/params";
import type { ProfileSearchParams } from "@/types";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  params: ProfileSearchParams;
  className?: string;
}

export function SearchForm({ params, className }: SearchFormProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useUrlSyncedState(params.query);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    startTransition(() => {
      navigate(
        buildSearchUrl("/search", {
          ...params,
          query: trimmed || undefined,
          page: 1,
        }),
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(isPending && "opacity-70", className)}
    >
      <SearchBar
        value={query}
        onChange={setQuery}
        disabled={isPending}
      />
    </form>
  );
}
