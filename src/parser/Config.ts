import { ChangelogEntry } from 'common/changelog';
import { Contributor } from 'common/contributor';
import { Spec } from 'game/SPECS';
import { AlertKind } from 'interface/Alert';
import CombatLogParser from 'parser/core/CombatLogParser';
import { ReactNode } from 'react';
import GameBranch from 'game/GameBranch';
import type { StringWithAutocompleteOptions } from 'common/stringWithAutocompleteOptions';

import type { Stats } from './shared/modules/StatTracker';

type VaultPatchCycle = `10.0.${0 | 2 | 5 | 7}`;
type AberrusPatchCycle = `10.1.${0 | 5 | 7}`;
type AmirdrassilPatchCycle = `10.2.${0 | 5 | 6 | 7}`;
export type DragonflightPatchVersion = StringWithAutocompleteOptions<
  VaultPatchCycle | AberrusPatchCycle | AmirdrassilPatchCycle
>;

type NerubarPatchCycle = `11.0.${0 | 2 | 5}`;
type UnderminePatchCycle = `11.1.0`;
export type TwwPatchVersion = StringWithAutocompleteOptions<
  NerubarPatchCycle | UnderminePatchCycle
>;

export type CataPatchVersion = StringWithAutocompleteOptions<`4.4.0`>;

export enum SupportLevel {
  /**
   * The spec is totally unmaintained and may have no analysis or broken analysis.
   */
  Unmaintained,
  /**
   * The spec has core support for ability & cooldown tracking. It may use the Foundation guide, or a pre-existing (but updated!) checklist/guide.
   *
   * The analysis may not give many/any spec-specific tips, but what is shown is accurate.
   *
   * Specs with this level of support **do not have dedicated maintainers.**
   */
  Foundation,
  /**
   * The spec has a dedicated maintainer that is working on adding spec-specific analysis, but the analysis is incomplete.
   *
   * As with the `Foundation` level, what is shown should be accurate (within reason).
   *
   * Core analysis should remain correct but there is still more work to be done.
   */
  MaintainedPartial,
  /**
   * The spec has a dedicated maintainer that considers spec-specific analysis largely complete. Further additions are either niche, cover uncommon builds, or in service of theorycrafting.
   */
  MaintainedFull,
}

interface CoreConfig {
  branch: GameBranch;
  patchCompatibility: null | DragonflightPatchVersion | TwwPatchVersion | CataPatchVersion;
  /**
   * The people that have contributed to this spec recently. People don't have
   * to sign up to be long-time maintainers to be included in this list. If
   * someone built a large part of the spec or contributed something recently to
   * that spec, they can be added to the contributors list. If someone goes MIA,
   * they may be removed after major changes or during a new expansion.
   */
  contributors: Contributor[];
  /**
   * These are multipliers to the stats applied *on pull* that are not
   * included in the stats reported by WCL. These are *baked in* and do
   * not multiply temporary buffs.
   *
   * In general, it looks like armor is the only one that isn't applied
   * by WCL.
   */
  statMultipliers?: Partial<Stats>;
  /**
   * A recent example report to see interesting parts of the spec. Will be shown
   * on the homepage.
   */
  exampleReport: string;
  /**
   * Extra description/notes and configuration for pages.
   */
  pages?: {
    overview?: {
      /**
       * Which type of frontmatter to use by default when both are present.
       */
      frontmatterType?: 'checklist' | 'guide';
      notes?: ReactNode;
    };
    timeline?:
      | {
          text: ReactNode;
          type: AlertKind;
        }
      | ((parser: CombatLogParser) => {
          text: ReactNode;
          type: AlertKind;
        } | null);
  };
  timeline?: {
    separateCastBars: number[][];
  };
  // Don't change values for props below this line;
  /**
   * The spec this config is for . This is the only place (in code) that
   * specifies which spec this parser is about.
   */
  spec: Spec;
  /**
   * The contents of your changelog.
   */
  changelog?: ChangelogEntry[];
  /**
   * The CombatLogParser class for your spec.
   */
  parser?: () => Promise<typeof CombatLogParser>;
  /**
   * The path to the current directory (relative form project root). This is
   * used for generating a GitHub link directly to your spec's code.
   */
  path: string;
}

/**
 * At the Foundation support level, many fields are optional.
 */
interface FoundationConfig {
  supportLevel: SupportLevel.Foundation | SupportLevel.Unmaintained;
  description?: ReactNode;
}

interface MaintainedConfig {
  supportLevel: SupportLevel.MaintainedPartial | SupportLevel.MaintainedFull;
  /**
   * Explain the status of this spec's analysis here. Try to mention how
   * complete it is, and perhaps show links to places users can learn more.
   * If this spec's analysis does not show a complete picture please mention
   * this in the `<Warning>` component.
   */
  description: ReactNode;
}

type Config = CoreConfig & (FoundationConfig | MaintainedConfig);

export default Config;
