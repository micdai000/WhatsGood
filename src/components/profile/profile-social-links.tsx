import { useId, type ComponentType, type SVGProps } from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { Globe } from "lucide-react";
import { Eyebrow } from "@/components/typography/typography";
import {
  getDisplayableSocialLinks,
  type DisplaySocialLink,
  type SocialLinkPlatform,
} from "@/lib/profile/social-links";
import type { SocialLinks } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileSocialLinksProps {
  links?: SocialLinks | null;
  className?: string;
  /**
   * When true, renders the subtle "Professional Links" heading.
   * Set false for compact reuse (cards, search results, etc.).
   */
  showHeading?: boolean;
}

type PlatformIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;

const PLATFORM_ICONS: Record<SocialLinkPlatform, PlatformIcon> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  x: SiX,
  website: Globe,
};

const PLATFORM_HOVER_CLASS: Record<SocialLinkPlatform, string> = {
  instagram: "hover:text-[#E4405F] focus-visible:text-[#E4405F]",
  facebook: "hover:text-[#1877F2] focus-visible:text-[#1877F2]",
  x: "hover:text-foreground focus-visible:text-foreground",
  website: "hover:text-primary focus-visible:text-primary",
};

function SocialLinkItem({ item }: { item: DisplaySocialLink }) {
  const Icon = PLATFORM_ICONS[item.platform];
  const isStrokeIcon = item.platform === "website";

  return (
    <li className="relative inline-flex">
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.tooltip}
        className={cn(
          "group relative inline-flex size-8 cursor-pointer items-center justify-center rounded-md",
          "text-muted-foreground",
          "transition-[color,opacity,transform] duration-200 ease-out",
          "opacity-80 hover:opacity-100 hover:scale-105",
          "focus-visible:opacity-100 focus-visible:scale-105",
          PLATFORM_HOVER_CLASS[item.platform],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <Icon
          className="size-[1.125rem] shrink-0"
          aria-hidden
          {...(isStrokeIcon ? { strokeWidth: 1.75 } : {})}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
            "whitespace-nowrap rounded-md bg-foreground px-2 py-1",
            "text-[11px] font-medium leading-none text-background shadow-sm",
            "opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          {item.tooltip}
        </span>
      </a>
    </li>
  );
}

export function ProfileSocialLinks({
  links,
  className,
  showHeading = true,
}: ProfileSocialLinksProps) {
  const headingId = useId();
  const items = getDisplayableSocialLinks(links);

  if (items.length === 0) {
    return null;
  }

  const list = (
    <ul
      className={cn(
        "m-0 flex list-none flex-wrap items-center justify-center gap-1 p-0",
        !showHeading && "inline-flex",
      )}
      aria-label={showHeading ? undefined : "Professional links"}
    >
      {items.map((item) => (
        <SocialLinkItem key={item.platform} item={item} />
      ))}
    </ul>
  );

  if (!showHeading) {
    return <div className={className}>{list}</div>;
  }

  return (
    <section
      className={cn("flex flex-col items-center gap-2.5 text-center", className)}
      aria-labelledby={headingId}
    >
      <Eyebrow id={headingId} className="mb-0">
        Professional Links
      </Eyebrow>
      {list}
    </section>
  );
}
