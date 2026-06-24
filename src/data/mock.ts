export type Category = "food" | "places" | "entertainment" | "movies-shows";
export type Tier = "bronze" | "silver" | "gold" | "platinum" | "elite";
export type VoteType = "promote" | "maintain" | "demote";

export interface Entity {
  id: string;
  name: string;
  category: Category;
  image: string;
  description: string;
  score: number;
  tier: Tier;
  totalVotes: number;
  followersCount: number;
  librariesIncludedIn: string[];
  trending?: "up" | "down";
  recentlyAdded?: boolean;
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
    description: "The $1.99 slice that refuses to lose. Massive, cheesy, and absurdly consistent across every warehouse.",
    score: 612, tier: "elite", totalVotes: 14230, followersCount: 8920, librariesIncludedIn: ["l1", "l5"], trending: "up",
  },
  {
    id: "f2", name: "Chick-fil-A", category: "food",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop",
    description: "Pressure-cooked chicken sandwich with pickles on a buttered bun. Drive-through lines that wrap around the building.",
    score: 534, tier: "elite", totalVotes: 18450, followersCount: 12100, librariesIncludedIn: ["l1"], trending: "up",
  },
  {
    id: "f3", name: "In-N-Out Burger", category: "food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    description: "Animal Style everything. Fresh ingredients, secret menu, and a cult following that spans generations.",
    score: 480, tier: "platinum", totalVotes: 16800, followersCount: 9870, librariesIncludedIn: ["l1", "l5"],
  },
  {
    id: "f4", name: "Sushi Nakazawa", category: "food",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop",
    description: "Omakase experience from Jiro Dreams of Sushi alumni. 20-course tasting that redefines precision.",
    score: 340, tier: "platinum", totalVotes: 2103, followersCount: 1560, librariesIncludedIn: ["l5"],
  },
  {
    id: "f5", name: "Trader Joe's Orange Chicken", category: "food",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    description: "The frozen aisle champion. Crispy, tangy, and responsible for more weeknight dinners than any recipe book.",
    score: 390, tier: "platinum", totalVotes: 11200, followersCount: 5430, librariesIncludedIn: ["l1"],
  },
  {
    id: "f6", name: "Bavel", category: "food",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
    description: "Middle Eastern flavors in the Arts District. The lamb neck is unforgettable.",
    score: 210, tier: "platinum", totalVotes: 2890, followersCount: 1780, librariesIncludedIn: ["l5"], trending: "up",
  },
  {
    id: "f7", name: "Republique", category: "food",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    description: "French-inspired California cuisine in a historic building. Brunch is legendary.",
    score: 180, tier: "gold", totalVotes: 3421, followersCount: 2100, librariesIncludedIn: ["l5"],
  },
  {
    id: "f8", name: "Tatiana", category: "food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    description: "Upscale Dominican-American cuisine in Lincoln Center. Chef's tasting menu is a must.",
    score: 155, tier: "gold", totalVotes: 1847, followersCount: 1340, librariesIncludedIn: [],
  },
  {
    id: "f9", name: "Taco Bell Crunchwrap Supreme", category: "food",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop",
    description: "Hexagonal engineering at its finest. The perfect ratio of crunch to warm, wrapped in a griddled tortilla.",
    score: 120, tier: "gold", totalVotes: 9870, followersCount: 4320, librariesIncludedIn: ["l1"],
  },
  {
    id: "f10", name: "Sweetgreen", category: "food",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    description: "Seasonal salads that somehow make healthy eating feel like a lifestyle upgrade.",
    score: 85, tier: "gold", totalVotes: 5640, followersCount: 2310, librariesIncludedIn: [],
  },
  {
    id: "f11", name: "Pizzeria Beddia", category: "food",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    description: "Once called America's best pizza. Simple, perfect pies in a relaxed setting.",
    score: 95, tier: "gold", totalVotes: 1256, followersCount: 890, librariesIncludedIn: [],
  },
  {
    id: "f12", name: "McDonald's Fries", category: "food",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop",
    description: "Thin, salty, golden perfection. Best within the first three minutes. After that, all bets are off.",
    score: 445, tier: "platinum", totalVotes: 22100, followersCount: 11200, librariesIncludedIn: ["l1"], trending: "down",
  },
  {
    id: "f13", name: "Chipotle Burrito Bowl", category: "food",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
    description: "Customizable assembly line perfection. Double protein if you know how to ask.",
    score: 35, tier: "silver", totalVotes: 8930, followersCount: 3210, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f14", name: "Crumbl Cookies", category: "food",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
    description: "Rotating weekly flavors in pink boxes. Half the experience is the unboxing.",
    score: -20, tier: "silver", totalVotes: 7650, followersCount: 2890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f15", name: "Olive Garden Breadsticks", category: "food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
    description: "Unlimited, warm, brushed with garlic butter. The real reason anyone goes.",
    score: 15, tier: "silver", totalVotes: 6430, followersCount: 1870, librariesIncludedIn: [],
  },
  {
    id: "f16", name: "Raising Cane's", category: "food",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
    description: "Chicken fingers, Cane's sauce, Texas toast. One thing done exceptionally well.",
    score: 320, tier: "platinum", totalVotes: 9870, followersCount: 5670, librariesIncludedIn: ["l1"], trending: "up",
  },
  {
    id: "f17", name: "Levain Bakery Cookies", category: "food",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
    description: "Dense, gooey, six-ounce cookies. The chocolate chip walnut is legendary.",
    score: 175, tier: "gold", totalVotes: 3450, followersCount: 2100, librariesIncludedIn: [],
  },
  {
    id: "f18", name: "Whataburger", category: "food",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop",
    description: "Texas pride in a striped bag. The honey butter chicken biscuit is a state treasure.",
    score: 260, tier: "platinum", totalVotes: 7890, followersCount: 4560, librariesIncludedIn: ["l1"],
  },
  {
    id: "f19", name: "Subway", category: "food",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&h=600&fit=crop",
    description: "Choose your own adventure sandwich making. Quality varies wildly by location.",
    score: -65, tier: "bronze", totalVotes: 12340, followersCount: 1230, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "f20", name: "Momofuku Noodle Bar", category: "food",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    description: "David Chang's flagship. The pork buns changed the game for a generation of chefs.",
    score: 280, tier: "platinum", totalVotes: 4560, followersCount: 2890, librariesIncludedIn: ["l5"], recentlyAdded: true,
  },
];

