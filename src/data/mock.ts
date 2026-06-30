export type Category = "food" | "places" | "entertainment" | "movies-shows";
export type Tier = "bronze" | "silver" | "gold" | "platinum" | "elite";
export type VoteType = "promote" | "maintain" | "demote";

export interface Entity {
  id: string;
  name: string;
  category: Category;
  image: string;
  score: number;
  tier: Tier;
  totalVotes: number;
  followersCount: number;
  librariesIncludedIn: string[];
  trending?: "up" | "down";
  recentlyAdded?: boolean;
  location?: string;
  foodLocations?: FoodLocation[];
}

export interface FoodLocation {
  id: string;
  restaurant: string;
  address: string;
  city: string;
  location: string;
  score: number;
  tier: Tier;
  totalVotes: number;
  trending?: "up" | "down";
}

export function formatFoodLocationLabel(entry: FoodLocation): string {
  return `${entry.address}, ${entry.city}`;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  following: number;
  totalVotesCast: number;
  entitiesFollowed: number;
  librariesCreated: number;
  bio: string;
}

export interface Vote {
  id: string;
  userId: string;
  entityId: string;
  voteType: VoteType;
  foodLocationId?: string;
}

export interface Library {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  entityCount: number;
  followerCount: number;
  creator: User;
  entityIds: string[];
  isPublic: boolean;
  isLocationBased?: boolean;
  location?: string;
}

export interface ActivityItem {
  id: string;
  type: "promote" | "demote" | "maintain" | "create_library" | "tier_up" | "tier_down" | "follow";
  userName?: string;
  userAvatar?: string;
  entityName?: string;
  entityId?: string;
  libraryName?: string;
  tier?: Tier;
  previousTier?: Tier;
  timestamp: string;
}

export const categoryLabels: Record<Category, string> = {
  food: "Food",
  places: "Places",
  entertainment: "Entertainment",
  "movies-shows": "Movies / Shows",
};

export const tierLabels: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  elite: "Elite",
};

export const tierColors: Record<Tier, { bg: string; text: string; border: string }> = {
  bronze: { bg: "bg-orange-900/10", text: "text-orange-800", border: "border-orange-800/20" },
  silver: { bg: "bg-gray-200/60", text: "text-gray-600", border: "border-gray-400/30" },
  gold: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-400/30" },
  platinum: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-400/30" },
  elite: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-400/30" },
};

export function getTier(score: number): Tier {
  if (score > 500) return "elite";
  if (score > 200) return "platinum";
  if (score > 50) return "gold";
  if (score > -50) return "silver";
  return "bronze";
}

export function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ─── USERS ──────────────────────────────────────────

export const currentUser: User = {
  id: "u1",
  username: "michaeld",
  displayName: "Michael D.",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  followers: 1243,
  following: 89,
  totalVotesCast: 347,
  entitiesFollowed: 52,
  librariesCreated: 12,
  bio: "Food explorer. Film critic. Always searching for the next great experience.",
};

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    username: "sarahchen",
    displayName: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    followers: 8920,
    following: 234,
    totalVotesCast: 1205,
    entitiesFollowed: 186,
    librariesCreated: 28,
    bio: "NYC food blogger. I vote on everything.",
  },
  {
    id: "u3",
    username: "jamesw",
    displayName: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    followers: 3410,
    following: 156,
    totalVotesCast: 892,
    entitiesFollowed: 97,
    librariesCreated: 15,
    bio: "Travel photographer. Documenting the world one place at a time.",
  },
  {
    id: "u4",
    username: "emilyr",
    displayName: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    followers: 15200,
    following: 302,
    totalVotesCast: 2340,
    entitiesFollowed: 312,
    librariesCreated: 42,
    bio: "Entertainment critic at The Daily Review. TV and film obsessed.",
  },
  {
    id: "u5",
    username: "alexkim",
    displayName: "Alex Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    followers: 6780,
    following: 178,
    totalVotesCast: 1567,
    entitiesFollowed: 145,
    librariesCreated: 19,
    bio: "Chef turned critic. If the seasoning is off, I will know.",
  },
];

// ─── FOODS (20) ─────────────────────────────────────

