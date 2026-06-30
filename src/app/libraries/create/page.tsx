"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ImageIcon, BookOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraries } from "@/lib/libraries-store";

export default function CreateLibraryPage() {
  const router = useRouter();
  const { createLibrary } = useLibraries();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLocationBased, setIsLocationBased] = useState(false);
  const [location, setLocation] = useState("");

  const canSubmit =
    !!name.trim() &&
    !!description.trim() &&
    (!isLocationBased || !!location.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const library = createLibrary({
      name,
      description,
      coverImage: coverUrl,
      isPublic,
      isLocationBased,
      location: isLocationBased ? location : undefined,
    });

    router.push(`/library/${library.id}?new=1`);
  }

  return (
    <div className="w-full py-6">
      <div className="page-x pt-2">
        <Link
          href="/libraries"
          className="mb-4 inline-flex items-center gap-1 text-[14px] font-medium text-neutral-500 hover:text-[#111]"
        >
          <ChevronLeft className="h-4 w-4" />
          Libraries
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Create a library
        </h1>
        <p className="mt-1 text-[14px] text-neutral-400">
          Curate Meritt picks into a collection only you can edit.
        </p>
      </div>

      <form className="mt-8 space-y-6 page-x" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Library name
          </label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Best tacos in Austin"
              className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this collection about?"
            className="h-28 w-full resize-none rounded-xl bg-neutral-100 border-0 px-4 py-3 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wider text-[#111] mb-2">
            Cover image URL
            <span className="ml-1 text-neutral-400 normal-case tracking-normal font-normal">
              (optional)
            </span>
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="h-12 w-full rounded-xl bg-neutral-100 border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-[#D4A017]/30 focus:bg-white"
            />
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-[13px] font-semibold text-[#111]">Location-based</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            Turn on for city guides, neighborhood lists, or regional picks.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsLocationBased(false)}
              className={cn(
                "rounded-xl py-3.5 text-[14px] font-semibold transition-colors",
                !isLocationBased
                  ? "bg-[#111] text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200",
              )}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setIsLocationBased(true)}
              className={cn(
                "rounded-xl py-3.5 text-[14px] font-semibold transition-colors",
                isLocationBased
                  ? "bg-[#111] text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200",
              )}
            >
              Location-based
            </button>
          </div>
          {isLocationBased && (
            <div className="mt-4">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#111] mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Provo, UT or Tokyo, Japan"
                  className="h-12 w-full rounded-xl bg-white border-0 pl-11 pr-4 text-[15px] text-[#111] placeholder:text-neutral-400 outline-none ring-1 ring-neutral-200 transition-all focus:ring-2 focus:ring-[#D4A017]/30"
                />
              </div>
              <p className="mt-2 text-[12px] text-neutral-400">
                City, neighborhood, or region this collection covers.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-[13px] font-semibold text-[#111]">Visibility</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            Next you&apos;ll add items already on Meritt. Only you can edit this
            library.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={cn(
                "rounded-xl py-3.5 text-[14px] font-semibold transition-colors",
                isPublic
                  ? "bg-[#111] text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200",
              )}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={cn(
                "rounded-xl py-3.5 text-[14px] font-semibold transition-colors",
                !isPublic
                  ? "bg-[#111] text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200",
              )}
            >
              Private
            </button>
          </div>
        </div>

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
          Create & add items
        </button>
      </form>
    </div>
  );
}
