import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { AdminStatGrid } from "@/components/admin";
import { Muted, Paragraph } from "@/components/typography/typography";
import { Spinner } from "@/components/ui/spinner";
import { useServiceQuery } from "@/hooks/use-service-query";
import { adminService } from "@/services/admin";
import { Briefcase, MessageSquare, UserCircle, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const result = useServiceQuery(() => adminService.getDashboard(), []);

  if (result.status === "loading") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <Paragraph className="text-destructive" role="alert">
        {result.message}
      </Paragraph>
    );
  }

  const { statistics, recentActivity } = result.data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Platform overview</h2>
        <Muted className="text-sm">Internal metrics for Meritt operations.</Muted>
      </div>

      <AdminStatGrid statistics={statistics} />

      <section className="space-y-4" aria-labelledby="admin-quick-actions">
        <h3 id="admin-quick-actions" className="text-lg font-semibold">
          Quick actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickActionCard
            title="Manage users"
            description="Search accounts and view roles."
            href="/admin/users"
            icon={Users}
          />
          <QuickActionCard
            title="Manage profiles"
            description="Review and remove professional profiles."
            href="/admin/profiles"
            icon={UserCircle}
          />
          <QuickActionCard
            title="Moderate reviews"
            description="Search and remove inappropriate reviews."
            href="/admin/reviews"
            icon={MessageSquare}
          />
          <QuickActionCard
            title="Manage professions"
            description="Create, edit, or disable profession categories."
            href="/admin/professions"
            icon={Briefcase}
          />
        </div>
      </section>

      <DashboardCard title="Recent platform activity">
        {recentActivity.length > 0 ? (
          <ul className="space-y-4" aria-label="Recent platform activity">
            {recentActivity.map((item) => (
              <li key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                <Paragraph className="text-sm font-medium">{item.title}</Paragraph>
                <Muted className="text-xs">{item.description}</Muted>
              </li>
            ))}
          </ul>
        ) : (
          <Muted className="text-sm">No recent activity.</Muted>
        )}
      </DashboardCard>

      <Muted className="text-xs">
        <Link to="/dashboard" className="underline hover:text-foreground">
          Return to professional dashboard
        </Link>
      </Muted>
    </div>
  );
}
