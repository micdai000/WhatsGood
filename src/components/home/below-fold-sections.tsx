import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/app-image";
import { TrendingDown } from "lucide-react";
import { categoryLabels, type Entity, type Library } from "@/data/mock";
import { EntityCard } from "@/components/ui/entity-card";
import { LibraryCard } from "@/components/ui/library-card";
import { SectionHeader } from "@/components/ui/section-header";

interface BelowFoldSectionsProps {
  eliteEntities: Entity[];
  trendingUpEntities: Entity[];
  mostFollowedEntities: Entity[];
  homeLibraries: Library[];
  trendingDownEntities: Entity[];
  recentlyAddedEntities: Entity[];
}

export function BelowFoldSections({
  eliteEntities,
  trendingUpEntities,
  mostFollowedEntities,
  homeLibraries,
  trendingDownEntities,
  recentlyAddedEntities,
}: BelowFoldSectionsProps) {
  return (
    <>
      <section className="section-gap mt-10">
        <div className="page-x">
          <SectionHeader
            title="Elite Right Now"
            subtitle="The highest reputation across all categories"
          />
        </div>
        <div className="card-row page-x hide-scrollbar">
          {eliteEntities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} size="large" />
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="page-x">
          <SectionHeader
            title="Gaining Momentum"
            subtitle="Rising through the ranks right now"
          />
        </div>
        <div className="card-row page-x hide-scrollbar">
          {trendingUpEntities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} size="large" />
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="page-x">
          <SectionHeader
            title="Most Followed"
            subtitle="The ones people want to keep track of"
          />
        </div>
        <div className="card-row page-x hide-scrollbar">
          {mostFollowedEntities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} size="large" />
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="page-x">
          <SectionHeader
            title="Libraries"
            subtitle="Curated collections from the community"
          />
        </div>
        <div className="card-row card-row--wide page-x hide-scrollbar">
          {homeLibraries.map((lib) => (
            <LibraryCard key={lib.id} library={lib} />
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="page-x">
          <SectionHeader
            title="Losing Ground"
            subtitle="Falling in the court of public opinion"
          />
          <div>
            {trendingDownEntities.map((entity, i) => (
              <Link
                key={entity.id}
                to={`/entity/${entity.id}`}
                className="flex items-center gap-4 py-3.5 border-b border-neutral-100 last:border-0"
              >
                <span className="text-2xl font-bold text-neutral-200 tabular-nums w-8 text-center shrink-0">
                  {i + 1}
                </span>
                <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden">
                  <AppImage
                    src={entity.image}
                    alt={entity.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold text-[#111] truncate">
                    {entity.name}
                  </h3>
                  <p className="text-[12px] text-neutral-400">
                    {categoryLabels[entity.category]}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[14px] text-red-400 font-semibold tabular-nums">
                    {entity.score > 0 ? "+" : ""}
                    {entity.score}
                  </span>
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap mb-6">
        <div className="page-x">
          <SectionHeader
            title="Just Added"
            subtitle="Fresh arrivals from the community"
          />
        </div>
        <div className="card-row page-x hide-scrollbar">
          {recentlyAddedEntities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} size="large" />
          ))}
        </div>
      </section>
    </>
  );
}
