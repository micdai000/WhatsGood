import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProfileLoading() {
  return (
    <Section>
      <Container className="space-y-8" aria-busy="true" aria-label="Loading profile editor">
        <PageHeader
          title="Edit profile"
          description="Loading your profile details…"
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </Container>
    </Section>
  );
}
