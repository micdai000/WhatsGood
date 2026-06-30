-- Performance indexes

-- Profile lookups by username (profile pages, @mentions)
CREATE INDEX idx_profiles_username ON public.profiles (username);

-- Entity pages load by slug: /food/costco-pizza
CREATE INDEX idx_entities_slug ON public.entities (slug);

-- Category browse and filter tabs
CREATE INDEX idx_entities_category ON public.entities (category);

-- Location-based search ("places in Japan")
CREATE INDEX idx_entities_location ON public.entities (location);

-- Score-sorted leaderboards
CREATE INDEX idx_entities_score ON public.entities (score DESC);

-- Food location search by entity
CREATE INDEX idx_food_locations_entity ON public.food_locations (entity_id);

-- City/address search for food locations
CREATE INDEX idx_food_locations_city ON public.food_locations (city);

-- Loading a user's votes
CREATE INDEX idx_votes_user ON public.votes (user_id);

-- Loading votes for an entity
CREATE INDEX idx_votes_entity ON public.votes (entity_id);

-- Libraries by creator (profile page)
CREATE INDEX idx_libraries_creator ON public.libraries (creator_id);

-- Library items ordered within a library
CREATE INDEX idx_library_items_library ON public.library_items (library_id, position);

-- Activity feed sorted newest-first
CREATE INDEX idx_activity_created ON public.activity (created_at DESC);

-- Entity follows for "entities you follow"
CREATE INDEX idx_entity_follows_user ON public.entity_follows (user_id);
