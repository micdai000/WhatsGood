import { useState } from "react";
import {
  MapPin,
  ImageIcon,
  UtensilsCrossed,
  Building2,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabels, type Category } from "@/data/mock";

const categories: Category[] = ["food", "places", "entertainment", "movies-shows"];

type MediaType = "movie" | "show";

const categoryHints: Record<Category, string> = {
  food: "Food is rated at the exact restaurant address — not as a general consensus.",
  places: "Add a specific place people can search for by city or country.",
  entertainment: "Experiences are rated for the venue and city where they happen.",
  "movies-shows": "Add a film or series for the community to rank.",
};

const nameLabels: Record<Category, string> = {
  food: "Dish or item",
  places: "Place name",
  entertainment: "Experience or event",
  "movies-shows": "Title",
};

const namePlaceholders: Record<Category, string> = {
  food: "e.g. Spicy chicken sandwich",
  places: "e.g. Zion National Park",
  entertainment: "e.g. Sleep No More",
  "movies-shows": "e.g. Severance",
};

export default function CreatePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    setRestaurant("");
    setStreetAddress("");
    setVenue("");
    setCity("");
    setMediaType(null);
  };

  const canSubmit = (() => {
    if (!selectedCategory || !name.trim()) return false;

    switch (selectedCategory) {
      case "food":
        return !!restaurant.trim() && !!streetAddress.trim() && !!city.trim();
      case "places":
        return !!city.trim();
      case "entertainment":
        return !!venue.trim() && !!city.trim();
      case "movies-shows":
        return !!mediaType;
      default:
        return false;
    }
  })();

  return (
    <div className="w-full py-6">
      <div className="page-x pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Add something
        </h1>
        <p className="mt-1 text-[14px] text-neutral-400">
          {selectedCategory
            ? categoryHints[selectedCategory]
            : "Pick a category to get started. It begins at Silver."}
        </p>
      </div>

      <form
        className="mt-8 space-y-6 page-x"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Category */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2.5">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "rounded-xl py-5 text-center text-[15px] font-semibold transition-colors",
                  selectedCategory === cat
                    ? "bg-[#111] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                )}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <>
            {/* Name */}
            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                {nameLabels[selectedCategory]}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholders[selectedCategory]}
                className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
              />
            </div>

            {/* Food — restaurant */}
            {selectedCategory === "food" && (
              <>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                    Restaurant
                  </label>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={restaurant}
                      onChange={(e) => setRestaurant(e.target.value)}
                      placeholder="e.g. Chick-fil-A"
                      className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                    Street address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 1345 N Freedom Blvd"
                      className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                    City & state
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Provo, UT"
                      className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Entertainment — venue */}
            {selectedCategory === "entertainment" && (
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                  Venue
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. The McKittrick Hotel"
                    className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Movies / Shows — format */}
            {selectedCategory === "movies-shows" && (
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2.5">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { key: "movie" as const, label: "Movie" },
                      { key: "show" as const, label: "TV Show" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMediaType(key)}
                      className={cn(
                        "rounded-xl py-4 text-center text-[15px] font-semibold transition-colors",
                        mediaType === key
                          ? "bg-[#111] text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location — food, places, entertainment */}
            {selectedCategory !== "movies-shows" && selectedCategory !== "food" && (
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                  {selectedCategory === "places" ? "Where is it?" : "Location"}
                </label>
                <div className="relative">
                  {selectedCategory === "places" ? (
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  ) : (
                    <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  )}
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={
                      selectedCategory === "places"
                        ? "City, country, or region — e.g. Kyoto, Japan"
                        : "City where it takes place"
                    }
                    className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                Image URL
                {selectedCategory === "movies-shows" && (
                  <span className="ml-1 text-neutral-400 normal-case tracking-normal font-normal">
                    (optional)
                  </span>
                )}
              </label>
              <div className="relative">
                {selectedCategory === "movies-shows" ? (
                  <Clapperboard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                ) : (
                  <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                )}
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "mt-2 w-full rounded-xl py-4 text-[15px] font-semibold text-white transition active:scale-[0.99]",
            canSubmit
              ? "bg-[#111] hover:bg-neutral-800"
              : "cursor-not-allowed bg-neutral-300",
          )}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
