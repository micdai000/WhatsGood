"use client";

import { useState } from "react";
import { MapPin, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabels, type Category } from "@/data/mock";

const categories: Category[] = ["food", "places", "entertainment", "movies-shows"];

export default function CreatePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="py-6">
      <div className="px-5 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Add something
        </h1>
        <p className="mt-1 text-[14px] text-neutral-400">
          Share something the world should know about. It starts at Silver.
        </p>
      </div>

      <form
        className="mt-8 space-y-6 px-5"
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
                onClick={() => setSelectedCategory(cat)}
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

        {/* Name */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What is it called?"
            className="h-12 w-full rounded-xl bg-neutral-100 border-0 px-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does it matter?"
            className="h-28 w-full resize-none rounded-xl bg-neutral-100 border-0 px-4 py-3 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Location
            <span className="ml-1 text-neutral-400 normal-case tracking-normal font-normal">
              (optional)
            </span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state, or address"
              className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Image URL
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#111] py-4 text-[15px] font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