export const foods: Entity[] = [
  {
    id: "f1", name: "Costco Pizza", category: "food",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    score: 612, tier: "elite", totalVotes: 14230, followersCount: 8920, librariesIncludedIn: ["l1", "l5"], trending: "up",
  },
  {
    id: "f2", name: "Chick-fil-A", category: "food",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop",
    score: 534, tier: "elite", totalVotes: 18450, followersCount: 12100, librariesIncludedIn: ["l1"], trending: "up",
  },
  {
    id: "f3", name: "In-N-Out Burger", category: "food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    score: 480, tier: "platinum", totalVotes: 16800, followersCount: 9870, librariesIncludedIn: ["l1", "l5"],
  },
  {
    id: "f4", name: "Sushi Nakazawa", category: "food",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop",
    score: 340, tier: "platinum", totalVotes: 2103, followersCount: 1560, librariesIncludedIn: ["l5"],
  },
  {
    id: "f5", name: "Trader Joe's Orange Chicken", category: "food",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    score: 390, tier: "platinum", totalVotes: 11200, followersCount: 5430, librariesIncludedIn: ["l1"],
  },
  {
    id: "f6", name: "Bavel", category: "food",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
    score: 210, tier: "platinum", totalVotes: 2890, followersCount: 1780, librariesIncludedIn: ["l5"], trending: "up",
  },
  {
    id: "f7", name: "Republique", category: "food",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    score: 180, tier: "gold", totalVotes: 3421, followersCount: 2100, librariesIncludedIn: ["l5"],
  },
  {
    id: "f8", name: "Tatiana", category: "food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    score: 155, tier: "gold", totalVotes: 1847, followersCount: 1340, librariesIncludedIn: [],
  },
  {
    id: "f9", name: "Taco Bell Crunchwrap Supreme", category: "food",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop",
    score: 120, tier: "gold", totalVotes: 9870, followersCount: 4320, librariesIncludedIn: ["l1"],
  },
  {
    id: "f10", name: "Sweetgreen", category: "food",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    score: 85, tier: "gold", totalVotes: 5640, followersCount: 2310, librariesIncludedIn: [],
  },
  {
    id: "f11", name: "Pizzeria Beddia", category: "food",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    score: 95, tier: "gold", totalVotes: 1256, followersCount: 890, librariesIncludedIn: [],
  },
  {
    id: "f12", name: "McDonald's Fries", category: "food",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop",
    score: 445, tier: "platinum", totalVotes: 22100, followersCount: 11200, librariesIncludedIn: ["l1"], trending: "down",
  },
  {
    id: "f13", name: "Chipotle Burrito Bowl", category: "food",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
    score: 35, tier: "silver", totalVotes: 8930, followersCount: 3210, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f14", name: "Crumbl Cookies", category: "food",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
    score: -20, tier: "silver", totalVotes: 7650, followersCount: 2890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f15", name: "Olive Garden Breadsticks", category: "food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
    score: 15, tier: "silver", totalVotes: 6430, followersCount: 1870, librariesIncludedIn: [],
  },
  {
    id: "f16", name: "Raising Cane's", category: "food",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
    score: 320, tier: "platinum", totalVotes: 9870, followersCount: 5670, librariesIncludedIn: ["l1"], trending: "up",
  },
  {
    id: "f17", name: "Levain Bakery Cookies", category: "food",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
    score: 175, tier: "gold", totalVotes: 3450, followersCount: 2100, librariesIncludedIn: [],
  },
  {
    id: "f18", name: "Whataburger", category: "food",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop",
    score: 260, tier: "platinum", totalVotes: 7890, followersCount: 4560, librariesIncludedIn: ["l1"],
  },
  {
    id: "f19", name: "Subway", category: "food",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&h=600&fit=crop",
    score: -65, tier: "bronze", totalVotes: 12340, followersCount: 1230, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f20", name: "Momofuku Noodle Bar", category: "food",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    score: 280, tier: "platinum", totalVotes: 4560, followersCount: 2890, librariesIncludedIn: ["l5"], recentlyAdded: true,
  },
];

