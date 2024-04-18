// All regions for WoW
export const ALL_REGIONS = ['EU', 'US', 'TW', 'KR', 'CN'] as const;
export type Region = (typeof ALL_REGIONS)[number];

export const CLASSIC_REGIONS = ['EU', 'US', 'TW', 'KR'] as const;
export type ClassicRegion = (typeof CLASSIC_REGIONS)[number];

// WoWAnalyzer/Blizzard API supported regions
export const SUPPORTED_REGIONS = ['EU', 'US', 'TW', 'KR'] as const;
export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];

export function isRegion(region: string | undefined): region is Region {
  // the 'as' below is just to allow the use of .includes
  return ALL_REGIONS.includes(region as Region);
}

/**
 * Not every region is supported by the Blizzard API (and, by extension, the bits of the
 * WoWA API that use the Blizzard API). This is used to check that a region is supported before
 * sending a request.
 */
export function isSupportedRegion(region: string | undefined): region is SupportedRegion {
  // the 'as' below is just to allow the use of .includes
  return SUPPORTED_REGIONS.includes(region as SupportedRegion);
}
