import { activityFeed, allEntities, libraries, type Entity } from "./mock";

function byScoreDesc(a: Entity, b: Entity) {
  return b.score - a.score;
}

function byFollowersDesc(a: Entity, b: Entity) {
  return b.followersCount - a.followersCount;
}

export const eliteEntities = allEntities
  .filter((e) => e.tier === "elite")
  .sort(byScoreDesc)
  .slice(0, 10);

export const trendingUpEntities = allEntities
  .filter((e) => e.trending === "up")
  .sort(byScoreDesc)
  .slice(0, 10);

export const trendingDownEntities = allEntities
  .filter((e) => e.trending === "down")
  .sort(byScoreDesc)
  .slice(0, 10);

export const mostFollowedEntities = [...allEntities]
  .sort(byFollowersDesc)
  .slice(0, 8);

export const recentlyAddedEntities = allEntities
  .filter((e) => e.recentlyAdded)
  .slice(0, 8);

export const homeLibraries = libraries.slice(0, 6);

export const homeActivity = activityFeed.slice(0, 5);
