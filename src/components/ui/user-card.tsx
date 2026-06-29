import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { formatCount, type User } from "@/data/mock";

interface UserCardProps {
  user: User;
  className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-white p-4 hover:bg-neutral-50 transition-colors",
        !className?.includes("w-") && "card-row-item card-row-item--wide shrink-0",
        className,
      )}
    >
      <Avatar src={user.avatar} alt={user.displayName} size={52} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold text-[#111] truncate">
          {user.displayName}
        </h3>
        <p className="text-[13px] text-neutral-400">@{user.username}</p>
        <div className="mt-1 flex items-center gap-1 text-[12px] text-neutral-400">
          <span>{formatCount(user.followers)} followers</span>
          <span className="text-neutral-300">&middot;</span>
          <span>{formatCount(user.totalVotesCast)} votes</span>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full bg-[#111] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-neutral-800 transition-colors"
      >
        Follow
      </button>
    </div>
  );
}
