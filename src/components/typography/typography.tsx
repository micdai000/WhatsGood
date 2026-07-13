import { cn } from "@/lib/utils";

type TypographyProps = React.ComponentProps<"h1"> & {
  as?: React.ElementType;
};

function createTypography(
  defaultTag: React.ElementType,
  baseClassName: string,
) {
  return function Typography({
    as,
    className,
    ...props
  }: TypographyProps) {
    const Component = as ?? defaultTag;
    return <Component className={cn(baseClassName, className)} {...props} />;
  };
}

export const Eyebrow = createTypography(
  "p",
  "meritt-eyebrow",
);

export const H1 = createTypography(
  "h1",
  "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
);

export const H2 = createTypography(
  "h2",
  "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
);

export const H3 = createTypography(
  "h3",
  "text-xl font-semibold tracking-tight text-foreground",
);

export const Paragraph = createTypography(
  "p",
  "text-base leading-relaxed text-foreground",
);

export const Muted = createTypography(
  "p",
  "text-sm leading-relaxed text-muted-foreground",
);

export const Caption = createTypography(
  "span",
  "text-xs leading-normal text-muted-foreground",
);

export const PageTitle = createTypography(
  "h1",
  "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
);

export const SectionTitle = createTypography(
  "h2",
  "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
);

export const SectionEyebrow = createTypography(
  "p",
  "meritt-eyebrow mb-2",
);
