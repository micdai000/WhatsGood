import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SearchBar({
  value,
  onChange,
  className,
  disabled = false,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or username…"
        className="h-11 pl-10"
        aria-label="Search professionals"
        disabled={disabled}
      />
    </div>
  );
}