const foodLocationByEntityId: Record<string, FoodLocation[]> = {
  f1: [
    { id: "f1-la", restaurant: "Costco", address: "2901 Los Feliz Blvd", city: "Los Angeles, CA", location: "United States", score: 640, tier: "elite", totalVotes: 3200, trending: "up" },
    { id: "f1-sf", restaurant: "Costco", address: "450 10th St", city: "San Francisco, CA", location: "United States", score: 580, tier: "elite", totalVotes: 2100 },
    { id: "f1-phx", restaurant: "Costco", address: "2501 W Happy Valley Rd", city: "Phoenix, AZ", location: "United States", score: 420, tier: "platinum", totalVotes: 1800 },
  ],
  f2: [
    { id: "f2-atl-mid", restaurant: "Chick-fil-A", address: "1000 Peachtree St NE", city: "Atlanta, GA", location: "United States", score: 610, tier: "elite", totalVotes: 3100, trending: "up" },
    { id: "f2-atl-buck", restaurant: "Chick-fil-A", address: "3340 Peachtree Rd NE", city: "Atlanta, GA", location: "United States", score: 520, tier: "elite", totalVotes: 2300 },
    { id: "f2-dal", restaurant: "Chick-fil-A", address: "1717 N Haskell Ave", city: "Dallas, TX", location: "United States", score: 520, tier: "elite", totalVotes: 4100 },
    { id: "f2-nyc", restaurant: "Chick-fil-A", address: "1440 Broadway", city: "New York, NY", location: "United States", score: 180, tier: "gold", totalVotes: 2900, trending: "down" },
  ],
  f3: [
    { id: "f3-la-west", restaurant: "In-N-Out Burger", address: "914 Gayley Ave", city: "Los Angeles, CA", location: "United States", score: 540, tier: "elite", totalVotes: 5200 },
    { id: "f3-la-culver", restaurant: "In-N-Out Burger", address: "13450 Washington Blvd", city: "Los Angeles, CA", location: "United States", score: 495, tier: "platinum", totalVotes: 3700 },
    { id: "f3-sd", restaurant: "In-N-Out Burger", address: "4190 Camino Del Rio S", city: "San Diego, CA", location: "United States", score: 490, tier: "platinum", totalVotes: 6200 },
    { id: "f3-provo-univ", restaurant: "In-N-Out Burger", address: "1345 N Freedom Blvd", city: "Provo, UT", location: "United States", score: 490, tier: "platinum", totalVotes: 1800, trending: "up" },
    { id: "f3-provo-state", restaurant: "In-N-Out Burger", address: "350 S State St", city: "Provo, UT", location: "United States", score: 455, tier: "platinum", totalVotes: 1500 },
    { id: "f3-vegas", restaurant: "In-N-Out Burger", address: "4880 Dean Martin Dr", city: "Las Vegas, NV", location: "United States", score: 310, tier: "platinum", totalVotes: 3400, trending: "down" },
  ],
  f6: [
    { id: "f6-la", restaurant: "Bavel", address: "500 Mateo St #102", city: "Los Angeles, CA", location: "United States", score: 240, tier: "platinum", totalVotes: 1890, trending: "up" },
  ],
  f7: [
    { id: "f7-la", restaurant: "Republique", address: "624 S La Brea Ave", city: "Los Angeles, CA", location: "United States", score: 195, tier: "gold", totalVotes: 2100 },
  ],
  f9: [
    { id: "f9-austin-congress", restaurant: "Taco Bell", address: "2200 S Congress Ave", city: "Austin, TX", location: "United States", score: 155, tier: "gold", totalVotes: 2400 },
    { id: "f9-austin-lamar", restaurant: "Taco Bell", address: "4301 N Lamar Blvd", city: "Austin, TX", location: "United States", score: 120, tier: "gold", totalVotes: 1800 },
    { id: "f9-chi", restaurant: "Taco Bell", address: "235 S Wacker Dr", city: "Chicago, IL", location: "United States", score: 95, tier: "gold", totalVotes: 3100 },
    { id: "f9-la", restaurant: "Taco Bell", address: "7300 Sunset Blvd", city: "Los Angeles, CA", location: "United States", score: 40, tier: "silver", totalVotes: 2560, trending: "down" },
  ],
  f12: [
    { id: "f12-nyc-times", restaurant: "McDonald's", address: "1560 Broadway", city: "New York, NY", location: "United States", score: 360, tier: "platinum", totalVotes: 4100 },
    { id: "f12-nyc-34th", restaurant: "McDonald's", address: "341 5th Ave", city: "New York, NY", location: "United States", score: 400, tier: "platinum", totalVotes: 3800 },
    { id: "f12-chi", restaurant: "McDonald's", address: "600 N Clark St", city: "Chicago, IL", location: "United States", score: 460, tier: "platinum", totalVotes: 4800 },
    { id: "f12-paris", restaurant: "McDonald's", address: "140 Rue de Rivoli", city: "Paris, France", location: "France", score: 290, tier: "platinum", totalVotes: 2100, trending: "up" },
  ],
  f16: [
    { id: "f16-hou", restaurant: "Raising Cane's", address: "1310 W Alabama St", city: "Houston, TX", location: "United States", score: 380, tier: "platinum", totalVotes: 3200, trending: "up" },
    { id: "f16-nola", restaurant: "Raising Cane's", address: "3000 Tulane Ave", city: "New Orleans, LA", location: "United States", score: 340, tier: "platinum", totalVotes: 2800 },
    { id: "f16-den", restaurant: "Raising Cane's", address: "1550 Champa St", city: "Denver, CO", location: "United States", score: 210, tier: "gold", totalVotes: 1900 },
  ],
  f18: [
    { id: "f18-sa", restaurant: "Whataburger", address: "2424 N Loop 1604 W", city: "San Antonio, TX", location: "United States", score: 310, tier: "platinum", totalVotes: 4100 },
    { id: "f18-hou", restaurant: "Whataburger", address: "9450 Westheimer Rd", city: "Houston, TX", location: "United States", score: 280, tier: "platinum", totalVotes: 3600 },
    { id: "f18-aus", restaurant: "Whataburger", address: "2100 S Lamar Blvd", city: "Austin, TX", location: "United States", score: 265, tier: "platinum", totalVotes: 3200 },
  ],
  f19: [
    { id: "f19-nyc", restaurant: "Subway", address: "1 Times Sq", city: "New York, NY", location: "United States", score: -40, tier: "bronze", totalVotes: 3200, trending: "down" },
    { id: "f19-bos", restaurant: "Subway", address: "699 Boylston St", city: "Boston, MA", location: "United States", score: -55, tier: "bronze", totalVotes: 2800, trending: "down" },
    { id: "f19-sea", restaurant: "Subway", address: "1520 4th Ave", city: "Seattle, WA", location: "United States", score: -80, tier: "bronze", totalVotes: 2100, trending: "down" },
  ],
};

