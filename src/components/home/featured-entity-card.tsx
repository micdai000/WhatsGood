import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/app-image";
import { categoryLabels, formatCount, type Entity } from "@/data/mock";
import { TierBadge } from "@/components/ui/tier-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Caption, Muted } from "@/components/typography/typography";

interface FeaturedEntityCardProps {
  entity: Entity;
}

export function FeaturedEntityCard({ entity }: FeaturedEntityCardProps) {
  return (
    <Link to={`/entity/${entity.id}`} className="block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative hero-media">
          <AppImage
            src={entity.image}
            alt={entity.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <TierBadge tier={entity.tier} size="lg" />
            <Caption className="uppercase tracking-widest">
              {categoryLabels[entity.category]}
            </Caption>
          </div>
          <CardTitle className="text-2xl">{entity.name}</CardTitle>
          <CardDescription>
            <span className="font-semibold tabular-nums text-foreground">
              {entity.score > 0 ? "+" : ""}
              {entity.score}
            </span>
            {" · "}
            {formatCount(entity.totalVotes)} votes
            {" · "}
            {formatCount(entity.followersCount)} followers
          </CardDescription>
        </CardHeader>
        <CardContent className="hidden" />
      </Card>
    </Link>
  );
}
