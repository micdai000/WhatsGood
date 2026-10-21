import { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Pencil, Settings } from "lucide-react";
import { signOutAction } from "@/app/actions/auth.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccountDisplayName, getInitials } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  userId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

interface ProfileInfo {
  displayName: string | null;
  avatarUrl: string | null;
}

export function UserMenu({
  userId,
  email,
  fullName,
  avatarUrl,
}: UserMenuProps) {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("business_members")
        .select("businesses(logo_url)")
        .eq("user_id", userId),
    ]).then(([{ data: profileRow }, { data: memberships }]) => {
      const businessLogo = (memberships ?? [])
        .map((row) => {
          const business = Array.isArray(row.businesses)
            ? row.businesses[0]
            : row.businesses;
          return business?.logo_url ?? null;
        })
        .find((url): url is string => Boolean(url));

      setProfile({
        displayName: profileRow?.display_name || null,
        avatarUrl: profileRow?.avatar || businessLogo || null,
      });
    });
  }, [userId]);

  const displayName = getAccountDisplayName({
    fullName: fullName || profile?.displayName,
    email,
  });
  const photoUrl = avatarUrl || profile?.avatarUrl || null;
  const initials = getInitials(displayName) || email[0]?.toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="User menu"
      >
        <Avatar size="default">
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={displayName} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="px-1.5 py-1.5">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          <p className="mt-1 text-xs leading-none text-muted-foreground">
            {email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="size-4" aria-hidden />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
          <Pencil className="size-4" aria-hidden />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
          <Settings className="size-4" aria-hidden />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await signOutAction();
              if (result.redirect) {
                navigate(result.redirect, { replace: true });
              }
            });
          }}
        >
          <LogOut className="size-4" aria-hidden />
          {pending ? "Signing out\u2026" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