// ─── PLACES (20) ────────────────────────────────────

export const places: Entity[] = [
  {
    id: "p1", name: "Kyoto Bamboo Grove", category: "places",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop",
    description: "Towering bamboo stalks create an otherworldly atmosphere in Arashiyama.",
    score: 720, tier: "elite", totalVotes: 4521, followersCount: 6780, librariesIncludedIn: ["l2", "l4"],
  },
  {
    id: "p2", name: "Santorini", category: "places",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    description: "Volcanic cliffs with iconic white and blue architecture overlooking the Aegean.",
    score: 680, tier: "elite", totalVotes: 3876, followersCount: 5430, librariesIncludedIn: ["l2"],
  },
  {
    id: "p3", name: "Zion National Park", category: "places",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop",
    description: "Red rock canyons and emerald pools. The Narrows hike is bucket-list worthy.",
    score: 590, tier: "elite", totalVotes: 5230, followersCount: 4320, librariesIncludedIn: ["l2"],
  },
  {
    id: "p4", name: "Amalfi Coast", category: "places",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&h=600&fit=crop",
    description: "Winding coastal roads with cliffside villages and turquoise Mediterranean waters.",
    score: 510, tier: "elite", totalVotes: 2987, followersCount: 3890, librariesIncludedIn: ["l2"], trending: "up",
  },
  {
    id: "p5", name: "Banff / Lake Louise", category: "places",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
    description: "Turquoise glacial lake surrounded by the Canadian Rockies. Stunning year-round.",
    score: 560, tier: "elite", totalVotes: 3156, followersCount: 4100, librariesIncludedIn: ["l2"],
  },
  {
    id: "p6", name: "Patagonia", category: "places",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
    description: "Torres del Paine and endless glaciers. The edge of the world has never looked better.",
    score: 430, tier: "platinum", totalVotes: 2340, followersCount: 2890, librariesIncludedIn: ["l2"], trending: "up",
  },
  {
    id: "p7", name: "Iceland Ring Road", category: "places",
    image: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&h=600&fit=crop",
    description: "Waterfalls, black sand beaches, glaciers, and hot springs on a single road trip.",
    score: 380, tier: "platinum", totalVotes: 2890, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "p8", name: "Tokyo", category: "places",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    description: "Neon-lit streets, ancient temples, and the best food city on Earth. Endlessly explorable.",
    score: 620, tier: "elite", totalVotes: 6780, followersCount: 7890, librariesIncludedIn: ["l4"], trending: "up",
  },
  {
    id: "p9", name: "Machu Picchu", category: "places",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop",
    description: "Ancient Incan citadel set high in the Andes. The Inca Trail approach is transformative.",
    score: 490, tier: "platinum", totalVotes: 3450, followersCount: 3670, librariesIncludedIn: ["l2"],
  },
  {
    id: "p10", name: "Bali", category: "places",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    description: "Rice terraces, temple ceremonies, and surf breaks. Spiritual and stunning.",
    score: 310, tier: "platinum", totalVotes: 4560, followersCount: 3450, librariesIncludedIn: [],
  },
  {
    id: "p11", name: "New York City", category: "places",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    description: "Eight million stories, limitless energy, and the feeling that anything is possible at 2 AM.",
    score: 550, tier: "elite", totalVotes: 8920, followersCount: 6540, librariesIncludedIn: [],
  },
  {
    id: "p12", name: "Swiss Alps", category: "places",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop",
    description: "Matterhorn views, chocolate, and trains that run on time through impossibly scenic routes.",
    score: 420, tier: "platinum", totalVotes: 2670, followersCount: 2340, librariesIncludedIn: [],
  },
  {
    id: "p13", name: "Grand Canyon", category: "places",
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop",
    description: "No photo prepares you for the scale. Billions of years of geology at your feet.",
    score: 470, tier: "platinum", totalVotes: 5670, followersCount: 3890, librariesIncludedIn: ["l2"],
  },
  {
    id: "p14", name: "Marrakech Medina", category: "places",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop",
    description: "Labyrinthine souks, rooftop terraces, and the call to prayer echoing across the city.",
    score: 160, tier: "gold", totalVotes: 1890, followersCount: 1230, librariesIncludedIn: [],
  },
  {
    id: "p15", name: "Dubrovnik", category: "places",
    image: "https://images.unsplash.com/photo-1555990538-1a0f4b5b6b0a?w=800&h=600&fit=crop",
    description: "Ancient walled city on the Adriatic. Walk the walls at sunset for an unforgettable experience.",
    score: 230, tier: "platinum", totalVotes: 2340, followersCount: 1890, librariesIncludedIn: [],
  },
  {
    id: "p16", name: "Cancun Hotel Zone", category: "places",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop",
    description: "All-inclusive resorts and turquoise Caribbean water. Spring break reputation is hard to shake.",
    score: -10, tier: "silver", totalVotes: 4560, followersCount: 1560, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "p17", name: "Maldives", category: "places",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop",
    description: "Overwater villas and coral reefs. Paradise defined, if you can afford it.",
    score: 350, tier: "platinum", totalVotes: 2100, followersCount: 2670, librariesIncludedIn: [],
  },
  {
    id: "p18", name: "Yellowstone", category: "places",
    image: "https://images.unsplash.com/photo-1565018054866-968e244671af?w=800&h=600&fit=crop",
    description: "Geysers, hot springs, bison herds, and wolves. America's first national park still delivers.",
    score: 410, tier: "platinum", totalVotes: 4320, followersCount: 3120, librariesIncludedIn: ["l2"],
  },
  {
    id: "p19", name: "Times Square", category: "places",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
    description: "Sensory overload in the best and worst ways. Locals avoid it. Tourists flock to it.",
    score: -80, tier: "bronze", totalVotes: 7890, followersCount: 980, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "p20", name: "Yosemite Valley", category: "places",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
    description: "Half Dome, El Capitan, and waterfalls that cascade thousands of feet. Ansel Adams was right.",
    score: 530, tier: "elite", totalVotes: 4890, followersCount: 4230, librariesIncludedIn: ["l2"], recentlyAdded: true,
  },
];

