import { AppImage } from "@/components/ui/app-image";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TierBadge } from "./tier-badge";
import { type ActivityItem } from "@/data/mock";
import {
  ChevronUp,
  ChevronDown,
  Minus,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

const iconConfig: Record<
  ActivityItem["type"],
  { icon: typeof ChevronUp; bg: string; text: string }
> = {
  promote: { icon: ChevronUp, bg: "bg-emerald-500/10", text: "text-emerald-600" },
  demote: { icon: ChevronDown, bg: "bg-red-500/10", text: "text-red-500" },
  tier_up: { icon: ArrowUpRight, bg: "bg-violet-500/10", text: "text-violet-600" },
  tier_down: { icon: ChevronDown, bg: "bg-orange-500/10", text: "text-orange-500" },
  follow: { icon: UserPlus, bg: "bg-sky-500/10", text: "text-sky-600" },
  maintain: { icon: Minus, bg: "bg-amber-500/10", text: "text-amber-600" },
};

function EntityLink({ name, id }: { name: string; id?: string }) {
  if (!id) return <strong className="text-[#111]">{name}</strong>;
  return (
    <Link to={`/entity/${id}`} className="text-[#111] font-semibold hover:underline">
      {name}
    </Link>
  );
}

function ActivityDescription({ item }: { item: ActivityItem }) {
  switch (item.type) {
    case "promote":
      return (
        <>
          <strong className="text-[#111]">{item.userName}</strong> promoted{" "}
          <EntityLink name={item.entityName!} id={item.entityId} />
        </>
      );
    case "demote":
      return (
        <>
          <strong className="text-[#111]">{item.userName}</strong> demoted{" "}
          <EntityLink name={item.entityName!} id={item.entityId} />
        </>
      );
    case "maintain":
      return (
        <>
          <strong className="text-[#111]">{item.userName}</strong> maintained{" "}
          <EntityLink name={item.entityName!} id={item.entityId} />
        </>
      );
    case "tier_up":
      return (
        <>
          <EntityLink name={item.entityName!} id={item.entityId} /> reached{" "}
          {item.tier && <TierBadge tier={item.tier} size="sm" />}
        </>
      );
    case "tier_down":
      return (
        <>
          <EntityLink name={item.entityName!} id={item.entityId} /> dropped to{" "}
          {item.tier && <TierBadge tier={item.tier} size="sm" />}
        </>
      );
    case "follow":
      return (
        <>
          <strong className="text-[#111]">{item.userName}</strong> followed{" "}
          <EntityLink name={item.entityName!} id={item.entityId} />
        </>
      );
    default:
      return null;
  }
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-[15px] text-neutral-300 font-medium">
        No activity yet
      </p>
    );
  }

  return (
    <div className={cn("divide-y divide-neutral-100", className)}>
      {items.map((item) => {
        const hasAvatar = !!item.userAvatar;
        const config = iconConfig[item.type];
        const IconComponent = config.icon;

        return (
          <div key={item.id} className="flex items-start gap-3 py-3.5">
            {hasAvatar ? (
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                <AppImage
                  src={item.userAvatar!}
                  alt={item.userName ?? ""}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  config.bg,
                )}
              >
                <IconComponent className={cn("h-4 w-4", config.text)} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-relaxed text-neutral-600">
                <ActivityDescription item={item} />
              </p>
              <p className="text-[12px] text-neutral-300 mt-0.5">
                {item.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
