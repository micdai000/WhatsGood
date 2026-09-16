export function canCreateClaimRequest(isClaimed: boolean): boolean {
  return isClaimed !== true;
}
