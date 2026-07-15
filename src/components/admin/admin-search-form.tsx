import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSearchFormProps {
  placeholder?: string;
  className?: string;
}

export function AdminSearchForm({
  placeholder = "Search…",
  className,
}: AdminSearchFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pending, startTransition] = useTransition();
  const query = searchParams.get("query") ?? "";

  return (
    <form
      className={cn("flex gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextQuery = String(formData.get("query") ?? "").trim();
        const params = new URLSearchParams(searchParams.toString());

        if (nextQuery) {
          params.set("query", nextQuery);
        } else {
          params.delete("query");
        }

        params.delete("page");

        startTransition(() => {
          navigate(`?${params.toString()}`);
        });
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="query"
          defaultValue={query}
          placeholder={placeholder}
          className="pl-9"
          aria-label="Search"
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Searching…" : "Search"}
      </Button>
      {query ? (
        <Link to="?" className={cn(buttonVariants({ variant: "ghost" }))}>
          Clear
        </Link>
      ) : null}
    </form>
  );
}