// ─── MOVIES / SHOWS (20) ────────────────────────────

export const moviesShows: Entity[] = [
  {
    id: "m1", name: "Breaking Bad", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    description: "A chemistry teacher becomes a drug kingpin. Five seasons of escalating tension with a perfect ending.",
    score: 890, tier: "elite", totalVotes: 45200, followersCount: 28900, librariesIncludedIn: ["l3"],
  },
  {
    id: "m2", name: "Severance", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
    description: "Employees undergo a procedure that separates work and personal memories. Gripping thriller.",
    score: 720, tier: "elite", totalVotes: 34210, followersCount: 19800, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m3", name: "The Bear", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop",
    description: "A fine-dining chef returns home to run the family sandwich shop. Raw and electrifying.",
    score: 580, tier: "elite", totalVotes: 28930, followersCount: 15600, librariesIncludedIn: ["l3"],
  },
  {
    id: "m4", name: "Shogun", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop",
    description: "Epic adaptation of feudal Japan. Stunning production and masterful storytelling.",
    score: 650, tier: "elite", totalVotes: 41200, followersCount: 22300, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m5", name: "Oppenheimer", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    description: "Christopher Nolan's biographical epic about the father of the atomic bomb.",
    score: 510, tier: "elite", totalVotes: 52340, followersCount: 18700, librariesIncludedIn: ["l3"],
  },
  {
    id: "m6", name: "Past Lives", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop",
    description: "Two childhood friends reconnect decades later. A meditation on fate and choices.",
    score: 380, tier: "platinum", totalVotes: 15670, followersCount: 8920, librariesIncludedIn: [],
  },
  {
    id: "m7", name: "Succession", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    description: "A media dynasty tears itself apart. Every character is terrible and you cannot look away.",
    score: 760, tier: "elite", totalVotes: 38900, followersCount: 21400, librariesIncludedIn: ["l3"],
  },
  {
    id: "m8", name: "The White Lotus", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=600&fit=crop",
    description: "Rich people behaving badly at luxury resorts. Social satire with real teeth.",
    score: 340, tier: "platinum", totalVotes: 22100, followersCount: 11200, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m9", name: "Parasite", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=600&fit=crop",
    description: "A poor family infiltrates a wealthy household. Genre-defying masterwork from Bong Joon-ho.",
    score: 810, tier: "elite", totalVotes: 43200, followersCount: 24500, librariesIncludedIn: ["l3"],
  },
  {
    id: "m10", name: "Everything Everywhere All at Once", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=800&h=600&fit=crop",
    description: "A laundromat owner discovers she must save the multiverse. Absurd, emotional, brilliant.",
    score: 560, tier: "elite", totalVotes: 31200, followersCount: 16800, librariesIncludedIn: ["l3"],
  },
  {
    id: "m11", name: "Dune: Part Two", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
    description: "Villeneuve delivers a sci-fi epic that earns every minute of its runtime. The sandworm ride scene is cinema.",
    score: 470, tier: "platinum", totalVotes: 28900, followersCount: 14200, librariesIncludedIn: [], trending: "up",
  },
  {
    id: "m12", name: "Slow Horses", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a92b7?w=800&h=600&fit=crop",
    description: "Gary Oldman leads a team of disgraced MI5 agents. The best spy show on television.",
    score: 290, tier: "platinum", totalVotes: 8900, followersCount: 5670, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "m13", name: "The Substance", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=600&fit=crop",
    description: "Body horror meets Hollywood satire. Demi Moore's comeback is as visceral as it is brilliant.",
    score: 220, tier: "platinum", totalVotes: 12300, followersCount: 7890, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "m14", name: "Emily in Paris", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop",
    description: "An American marketing exec in Paris. Hate-watch phenomenon that keeps getting renewed.",
    score: -45, tier: "silver", totalVotes: 18900, followersCount: 4560, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m15", name: "Fallout", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1542397284385-6010376c5337?w=800&h=600&fit=crop",
    description: "Post-apocalyptic adaptation that honors the games. The Ghoul steals every scene.",
    score: 410, tier: "platinum", totalVotes: 21400, followersCount: 12100, librariesIncludedIn: ["l3"], trending: "up",
  },
  {
    id: "m16", name: "Killers of the Flower Moon", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    description: "Scorsese chronicles the Osage murders. Three and a half hours that demand your attention.",
    score: 320, tier: "platinum", totalVotes: 16700, followersCount: 8900, librariesIncludedIn: [],
  },
  {
    id: "m17", name: "Beef", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=600&fit=crop",
    description: "A road rage incident spirals into mutual destruction. Steven Yeun and Ali Wong are phenomenal.",
    score: 380, tier: "platinum", totalVotes: 14500, followersCount: 7890, librariesIncludedIn: [],
  },
  {
    id: "m18", name: "Riverdale", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop",
    description: "Started as a teen mystery, ended as unhinged supernatural chaos. A cautionary tale in show-running.",
    score: -90, tier: "bronze", totalVotes: 11200, followersCount: 890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "m19", name: "Andor", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1533613220915-609f661697d4?w=800&h=600&fit=crop",
    description: "Star Wars for adults. A slow-burn revolution story that proves the franchise still has something to say.",
    score: 520, tier: "elite", totalVotes: 19800, followersCount: 11200, librariesIncludedIn: ["l3"],
  },
  {
    id: "m20", name: "Ripley", category: "movies-shows",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    description: "Black-and-white reimagining of The Talented Mr. Ripley. Andrew Scott is magnetic and terrifying.",
    score: 310, tier: "platinum", totalVotes: 9800, followersCount: 5670, librariesIncludedIn: [], recentlyAdded: true,
  },
];

