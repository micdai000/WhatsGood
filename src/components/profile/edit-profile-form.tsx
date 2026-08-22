import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile.actions";
import { checkSlugAvailabilityAction } from "@/app/actions/onboarding.actions";
import { UsernameField } from "@/components/onboarding/username-field";
import {
  BioField,
  DisplayNameField,
  LocationFields,
  ProfessionField,
  ProfilePhotoField,
} from "@/components/profile-fields";
import { ProfessionalLinksSection } from "@/components/profile/professional-links-section";
import { PublicProfilePreview } from "@/components/profile/public-profile-preview";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusAlert } from "@/components/ui/status-alert";
import { Muted } from "@/components/typography/typography";
import { mapProfileToPublicProfile } from "@/services/profiles/public-profile.mapper";
import {
  normalizeSocialLinksForSave,
  socialLinksToFormValues,
  toSocialInputValue,
  type SocialLinkPlatform,
  validateSocialLinksFormValues,
  validateSocialUsernameInput,
  validateWebsiteInput,
} from "@/lib/profile/social-links";
import { createProfileSchema } from "@/lib/validators";
import type { Profile, Profession, SocialLinks } from "@/types";
import { DEFAULT_SOCIAL_LINKS } from "@/types/profile";
import type { BadgeSubTier, BadgeTier } from "@/types/badge";
import { cn } from "@/lib/utils";

interface EditProfileFormState {
  slug: string;
  fullName: string;
  professionId: string;
  bio: string;
  city: string;
  state: string;
  profilePhoto: string | null;
  socialLinks: SocialLinks;
}

interface EditProfileFormProps {
  profile: Profile;
  professions: Profession[];
  stats: {
    totalReviews: number;
    badgeTier: BadgeTier;
    badgeSubTier?: BadgeSubTier | null;
    badgePeriod: string | null;
  };
}

function toFormState(profile: Profile): EditProfileFormState {
  return {
    slug: profile.username,
    fullName: profile.displayName,
    professionId: profile.professionId ?? "",
    bio: profile.bio ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    profilePhoto: profile.avatar,
    socialLinks: socialLinksToFormValues(profile.socialLinks ?? DEFAULT_SOCIAL_LINKS),
  };
}

function serializeState(state: EditProfileFormState): string {
  return JSON.stringify(state);
}

