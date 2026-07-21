import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusAlert } from "@/components/ui/status-alert";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import {
  H1,
  H2,
  H3,
  Paragraph,
  Muted,
  Caption,
  PageTitle,
  SectionTitle,
} from "@/components/typography/typography";

function StyleGuideSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Section spacing="tight" className="border-b border-border last:border-0">
      <Container className="space-y-6">
        <div>
          <SectionTitle>{title}</SectionTitle>
          {description ? <Muted className="mt-1">{description}</Muted> : null}
        </div>
        {children}
      </Container>
    </Section>
  );
}

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={className} />
      <Caption>{name}</Caption>
    </div>
  );
}

export default function StyleGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageWrapper variant="muted">
      <Section spacing="default">
        <Container className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Style Guide</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageHeader
            title="Design System"
            description="Visual reference for Meritt UI components, tokens, and layout patterns."
          />
        </Container>
      </Section>

      <StyleGuideSection title="Typography" description="Semantic text components.">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <H1>Heading 1</H1>
          <H2>Heading 2</H2>
          <H3>Heading 3</H3>
          <PageTitle>Page Title</PageTitle>
          <SectionTitle>Section Title</SectionTitle>
          <Paragraph>
            Paragraph — Meritt helps professionals build credibility through
            verified client reviews.
          </Paragraph>
          <Muted>Muted text for secondary information and descriptions.</Muted>
          <Caption>Caption for labels, metadata, and fine print.</Caption>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Colors" description="Semantic design tokens.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Swatch name="Primary" className="h-16 rounded-lg bg-primary" />
          <Swatch name="Slate" className="h-16 rounded-lg bg-slate" />
          <Swatch name="Muted" className="h-16 rounded-lg bg-muted" />
          <Swatch name="Success" className="h-16 rounded-lg bg-success" />
          <Swatch name="Warning" className="h-16 rounded-lg bg-warning" />
          <Swatch name="Error" className="h-16 rounded-lg bg-error" />
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Spacing" description="Consistent layout rhythm.">
        <div className="flex flex-wrap items-end gap-4">
          {[4, 6, 8, 10, 12, 16].map((size) => (
            <div key={size} className="text-center">
              <div
                className="bg-primary/20"
                style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
              />
              <Caption className="mt-2 block">{size * 4}px</Caption>
            </div>
          ))}
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Forms">
        <div className="grid max-w-lg gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Jane Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell clients about your work…" />
          </div>
          <div className="space-y-2">
            <Label>Profession</Label>
            <Select defaultValue="photography">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car-detailing">Car Detailing</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="tutoring-coaching">Tutoring & Coaching</SelectItem>
                <SelectItem value="home-services">Home Services</SelectItem>
                <SelectItem value="tech-services">Tech Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">I agree to the terms</Label>
          </div>
          <RadioGroup defaultValue="email">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email">Email notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms">SMS notifications</Label>
            </div>
          </RadioGroup>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Cards & Badges">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Verified Reviews</CardTitle>
              <CardDescription>
                Collect authentic feedback from real clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Paragraph className="text-sm">
                Every review is tied to a verified request link.
              </Paragraph>
            </CardContent>
          </Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Avatars">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="User" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Alerts">
        <div className="grid max-w-2xl gap-4">
          <StatusAlert
            title="Profile updated"
            description="Your changes have been saved successfully."
            status="success"
          />
          <StatusAlert
            title="Review pending"
            description="Your client hasn't submitted their review yet."
            status="warning"
          />
          <StatusAlert
            title="Upload failed"
            description="Please try again with a smaller image."
            status="error"
          />
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Loading States">
        <div className="grid gap-8 md:grid-cols-2">
          <LoadingState label="Loading profile…" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Spinner />
            <Muted>Inline spinner</Muted>
          </div>
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Layout States">
        <div className="grid gap-6">
          <EmptyState
            icon={<User className="size-5" />}
            title="No reviews yet"
            description="Send your first review request to get started."
            action={<Button size="sm">Send request</Button>}
          />
          <ErrorState onRetry={() => toast.message("Retrying…")} />
        </div>
      </StyleGuideSection>

      <StyleGuideSection title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              Open Dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share your profile</DialogTitle>
                <DialogDescription>
                  Copy your Meritt link and send it to clients.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Dropdown
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit profile</DropdownMenuItem>
              <DropdownMenuItem>Share link</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() => toast.success("Review request sent")}
          >
            Show Toast
          </Button>
        </div>
      </StyleGuideSection>

      <Section spacing="default">
        <Container>
          <Separator className="mb-8" />
          <Muted>
            This page is for internal development reference. See{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              docs/design-system.md
            </code>{" "}
            for full documentation.
          </Muted>
        </Container>
      </Section>
    </PageWrapper>
  );
}
