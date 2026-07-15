import { loadEnvLocal } from "../../scripts/load-env.mjs";
import { badgeService, currentPeriod } from "@/services/badges";
import { isSuccess } from "@/types";

loadEnvLocal();

const period = process.argv[2] ?? currentPeriod();

const result = await badgeService.computeBadgesForPeriod(period);

if (!isSuccess(result)) {
  console.error(`Badge computation failed for ${period}:`, result.error.message);
  process.exit(1);
}

console.log(
  `Computed badges for ${result.data.period}: ${result.data.processed} profile(s).`,
);
