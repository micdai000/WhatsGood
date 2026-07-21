import { useState } from "react";
import { AppImage } from "@/components/ui/app-image";
import { Link } from "react-router-dom";
import { Settings, Share2 } from "lucide-react";
import {
  currentUser,
  followedCreatorIds,
  allEntities,
  users,
  activityFeed,
  formatCount,
  categoryLabels,
} from "@/data/mock";
import { useLikes } from "@/lib/likes-store";
import { TierBadge } from "@/components/ui/tier-badge";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { UserCard } from "@/components/ui/user-card";

type ProfileTab = "activity" | "likes" | "following";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");
  const { likedEntityIds } = useLikes();

  const likedEntities = allEntities.filter((e) =>
    likedEntityIds.includes(e.id),
  );

  const followedCreators = users.filter(
    (u) => u.id !== currentUser.id && followedCreatorIds.includes(u.id),
  );

  const myActivity = activityFeed.filter(
    (a) => a.userName === currentUser.displayName,
  );

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "activity", label: "Activity" },
    { key: "likes", label: "Likes" },
    { key: "following", label: "Following" },
  ];

  return (
    <div className="w-full py-6">
      {/* Settings */}
      <div className="flex justify-end page-x">
        <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Profile header */}
      <div className="pt-2 page-x flex flex-col items-center">
        <div className="relative size-[88px] overflow-hidden rounded-full">
          <AppImage
            src={currentUser.avatar}
            alt={currentUser.displayName}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground text-center">
          {currentUser.displayName}
        </h1>
        <p className="text-[14px] text-muted-foreground text-center">
          @{currentUser.username}
        </p>
        <p className="mt-2 max-w-md text-center text-[14px] leading-relaxed text-muted-foreground">
          {currentUser.bio}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-center gap-8 sm:gap-10">
        {[
          { value: currentUser.totalVotesCast, label: "Votes" },
          { value: likedEntityIds.length, label: "Likes" },
          { value: followedCreators.length, label: "Following" },
          { value: currentUser.followers, label: "Followers" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-lg font-bold text-foreground">
              {formatCount(stat.value)}
            </p>
            <p className="mt-0.5 text-[12px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3 page-x">
        <button
          type="button"
          className="flex-1 rounded-xl bg-muted py-3 text-[14px] font-semibold text-foreground hover:bg-accent transition-colors"
        >
          Edit Profile
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted py-3 text-[14px] font-semibold text-foreground hover:bg-accent transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 overflow-x-auto hide-scrollbar border-b border-border page-x sm:gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? "shrink-0 border-b-2 border-primary pb-3 text-[14px] font-semibold text-foreground"
                : "shrink-0 pb-3 text-[14px] text-muted-foreground hover:text-primary transition-colors"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-5 page-x">
        {activeTab === "activity" && (
          <ActivityFeed items={myActivity} />
        )}

        {activeTab === "likes" && (
          <>
            {likedEntities.length > 0 ? (
              <div>
                {likedEntities.map((entity, i) => (
                  <Link
                    key={entity.id}
                    to={`/entity/${entity.id}`}
                    className={
                      "flex items-center gap-3.5 py-3" +
                      (i < likedEntities.length - 1
                        ? " border-b border-muted"
                        : "")
                    }
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <AppImage
                        src={entity.image}
                        alt={entity.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {entity.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {categoryLabels[entity.category]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TierBadge tier={entity.tier} size="sm" />
                      <span className="text-[13px] tabular-nums text-muted-foreground">
                        {entity.score > 0 ? "+" : ""}
                        {entity.score}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-[14px] text-muted-foreground">
                Like entities to save them here.
              </p>
            )}
          </>
        )}

        {activeTab === "following" && (
          <>
            {followedCreators.length > 0 ? (
              <div className="flex flex-col gap-3">
                {followedCreators.map((user) => (
                  <UserCard key={user.id} user={user} className="w-full" />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-[14px] text-muted-foreground">
                Follow creators to see them here.
              </p>
            )}
          </>
        )}
      </div>

      {/* Log out */}
      <div className="mt-12 pb-4 text-center">
        <button
          type="button"
          className="text-[13px] font-medium text-red-400 hover:text-red-500 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
