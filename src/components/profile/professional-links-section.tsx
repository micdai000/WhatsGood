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
  /** Platforms shown in the editor. Defaults to Instagram, Facebook, and X. */
  platforms?: SocialLinkPlatform[];
  /** Skip the outer card when the fields sit inside another form section. */
  embedded?: boolean;
  className?: string;
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
    label: "Personal Website",
    placeholder: "example.com",
    autoComplete: "url",
    icon: Globe,
    inputMode: "url",
  },
];

const DEFAULT_PLATFORMS: SocialLinkPlatform[] = [
  "instagram",
  "facebook",
  "x",
];

function LinkFields({
  fields,
  values,
  errors,
  onChange,
  onBlur,
}: {
  fields: LinkFieldConfig[];
  values: SocialLinks;
  errors: Partial<Record<SocialLinkPlatform, string>>;
  onChange: (platform: SocialLinkPlatform, value: string) => void;
  onBlur: (platform: SocialLinkPlatform, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
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
}

export function ProfessionalLinksSection({
  values,
  errors = {},
  onChange,
  onBlur,
  platforms = DEFAULT_PLATFORMS,
  embedded = false,
  className,
}: ProfessionalLinksSectionProps) {
  const fields = FIELDS.filter((field) => platforms.includes(field.platform));
  const fieldList = (
    <LinkFields
      fields={fields}
      values={values}
      errors={errors}
      onChange={onChange}
      onBlur={onBlur}
    />
  );

  if (embedded) {
    return <div className={className}>{fieldList}</div>;
  }

  return (
    <Card className={cn("border-border shadow-[var(--shadow-meritt-card)]", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Professional Links</CardTitle>
        <CardDescription>
          Add Instagram, Facebook, or X so customers can learn more about you.
        </CardDescription>
      </CardHeader>
      <CardContent>{fieldList}</CardContent>
    </Card>
  );
}
