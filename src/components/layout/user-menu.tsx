import { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { signOutAction } from "@/app/actions/auth.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  userId: string;
  email: string;
}

interface ProfileInfo {
  displayName: string;
  avatarUrl: string | null;
  username: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ userId, email }: UserMenuProps) {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("profiles")
      .select("username, display_name, avatar")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            displayName: data.display_name || email.split("@")[0],
            avatarUrl: data.avatar || null,
            username: data.username || null,
          });
        }
      });
  }, [userId, email]);

  const displayName = profile?.displayName || email.split("@")[0];
  const initials = getInitials(displayName) || email[0]?.toUpperCase() || "?";
  const profileHref = profile?.username
    ? `/u/${profile.username}`
    : "/dashboard/profile/edit";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="User menu"
      >
        <Avatar size="default">
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
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
        <DropdownMenuItem onClick={() => navigate(profileHref)}>
          <User className="size-4" aria-hidden />
          My Profile
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