export function EditProfileForm({
  profile,
  professions,
  stats,
}: EditProfileFormProps) {
  const [baseline, setBaseline] = useState<EditProfileFormState>(() =>
    toFormState(profile),
  );
  const [formState, setFormState] = useState<EditProfileFormState>(() =>
    toFormState(profile),
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isDirty = serializeState(formState) !== serializeState(baseline);

  useEffect(() => {
    const next = toFormState(profile);
    setFormState(next);
    setBaseline(next);
  }, [profile]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateField = useCallback(
    <K extends keyof EditProfileFormState>(key: K, value: EditProfileFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
      setSuccessMessage(null);
      setFormError(null);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const updateSocialLink = useCallback((platform: SocialLinkPlatform, value: string) => {
    setFormState((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
    setSuccessMessage(null);
    setFormError(null);
    setFieldErrors((prev) => {
      if (!prev[platform]) return prev;
      const next = { ...prev };
      delete next[platform];
      return next;
    });
  }, []);

  const handleSocialBlur = useCallback(
    (platform: SocialLinkPlatform, rawValue: string) => {
      const error =
        platform === "website"
          ? validateWebsiteInput(rawValue)
          : validateSocialUsernameInput(platform, rawValue);

      setFieldErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[platform] = error;
        } else {
          delete next[platform];
        }
        return next;
      });

      if (error || !rawValue.trim()) return;

      // Keep social fields as usernames in the UI; website can show the cleaned URL.
      if (platform === "website") {
        const normalized = normalizeSocialLinksForSave({
          ...DEFAULT_SOCIAL_LINKS,
          website: rawValue,
        }).website;
        if (normalized && normalized !== rawValue) {
          updateSocialLink("website", normalized);
        }
        return;
      }

      const username = toSocialInputValue(
        platform,
        normalizeSocialLinksForSave({
          ...DEFAULT_SOCIAL_LINKS,
          [platform]: rawValue,
        })[platform],
      );

      if (username && username !== rawValue.trim()) {
        updateSocialLink(platform, username);
      }
    },
    [updateSocialLink],
  );

  const professionName =
    professions.find((profession) => profession.id === formState.professionId)
      ?.name ?? null;

  const previewProfile = mapProfileToPublicProfile(
    {
      ...profile,
      username: formState.slug,
      displayName: formState.fullName,
      avatar: formState.profilePhoto,
      bio: formState.bio || null,
      professionId: formState.professionId || null,
      city: formState.city || null,
      state: formState.state || null,
      socialLinks: normalizeSocialLinksForSave(formState.socialLinks),
    },
    {
      professionName,
      totalReviews: stats.totalReviews,
      badgeTier: stats.badgeTier,
      badgeSubTier: stats.badgeSubTier ?? null,
      badgePeriod: stats.badgePeriod,
    },
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const parsed = createProfileSchema.safeParse({
      slug: formState.slug,
      fullName: formState.fullName.trim(),
      professionId: formState.professionId,
      bio: formState.bio.trim() ? formState.bio : null,
      city: formState.city.trim(),
      state: formState.state.trim(),
      profilePhoto: formState.profilePhoto,
    });

    const socialErrors = validateSocialLinksFormValues(formState.socialLinks);

    if (!parsed.success || Object.keys(socialErrors).length > 0) {
      const errors: Record<string, string> = { ...socialErrors };
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0] ?? "form");
          if (!errors[field]) {
            errors[field] = issue.message;
          }
        }
      }
      setFieldErrors(errors);
      setSubmitting(false);
      return;
    }

    if (parsed.data.slug !== profile.username) {
      const availability = await checkSlugAvailabilityAction(parsed.data.slug);

      if (!availability.success) {
        setFieldErrors({ slug: availability.message });
        setSubmitting(false);
        return;
      }

      if (!availability.data.available) {
        setFieldErrors({ slug: "This username is already taken." });
        setSubmitting(false);
        return;
      }
    }

    const socialLinks = normalizeSocialLinksForSave(formState.socialLinks);
    const result = await updateProfileAction({
      ...parsed.data,
      socialLinks,
    });

    setSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const errors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          errors[key] = messages[0] ?? "Invalid value";
        }
        setFieldErrors(errors);
      }
      setFormError(result.message);
      return;
    }

    const nextState: EditProfileFormState = {
      ...formState,
      socialLinks: socialLinksToFormValues(socialLinks),
    };
    setFormState(nextState);
    setBaseline(nextState);
    setSuccessMessage("Profile updated successfully.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const socialFieldErrors: Partial<Record<SocialLinkPlatform, string>> = {
    instagram: fieldErrors.instagram,
    facebook: fieldErrors.facebook,
    x: fieldErrors.x,
    website: fieldErrors.website,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="lg:col-start-2 lg:row-start-1">
        <div className="lg:sticky lg:top-6">
          <PublicProfilePreview profile={previewProfile} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 lg:col-start-1 lg:row-start-1"
        aria-busy={submitting}
        noValidate
      >
        {successMessage ? (
          <StatusAlert
            status="success"
            title="Changes saved"
            description={successMessage}
          />
        ) : null}

        {formError ? (
          <StatusAlert status="error" title="Unable to save" description={formError} />
        ) : null}

        {isDirty ? (
          <Muted className="text-sm" role="status">
            You have unsaved changes.
          </Muted>
        ) : null}

        <section className="space-y-4" aria-labelledby="edit-photo-heading">
          <h2 id="edit-photo-heading" className="text-lg font-semibold">
            Profile photo
          </h2>
          <ProfilePhotoField
            value={formState.profilePhoto}
            onChange={(profilePhoto) => updateField("profilePhoto", profilePhoto)}
            displayName={formState.fullName || profile.displayName}
          />
        </section>

        <section className="space-y-4" aria-labelledby="edit-name-heading">
          <h2 id="edit-name-heading" className="text-lg font-semibold">
            Display name
          </h2>
          <DisplayNameField
            value={formState.fullName}
            onChange={(fullName) => updateField("fullName", fullName)}
            error={fieldErrors.fullName}
          />
        </section>

        <section className="space-y-4" aria-labelledby="edit-profession-heading">
          <h2 id="edit-profession-heading" className="text-lg font-semibold">
            Profession
          </h2>
          <ProfessionField
            value={formState.professionId || null}
            onChange={(professionId) => updateField("professionId", professionId)}
            error={fieldErrors.professionId}
          />
        </section>

        <section className="space-y-4" aria-labelledby="edit-username-heading">
          <h2 id="edit-username-heading" className="text-lg font-semibold">
            Username
          </h2>
          <UsernameField
            value={formState.slug}
            onChange={(slug) => updateField("slug", slug)}
            error={fieldErrors.slug}
          />
        </section>

        <section className="space-y-4" aria-labelledby="edit-bio-heading">
          <h2 id="edit-bio-heading" className="text-lg font-semibold">
            Bio
          </h2>
          <BioField
            value={formState.bio}
            onChange={(bio) => updateField("bio", bio)}
            error={fieldErrors.bio}
          />
        </section>

        <section className="space-y-4" aria-labelledby="edit-location-heading">
          <h2 id="edit-location-heading" className="text-lg font-semibold">
            Location
          </h2>
          <LocationFields
            city={formState.city}
            state={formState.state}
            onCityChange={(city) => updateField("city", city)}
            onStateChange={(stateValue) => updateField("state", stateValue)}
            errors={{
              city: fieldErrors.city,
              state: fieldErrors.state,
            }}
          />
        </section>

        <ProfessionalLinksSection
          values={formState.socialLinks}
          errors={socialFieldErrors}
          onChange={updateSocialLink}
          onBlur={handleSocialBlur}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting || !isDirty}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={(event) => {
              if (isDirty && !window.confirm("Discard unsaved changes?")) {
                event.preventDefault();
              }
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
