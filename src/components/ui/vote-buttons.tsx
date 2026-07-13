import { useState } from "react";
import { ChevronUp, Minus, ChevronDown } from "lucide-react";
import { type VoteType } from "@/data/mock";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  entityId: string;
  currentVote?: VoteType | null;
  onVote?: (voteType: VoteType) => void;
}

const voteOptions: {
  type: VoteType;
  label: string;
  helper: string;
  icon: typeof ChevronUp;
  activeClasses: string;
}[] = [
  {
    type: "promote",
    label: "Promote",
    helper: "Deserves higher",
    icon: ChevronUp,
    activeClasses: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    type: "maintain",
    label: "Maintain",
    helper: "Deserves current",
    icon: Minus,
    activeClasses: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    type: "demote",
    label: "Demote",
    helper: "Deserves lower",
    icon: ChevronDown,
    activeClasses: "bg-red-50 border-red-200 text-red-600",
  },
];

export function VoteButtons({ entityId, currentVote, onVote }: VoteButtonsProps) {
  const [internalVote, setInternalVote] = useState<VoteType | null>(currentVote ?? null);

  const activeVote = onVote ? currentVote ?? null : internalVote;

  function handleVote(voteType: VoteType) {
    if (onVote) {
      onVote(voteType);
    } else {
      setInternalVote((prev) => (prev === voteType ? null : voteType));
    }
  }

  return (
    <div className="flex gap-2.5">
      {voteOptions.map(({ type, label, helper, icon: Icon, activeClasses }) => {
        const isActive = activeVote === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleVote(type)}
            className={cn(
              "flex flex-1 flex-col items-center gap-2 rounded-2xl border py-5 transition-all duration-200 active:scale-[0.97]",
              isActive
                ? activeClasses
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
            )}
          >
            <Icon className="h-7 w-7" />
            <span className="text-[14px] font-semibold">{label}</span>
            <span
              className={cn(
                "text-[11px]",
                isActive ? "opacity-70" : "text-neutral-400",
              )}
            >
              {helper}
            </span>
          </button>
        );
      })}
    </div>
  );
}
