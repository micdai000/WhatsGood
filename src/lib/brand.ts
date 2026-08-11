import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

export { SITE_DESCRIPTION, SITE_NAME };

/** User-facing phrases — always use {@link SITE_NAME} as the product name. */
export const brandCopy = {
  adminTitle: `${SITE_NAME} Admin`,
  unavailable: `${SITE_NAME} is temporarily unavailable`,
  publicProfile: `public ${SITE_NAME} profile`,
  profilePhotoUpload: `Profile photo must be uploaded through ${SITE_NAME}`,
  signOutDevice: `Sign out of ${SITE_NAME} on this device.`,
  searchDiscovery: `See how others appear in ${SITE_NAME} search.`,
  joiningMessage: `More professionals are joining ${SITE_NAME} with verified reputation profiles.`,
  shareTitle: (displayName: string) => `${displayName} on ${SITE_NAME}`,
  shareText: (displayName: string) =>
    `Check out ${displayName}'s professional profile on ${SITE_NAME}.`,
  profileSetupIncomplete:
    "This professional is still completing their profile. Check back soon for their full public presence.",
  profileSetupIncompleteWithBrand: (displayName: string) =>
    `This professional is still completing their ${SITE_NAME} profile. Check back soon for their full public presence.`,
  memberSincePrefix: `On ${SITE_NAME} since`,
  usernameHandle: `Pick a unique handle for your public ${SITE_NAME} profile.`,
  editProfileDescription: `Update how you appear on your ${SITE_NAME} profile.`,
  styleGuideShareLink: `Copy your ${SITE_NAME} link and send it to clients.`,
} as const;
