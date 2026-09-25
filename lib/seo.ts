/**
 * Global SEO & Site Constants and Utility Functions
 */

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "GovCorp News";
export const DEFAULT_SITE_TITLE = "GovCorp News — India's PSU & Corporate News Network";
export const DEFAULT_SITE_DESCRIPTION =
  "Independent reporting, in-depth analysis, and exclusive insights on India's public sector undertakings (PSUs), central public enterprises, corporate governance, and government policy.";

export const DEFAULT_OG_IMAGE = "/logo.png";