const singleRestaurantLocations: Record<string, { address: string; city: string }> = {
  f4: { address: "23 Commerce St", city: "New York, NY" },
  f5: { address: "Online / grocery", city: "United States" },
  f8: { address: "10 Lincoln Center Plaza", city: "New York, NY" },
  f10: { address: "630 Lexington Ave", city: "New York, NY" },
  f11: { address: "1520 E Montgomery Ave", city: "Philadelphia, PA" },
  f13: { address: "Chipotle locations vary", city: "United States" },
  f14: { address: "Crumbl locations vary", city: "United States" },
  f15: { address: "Olive Garden locations vary", city: "United States" },
  f17: { address: "167 W 74th St", city: "New York, NY" },
  f20: { address: "171 1st Ave", city: "New York, NY" },
};

for (const food of foods) {
  const fallback = singleRestaurantLocations[food.id] ?? {
    address: food.name,
    city: "United States",
  };

  food.foodLocations =
    foodLocationByEntityId[food.id] ??
    [
      {
        id: `${food.id}-main`,
        restaurant: food.name,
        address: fallback.address,
        city: fallback.city,
        location: "United States",
        score: food.score,
        tier: food.tier,
        totalVotes: food.totalVotes,
        trending: food.trending,
      },
    ];
}

export function getFoodRegions(locations: FoodLocation[]): string[] {
  return [
    ...new Set(
      locations
        .map((entry) => entry.location)
        .filter((location): location is string => !!location),
    ),
  ].sort();
}

export function filterFoodLocations(
  locations: FoodLocation[],
  query: string,
  region: string,
): FoodLocation[] {
  const q = normalizeSearchText(query);
  return locations.filter((entry) => {
    const matchesRegion = region === "all" || entry.location === region;
    if (!q) return matchesRegion;
    return matchesRegion && foodLocationMatchesQuery(entry, query);
  });
}

