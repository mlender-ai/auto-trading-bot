import { env } from "../../config/env.js";
import { RuleBasedReportProvider } from "./providers/ruleBasedReportProvider.js";
import type { ReportGeneratorProvider } from "./providers/types.js";

export function createReportGenerator(): ReportGeneratorProvider {
  switch (env.REPORT_PROVIDER) {
    case "rule-based":
    default:
      return new RuleBasedReportProvider();
  }
}
