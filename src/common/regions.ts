// All regions for WoW
export type Region = 'EU' | 'US' | 'TW' | 'KR' | 'CN';

export type ClassicRegion = 'EU' | 'US' | 'TW' | 'KR';

// WoWAnalyzer/Blizzard API supported regions
const SUPPORTED_REGIONS = ['EU', 'US', 'TW', 'KR'] as const;
type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];

/**
 * Not every region is supported by the Blizzard API (and, by extension, the bits of the
 * WoWA API that use the Blizzard API). This is used to check that a region is supported before
 * sending a request.
 */
export function isSupportedRegion(region: string | undefined): region is SupportedRegion {
  // the 'as' below is just to allow the use of .includes
  return SUPPORTED_REGIONS.includes(region as SupportedRegion);
}