export function foodLocationMatchesQuery(
  entry: FoodLocation,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const texts = [
    entry.restaurant,
    entry.address,
    entry.city,
    entry.location,
    formatFoodLocationLabel(entry),
  ].map(normalizeSearchText);

  const combined = texts.join(" ");

  if (texts.some((text) => text.includes(normalizedQuery))) {
    return true;
  }

  if (combined.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return tokens.every((token) => combined.includes(token));
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEntitySearchTexts(entity: Entity): string[] {
  const texts = [entity.name];
  if (entity.location) texts.push(entity.location);
  if (entity.foodLocations) {
    for (const entry of entity.foodLocations) {
      texts.push(
        entry.restaurant,
        entry.address,
        entry.city,
        entry.location,
        formatFoodLocationLabel(entry),
      );
    }
  }
  return texts.map(normalizeSearchText);
}

export function entityMatchesQuery(entity: Entity, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const texts = getEntitySearchTexts(entity);
  const combined = texts.join(" ");

  if (texts.some((text) => text.includes(normalizedQuery))) {
    return true;
  }

  if (combined.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return tokens.every((token) => combined.includes(token));
}

export function libraryMatchesQuery(library: Library, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const texts = [
    library.name,
    library.description,
    library.creator.displayName,
    library.creator.username,
    library.location ?? "",
  ].map(normalizeSearchText);

  const combined = texts.join(" ");

  if (texts.some((text) => text.includes(normalizedQuery))) {
    return true;
  }

  if (combined.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return tokens.every((token) => combined.includes(token));
}

// ─── PLACES (20) ────────────────────────────────────

export const places: Entity[] = [
  {
    id: "p1", name: "Kyoto Bamboo Grove", category: "places", location: "Japan",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop",
    score: 720, tier: "elite", totalVotes: 4521, followersCount: 6780, librariesIncludedIn: ["l2", "l4"],
  },
  {
    id: "p2", name: "Santorini", category: "places", location: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    score: 680, tier: "elite", totalVotes: 3876, followersCount: 5430, librariesIncludedIn: ["l2"],
  },
  {
    id: "p3", name: "Zion National Park", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop",
    score: 590, tier: "elite", totalVotes: 5230, followersCount: 4320, librariesIncludedIn: ["l2"],
  },
  {
    id: "p4", name: "Amalfi Coast", category: "places", location: "Italy",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&h=600&fit=crop",
    score: 510, tier: "elite", totalVotes: 2987, followersCount: 3890, librariesIncludedIn: ["l2"], trending: "up",
  },
  {
    id: "p5", name: "Banff / Lake Louise", category: "places", location: "Canada",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
    score: 560, tier: "elite", totalVotes: 3156, followersCount: 4100, librariesIncludedIn: ["l2"],
  },
  {
    id: "p6", name: "Patagonia", category: "places", location: "Chile & Argentina",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
    score: 430, tier: "platinum", totalVotes: 2340, followersCount: 2890, librariesIncludedIn: ["l2"], trending: "up",
  },
  {
    id: "p7", name: "Iceland Ring Road", category: "places", location: "Iceland",
    image: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&h=600&fit=crop",
    score: 380, tier: "platinum", totalVotes: 2890, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "p8", name: "Tokyo", category: "places", location: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    score: 620, tier: "elite", totalVotes: 6780, followersCount: 7890, librariesIncludedIn: ["l4"], trending: "up",
  },
  {
    id: "p9", name: "Machu Picchu", category: "places", location: "Peru",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop",
    score: 490, tier: "platinum", totalVotes: 3450, followersCount: 3670, librariesIncludedIn: ["l2"],
  },
  {
    id: "p10", name: "Bali", category: "places", location: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    score: 310, tier: "platinum", totalVotes: 4560, followersCount: 3450, librariesIncludedIn: [],
  },
  {
    id: "p11", name: "New York City", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    score: 550, tier: "elite", totalVotes: 8920, followersCount: 6540, librariesIncludedIn: [],
  },
  {
    id: "p12", name: "Swiss Alps", category: "places", location: "Switzerland",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop",
    score: 420, tier: "platinum", totalVotes: 2670, followersCount: 2340, librariesIncludedIn: [],
  },
  {
    id: "p13", name: "Grand Canyon", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop",
    score: 470, tier: "platinum", totalVotes: 5670, followersCount: 3890, librariesIncludedIn: ["l2"],
  },
  {
    id: "p14", name: "Marrakech Medina", category: "places", location: "Morocco",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop",
    score: 160, tier: "gold", totalVotes: 1890, followersCount: 1230, librariesIncludedIn: [],
  },
  {
    id: "p15", name: "Dubrovnik", category: "places", location: "Croatia",
    image: "https://images.unsplash.com/photo-1555990538-1a0f4b5b6b0a?w=800&h=600&fit=crop",
    score: 230, tier: "platinum", totalVotes: 2340, followersCount: 1890, librariesIncludedIn: [],
  },
  {
    id: "p16", name: "Cancun Hotel Zone", category: "places", location: "Mexico",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop",
    score: -10, tier: "silver", totalVotes: 4560, followersCount: 1560, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "p17", name: "Maldives", category: "places", location: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop",
    score: 350, tier: "platinum", totalVotes: 2100, followersCount: 2670, librariesIncludedIn: [],
  },
  {
    id: "p18", name: "Yellowstone", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1565018054866-968e244671af?w=800&h=600&fit=crop",
    score: 410, tier: "platinum", totalVotes: 4320, followersCount: 3120, librariesIncludedIn: ["l2"],
  },
  {
    id: "p19", name: "Times Square", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
    score: -80, tier: "bronze", totalVotes: 7890, followersCount: 980, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "p20", name: "Yosemite Valley", category: "places", location: "United States",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
    score: 530, tier: "elite", totalVotes: 4890, followersCount: 4230, librariesIncludedIn: ["l2"], recentlyAdded: true,
  },
];

// ─── MOVIES / SHOWS (20) ────────────────────────────

export const moviesShows: Entity[] = [
  {
    id: "m1", name: "Breaking Bad", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    score: 890, tier: "elite", totalVotes: 45200, followersCount: 28900, librariesIncludedIn: ["l3"],
  },
  {
    id: "m2", name: "Severance", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
    score: 720, tier: "elite", totalVotes: 34210, followersCount: 19800, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m3", name: "The Bear", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop",
    score: 580, tier: "elite", totalVotes: 28930, followersCount: 15600, librariesIncludedIn: ["l3"],
  },
  {
    id: "m4", name: "Shogun", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop",
    score: 650, tier: "elite", totalVotes: 41200, followersCount: 22300, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m5", name: "Oppenheimer", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    score: 510, tier: "elite", totalVotes: 52340, followersCount: 18700, librariesIncludedIn: ["l3"],
  },
  {
    id: "m6", name: "Past Lives", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop",
    score: 380, tier: "platinum", totalVotes: 15670, followersCount: 8920, librariesIncludedIn: [],
  },
  {
    id: "m7", name: "Succession", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    score: 760, tier: "elite", totalVotes: 38900, followersCount: 21400, librariesIncludedIn: ["l3"],
  },
  {
    id: "m8", name: "The White Lotus", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=600&fit=crop",
    score: 340, tier: "platinum", totalVotes: 22100, followersCount: 11200, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m9", name: "Parasite", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=600&fit=crop",
    score: 810, tier: "elite", totalVotes: 43200, followersCount: 24500, librariesIncludedIn: ["l3"],
  },
  {
    id: "m10", name: "Everything Everywhere All at Once", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=800&h=600&fit=crop",
    score: 560, tier: "elite", totalVotes: 31200, followersCount: 16800, librariesIncludedIn: ["l3"],
  },
  {
    id: "m11", name: "Dune: Part Two", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
    score: 470, tier: "platinum", totalVotes: 28900, followersCount: 14200, librariesIncludedIn: [], trending: "up",
  },
  {
    id: "m12", name: "Slow Horses", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    score: 290, tier: "platinum", totalVotes: 8900, followersCount: 5670, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "m13", name: "The Substance", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=600&fit=crop",
    score: 220, tier: "platinum", totalVotes: 12300, followersCount: 7890, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "m14", name: "Emily in Paris", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop",
    score: -45, tier: "silver", totalVotes: 18900, followersCount: 4560, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m15", name: "Fallout", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1542397284385-6010376c5337?w=800&h=600&fit=crop",
    score: 410, tier: "platinum", totalVotes: 21400, followersCount: 12100, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m16", name: "Killers of the Flower Moon", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    score: 320, tier: "platinum", totalVotes: 16700, followersCount: 8900, librariesIncludedIn: [],
  },
  {
    id: "m17", name: "Beef", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=600&fit=crop",
    score: 380, tier: "platinum", totalVotes: 14500, followersCount: 7890, librariesIncludedIn: [],
  },
  {
    id: "m18", name: "Riverdale", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop",
    score: -90, tier: "bronze", totalVotes: 11200, followersCount: 890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m19", name: "Andor", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1533613220915-609f661697d4?w=800&h=600&fit=crop",
    score: 520, tier: "elite", totalVotes: 19800, followersCount: 11200, librariesIncludedIn: ["l3"],
  },
  {
    id: "m20", name: "Ripley", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    score: 310, tier: "platinum", totalVotes: 9800, followersCount: 5670, librariesIncludedIn: [], recentlyAdded: true,
  },
];

// ─── ENTERTAINMENT (20) ────────────────────────────

export const entertainmentEntities: Entity[] = [
  {
    id: "e1", name: "Disneyland", category: "entertainment",
    image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800&h=600&fit=crop",
    score: 740, tier: "elite", totalVotes: 32100, followersCount: 19800, librariesIncludedIn: ["l6"], trending: "up",
  },
  {
    id: "e2", name: "Coachella", category: "entertainment",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    score: 180, tier: "gold", totalVotes: 12540, followersCount: 6780, librariesIncludedIn: ["l6"], trending: "down",
  },
  {
    id: "e3", name: "Sleep No More", category: "entertainment",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop",
    score: 420, tier: "platinum", totalVotes: 6780, followersCount: 4320, librariesIncludedIn: ["l6"],
  },
  {
    id: "e4", name: "teamLab Borderless", category: "entertainment",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop",
    score: 530, tier: "elite", totalVotes: 8920, followersCount: 6540, librariesIncludedIn: ["l4", "l6"],
  },
  {
    id: "e5", name: "Comedy Cellar", category: "entertainment",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
    score: 350, tier: "platinum", totalVotes: 4320, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "e6", name: "Meow Wolf Omega Mart", category: "entertainment",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
    score: 460, tier: "platinum", totalVotes: 7650, followersCount: 5430, librariesIncludedIn: ["l6"], trending: "up",
  },
  {
    id: "e7", name: "Broadway - Hamilton", category: "entertainment",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=600&fit=crop",
    score: 620, tier: "elite", totalVotes: 24500, followersCount: 14200, librariesIncludedIn: ["l6"],
  },
  {
    id: "e8", name: "Super Nintendo World", category: "entertainment",
    image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800&h=600&fit=crop",
    score: 390, tier: "platinum", totalVotes: 11200, followersCount: 7890, librariesIncludedIn: ["l6"], recentlyAdded: true,
  },
  {
    id: "e9", name: "Burning Man", category: "entertainment",
    image: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&h=600&fit=crop",
    score: 110, tier: "gold", totalVotes: 8900, followersCount: 3450, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e10", name: "Sphere Las Vegas", category: "entertainment",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    score: 280, tier: "platinum", totalVotes: 9870, followersCount: 5670, librariesIncludedIn: [], trending: "up",
  },
  {
    id: "e11", name: "Secret Cinema", category: "entertainment",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    score: 190, tier: "gold", totalVotes: 3450, followersCount: 2100, librariesIncludedIn: [],
  },
  {
    id: "e12", name: "Museum of Ice Cream", category: "entertainment",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&h=600&fit=crop",
    score: -30, tier: "silver", totalVotes: 6780, followersCount: 1890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e13", name: "Escape Room - The Basement", category: "entertainment",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&h=600&fit=crop",
    score: 250, tier: "platinum", totalVotes: 2340, followersCount: 1560, librariesIncludedIn: [],
  },
  {
    id: "e14", name: "Comic-Con International", category: "entertainment",
    image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=600&fit=crop",
    score: 310, tier: "platinum", totalVotes: 14500, followersCount: 8900, librariesIncludedIn: [],
  },
  {
    id: "e15", name: "Top Golf", category: "entertainment",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
    score: 140, tier: "gold", totalVotes: 7890, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "e16", name: "Blue Man Group", category: "entertainment",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop",
    score: 65, tier: "gold", totalVotes: 5670, followersCount: 2340, librariesIncludedIn: [],
  },
  {
    id: "e17", name: "Cirque du Soleil - O", category: "entertainment",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop",
    score: 440, tier: "platinum", totalVotes: 8900, followersCount: 5430, librariesIncludedIn: ["l6"],
  },
  {
    id: "e18", name: "NFT Art Exhibition", category: "entertainment",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop",
    score: -70, tier: "bronze", totalVotes: 4560, followersCount: 450, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e19", name: "Alamo Drafthouse Cinema", category: "entertainment",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    score: 370, tier: "platinum", totalVotes: 6780, followersCount: 4320, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "e20", name: "Dave & Buster's", category: "entertainment",
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=600&fit=crop",
    score: 10, tier: "silver", totalVotes: 5670, followersCount: 1230, librariesIncludedIn: [],
  },
];

// ─── ALL ENTITIES ───────────────────────────────────

export const allEntities: Entity[] = [...foods, ...places, ...moviesShows, ...entertainmentEntities];

const entityLocationById: Record<string, string> = {
  f1: "United States", f2: "United States", f3: "United States", f4: "United States",
  f5: "United States", f6: "United States", f7: "United States", f8: "United States",
  f9: "United States", f10: "United States", f11: "United States", f12: "United States",
  f13: "United States", f14: "United States", f15: "United States", f16: "United States",
  f17: "United States", f18: "United States", f19: "United States", f20: "United States",
  m1: "United States", m2: "United States", m3: "United States", m4: "Japan",
  m5: "United States", m6: "South Korea", m7: "United States", m8: "United States",
  m9: "South Korea", m10: "United States", m11: "United States", m12: "United Kingdom",
  m13: "United States", m14: "France", m15: "United States", m16: "United States",
  m17: "United States", m18: "United States", m19: "United States", m20: "Italy",
  e1: "United States", e2: "United States", e3: "United States", e4: "Japan",
  e5: "United States", e6: "United States", e7: "United States", e8: "Japan",
  e9: "United States", e10: "United States", e11: "United Kingdom", e12: "United States",
  e13: "United States", e14: "United States", e15: "United States", e16: "United States",
  e17: "United States", e18: "United States", e19: "United States", e20: "United States",
};

for (const entity of allEntities) {
  if (!entity.location && entityLocationById[entity.id]) {
    entity.location = entityLocationById[entity.id];
  }
}

export const entityRegions = [
  ...new Set(
    allEntities
      .map((e) => e.location)
      .filter((location): location is string => !!location),
  ),
].sort();

// ─── LIBRARIES ──────────────────────────────────────

export const libraries: Library[] = [
  {
    id: "l1", name: "Fast Food Hall of Fame", description: "The chains that earned their reputation.",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    entityCount: 24, followerCount: 4890, creator: users[1],
    entityIds: ["f1", "f2", "f3", "f5", "f9", "f12", "f16", "f18"], isPublic: true,
  },
  {
    id: "l2", name: "Must-Visit Natural Wonders", description: "Places that make you feel small in the best way.",
    coverImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop",
    entityCount: 18, followerCount: 6420, creator: users[2],
    entityIds: ["p1", "p2", "p3", "p4", "p5", "p9", "p13", "p18", "p20"], isPublic: true,
  },
  {
    id: "l3", name: "Peak Television", description: "Shows that define the golden age.",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
    entityCount: 31, followerCount: 8650, creator: users[3],
    entityIds: ["m1", "m2", "m3", "m4", "m5", "m7", "m9", "m10", "m15", "m19"], isPublic: true,
  },
  {
    id: "l4", name: "Tokyo in 72 Hours", description: "Everything you need in a long weekend in Tokyo.",
    coverImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop",
    entityCount: 15, followerCount: 3310, creator: users[4],
    entityIds: ["p1", "p8", "e4"], isPublic: true,
    isLocationBased: true, location: "Tokyo, Japan",
  },
  {
    id: "l5", name: "LA Food Scene", description: "The definitive guide to eating well in Los Angeles.",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    entityCount: 42, followerCount: 5670, creator: users[1],
    entityIds: ["f1", "f3", "f4", "f6", "f7", "f20"], isPublic: true,
    isLocationBased: true, location: "Los Angeles, CA",
  },
  {
    id: "l6", name: "Weekend Experiences", description: "Immersive experiences worth your Saturday.",
    coverImage: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
    entityCount: 20, followerCount: 2540, creator: currentUser,
    entityIds: ["e1", "e2", "e3", "e4", "e6", "e7", "e8", "e17"], isPublic: true,
  },
];

// ─── ACTIVITY FEED ──────────────────────────────────

export const activityFeed: ActivityItem[] = [
  {
    id: "a1", type: "promote", userName: "Michael D.", userAvatar: users[0].avatar,
    entityName: "Costco Pizza", entityId: "f1", timestamp: "2m ago",
  },
  {
    id: "a2", type: "tier_up", entityName: "Costco Pizza", entityId: "f1",
    tier: "elite", previousTier: "platinum", timestamp: "5m ago",
  },
  {
    id: "a3", type: "create_library", userName: "Sarah Chen", userAvatar: users[1].avatar,
    libraryName: "Fast Food Hall of Fame", timestamp: "12m ago",
  },
  {
    id: "a4", type: "promote", userName: "Emily Rodriguez", userAvatar: users[3].avatar,
    entityName: "Severance", entityId: "m2", timestamp: "18m ago",
  },
  {
    id: "a5", type: "tier_up", entityName: "Breaking Bad", entityId: "m1",
    tier: "elite", previousTier: "platinum", timestamp: "25m ago",
  },
  {
    id: "a6", type: "demote", userName: "Alex Kim", userAvatar: users[4].avatar,
    entityName: "Subway", entityId: "f19", timestamp: "32m ago",
  },
  {
    id: "a7", type: "tier_down", entityName: "Times Square", entityId: "p19",
    tier: "bronze", previousTier: "silver", timestamp: "45m ago",
  },
  {
    id: "a8", type: "promote", userName: "James Wilson", userAvatar: users[2].avatar,
    entityName: "Disneyland", entityId: "e1", timestamp: "1h ago",
  },
  {
    id: "a9", type: "follow", userName: "Sarah Chen", userAvatar: users[1].avatar,
    entityName: "Chick-fil-A", entityId: "f2", timestamp: "1h ago",
  },
  {
    id: "a10", type: "tier_down", entityName: "Coachella", entityId: "e2",
    tier: "gold", previousTier: "platinum", timestamp: "2h ago",
  },
  {
    id: "a11", type: "promote", userName: "Michael D.", userAvatar: users[0].avatar,
    entityName: "Kyoto Bamboo Grove", entityId: "p1", timestamp: "2h ago",
  },
  {
    id: "a12", type: "demote", userName: "Emily Rodriguez", userAvatar: users[3].avatar,
    entityName: "Emily in Paris", entityId: "m14", timestamp: "3h ago",
  },
  {
    id: "a13", type: "tier_up", entityName: "Raising Cane's", entityId: "f16",
    tier: "platinum", previousTier: "gold", timestamp: "3h ago",
  },
  {
    id: "a14", type: "promote", userName: "Alex Kim", userAvatar: users[4].avatar,
    entityName: "Momofuku Noodle Bar", entityId: "f20", timestamp: "4h ago",
  },
  {
    id: "a15", type: "tier_down", entityName: "Riverdale", entityId: "m18",
    tier: "bronze", previousTier: "silver", timestamp: "5h ago",
  },
  {
    id: "a16", type: "promote", userName: "James Wilson", userAvatar: users[2].avatar,
    entityName: "Amalfi Coast", entityId: "p4", timestamp: "5h ago",
  },
  {
    id: "a17", type: "maintain", userName: "Sarah Chen", userAvatar: users[1].avatar,
    entityName: "In-N-Out Burger", entityId: "f3", timestamp: "6h ago",
  },
  {
    id: "a18", type: "create_library", userName: "James Wilson", userAvatar: users[2].avatar,
    libraryName: "Must-Visit Natural Wonders", timestamp: "8h ago",
  },
];

// ─── USER VOTES (current user's votes) ─────────────

export const userVotes: Vote[] = [
  { id: "v1", userId: "u1", entityId: "f1", voteType: "promote" },
  { id: "v2", userId: "u1", entityId: "f2", voteType: "promote", foodLocationId: "f2-atl-mid" },
  { id: "v3", userId: "u1", entityId: "m1", voteType: "promote" },
  { id: "v4", userId: "u1", entityId: "m2", voteType: "promote" },
  { id: "v5", userId: "u1", entityId: "p1", voteType: "promote" },
  { id: "v6", userId: "u1", entityId: "e1", voteType: "promote" },
  { id: "v7", userId: "u1", entityId: "f19", voteType: "demote" },
  { id: "v8", userId: "u1", entityId: "p19", voteType: "demote" },
  { id: "v9", userId: "u1", entityId: "f3", voteType: "maintain", foodLocationId: "f3-la-west" },
  { id: "v10", userId: "u1", entityId: "m7", voteType: "promote" },
];

// ─── USER'S LIKED ENTITIES (seed) ───────────────────

export const seedLikedEntityIds: string[] = [
  "f1", "f2", "f3", "m1", "m2", "m4", "p1", "p8", "e1", "e4",
];

// ─── USER'S FOLLOWED CREATORS (seed) ────────────────

export const followedCreatorIds: string[] = ["u2", "u4", "u5"];