// ─── ENTERTAINMENT (20) ────────────────────────────

export const entertainmentEntities: Entity[] = [
  {
    id: "e1", name: "Disneyland", category: "entertainment",
    image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800&h=600&fit=crop",
    description: "The original theme park. Space Mountain, churros, and childhood nostalgia weaponized into a full-day experience.",
    score: 740, tier: "elite", totalVotes: 32100, followersCount: 19800, librariesIncludedIn: ["l6"], trending: "up",
  },
  {
    id: "e2", name: "Coachella", category: "entertainment",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    description: "The premier music and arts festival in the California desert. As much about the scene as the music.",
    score: 180, tier: "gold", totalVotes: 12540, followersCount: 6780, librariesIncludedIn: ["l6"], trending: "down",
  },
  {
    id: "e3", name: "Sleep No More", category: "entertainment",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop",
    description: "Immersive theater experience across five floors. Macbeth reimagined as noir.",
    score: 420, tier: "platinum", totalVotes: 6780, followersCount: 4320, librariesIncludedIn: ["l6"],
  },
  {
    id: "e4", name: "teamLab Borderless", category: "entertainment",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop",
    description: "Digital art museum without boundaries. Interactive installations you walk through.",
    score: 530, tier: "elite", totalVotes: 8920, followersCount: 6540, librariesIncludedIn: ["l4", "l6"],
  },
  {
    id: "e5", name: "Comedy Cellar", category: "entertainment",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
    description: "Legendary comedy club in Greenwich Village. Surprise celebrity drop-ins nightly.",
    score: 350, tier: "platinum", totalVotes: 4320, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "e6", name: "Meow Wolf Omega Mart", category: "entertainment",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
    description: "Surreal grocery store turned immersive art installation. Nothing is what it seems.",
    score: 460, tier: "platinum", totalVotes: 7650, followersCount: 5430, librariesIncludedIn: ["l6"], trending: "up",
  },
  {
    id: "e7", name: "Broadway - Hamilton", category: "entertainment",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=600&fit=crop",
    description: "Hip-hop musical about Alexander Hamilton. Changed what theater could be.",
    score: 620, tier: "elite", totalVotes: 24500, followersCount: 14200, librariesIncludedIn: ["l6"],
  },
  {
    id: "e8", name: "Super Nintendo World", category: "entertainment",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop",
    description: "Walk through the Mushroom Kingdom. The Mario Kart ride uses AR in ways that actually work.",
    score: 390, tier: "platinum", totalVotes: 11200, followersCount: 7890, librariesIncludedIn: ["l6"], recentlyAdded: true,
  },
  {
    id: "e9", name: "Burning Man", category: "entertainment",
    image: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&h=600&fit=crop",
    description: "Art, community, and radical self-expression in the Nevada desert. Not for the faint of heart.",
    score: 110, tier: "gold", totalVotes: 8900, followersCount: 3450, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e10", name: "Sphere Las Vegas", category: "entertainment",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    description: "18,600 square meters of LED. The future of live entertainment, for better or worse.",
    score: 280, tier: "platinum", totalVotes: 9870, followersCount: 5670, librariesIncludedIn: [], trending: "up",
  },
  {
    id: "e11", name: "Secret Cinema", category: "entertainment",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    description: "Immersive film screenings where you become part of the movie. Dress code mandatory.",
    score: 190, tier: "gold", totalVotes: 3450, followersCount: 2100, librariesIncludedIn: [],
  },
  {
    id: "e12", name: "Museum of Ice Cream", category: "entertainment",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&h=600&fit=crop",
    description: "Instagram bait turned into a permanent installation. Sprinkle pool is the main attraction.",
    score: -30, tier: "silver", totalVotes: 6780, followersCount: 1890, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e13", name: "Escape Room - The Basement", category: "entertainment",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&h=600&fit=crop",
    description: "LA's most intense escape room. Not recommended for the claustrophobic.",
    score: 250, tier: "platinum", totalVotes: 2340, followersCount: 1560, librariesIncludedIn: [],
  },
  {
    id: "e14", name: "Comic-Con International", category: "entertainment",
    image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=600&fit=crop",
    description: "The mecca for pop culture. Hall H panels, exclusive merch, and cosplay that defies physics.",
    score: 310, tier: "platinum", totalVotes: 14500, followersCount: 8900, librariesIncludedIn: [],
  },
  {
    id: "e15", name: "Top Golf", category: "entertainment",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
    description: "Driving range meets sports bar. You do not need to know golf to have fun here.",
    score: 140, tier: "gold", totalVotes: 7890, followersCount: 3210, librariesIncludedIn: [],
  },
  {
    id: "e16", name: "Blue Man Group", category: "entertainment",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop",
    description: "Three bald, blue performers drumming, painting, and catching marshmallows. Weird and wonderful.",
    score: 65, tier: "gold", totalVotes: 5670, followersCount: 2340, librariesIncludedIn: [],
  },
  {
    id: "e17", name: "Cirque du Soleil - O", category: "entertainment",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop",
    description: "Aquatic acrobatics in a 1.5 million gallon pool. The best Cirque show, period.",
    score: 440, tier: "platinum", totalVotes: 8900, followersCount: 5430, librariesIncludedIn: ["l6"],
  },
  {
    id: "e18", name: "NFT Art Exhibition", category: "entertainment",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop",
    description: "Digital art on screens in a warehouse. Blockchain meets gallery culture.",
    score: -70, tier: "bronze", totalVotes: 4560, followersCount: 450, librariesIncludedIn: [], trending: "down",
  },
  {
    id: "e19", name: "Alamo Drafthouse Cinema", category: "entertainment",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    description: "Movies with food, strict no-talking policy, and specialty screenings. How cinema should be experienced.",
    score: 370, tier: "platinum", totalVotes: 6780, followersCount: 4320, librariesIncludedIn: [], recentlyAdded: true,
  },
  {
    id: "e20", name: "Dave & Buster's", category: "entertainment",
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=600&fit=crop",
    description: "Arcade games with overpriced drinks. Fun in groups, depressing alone.",
    score: 10, tier: "silver", totalVotes: 5670, followersCount: 1230, librariesIncludedIn: [],
  },
];

