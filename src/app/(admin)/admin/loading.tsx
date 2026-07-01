import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <Section>
      <Container className="space-y-6" aria-busy="true" aria-label="Loading admin">
        <Skeleton className="h-16 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </Container>
    </Section>
  );
}
