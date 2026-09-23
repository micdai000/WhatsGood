import type { ComponentType } from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialLinkPlatform } from "@/lib/profile/social-links";
import type { SocialLinks } from "@/types";
import { cn } from "@/lib/utils";

interface ProfessionalLinksSectionProps {
  values: SocialLinks;
  errors?: Partial<Record<SocialLinkPlatform, string>>;
  onChange: (platform: SocialLinkPlatform, value: string) => void;
  onBlur: (platform: SocialLinkPlatform, value: string) => void;
  className?: string;
  title?: string;
  description?: string;
  /** When false, renders fields without the outer card shell (for nested forms). */
  asCard?: boolean;
}

type LinkFieldConfig = {
  platform: SocialLinkPlatform;
  label: string;
  placeholder: string;
  autoComplete?: string;
  icon: ComponentType<{ className?: string }>;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

const FIELDS: LinkFieldConfig[] = [
  {
    platform: "instagram",
    label: "Instagram",
    placeholder: "username or profile URL",
    icon: SiInstagram,
  },
  {
    platform: "facebook",
    label: "Facebook",
    placeholder: "username or profile URL",
    icon: SiFacebook,
  },
  {
    platform: "x",
    label: "X",
    placeholder: "username or profile URL",
    icon: SiX,
  },
  {
    platform: "website",
    label: "Website",
    placeholder: "example.com",
    autoComplete: "url",
    icon: Globe,
    inputMode: "url",
  },
];

export function ProfessionalLinksSection({
  values,
  errors = {},
  onChange,
  onBlur,
  className,
  title = "Professional Links",
  description = "Add Instagram, Facebook, X, and a website so customers can find you.",
  asCard = true,
}: ProfessionalLinksSectionProps) {
  const fields = (
    <div className="space-y-4">
      {FIELDS.map((field) => {
        const Icon = field.icon;
        const error = errors[field.platform];
        const inputId = `social-${field.platform}`;
        const errorId = `${inputId}-error`;

        return (
          <div key={field.platform} className="space-y-2">
            <Label htmlFor={inputId} className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              {field.label}
            </Label>
            <Input
              id={inputId}
              name={inputId}
              value={values[field.platform] ?? ""}
              onChange={(event) => onChange(field.platform, event.target.value)}
              onBlur={(event) => onBlur(field.platform, event.target.value)}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
            />
            {error ? (
              <p id={errorId} className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (!asCard) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {fields}
      </div>
    );
  }

  return (
    <Card className={cn("border-border shadow-[var(--shadow-meritt-card)]", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