// ─── ALL ENTITIES ───────────────────────────────────

export const allEntities: Entity[] = [...foods, ...places, ...moviesShows, ...entertainmentEntities];

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
  },
  {
    id: "l5", name: "LA Food Scene", description: "The definitive guide to eating well in Los Angeles.",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    entityCount: 42, followerCount: 5670, creator: users[1],
    entityIds: ["f1", "f3", "f4", "f6", "f7", "f20"], isPublic: true,
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
  { id: "v2", userId: "u1", entityId: "f2", voteType: "promote" },
  { id: "v3", userId: "u1", entityId: "m1", voteType: "promote" },
  { id: "v4", userId: "u1", entityId: "m2", voteType: "promote" },
  { id: "v5", userId: "u1", entityId: "p1", voteType: "promote" },
  { id: "v6", userId: "u1", entityId: "e1", voteType: "promote" },
  { id: "v7", userId: "u1", entityId: "f19", voteType: "demote" },
  { id: "v8", userId: "u1", entityId: "p19", voteType: "demote" },
  { id: "v9", userId: "u1", entityId: "f3", voteType: "maintain" },
  { id: "v10", userId: "u1", entityId: "m7", voteType: "promote" },
];

// ─── USER'S FOLLOWED ENTITIES ───────────────────────

export const followedEntityIds: string[] = [
  "f1", "f2", "f3", "m1", "m2", "m4", "p1", "p8", "e1", "e4",
];
