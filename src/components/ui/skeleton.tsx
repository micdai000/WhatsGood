import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("w-[220px] shrink-0", className)}>
      <div className="skeleton h-[280px] w-full rounded-2xl" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5 p-2.5", className)}>
      <div className="skeleton h-24 w-24 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonActivity({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 py-3.5", className)}>
      <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-4/5" />
        <div className="skeleton h-3 w-1/4" />
      </div>
    </div>
  );
}
