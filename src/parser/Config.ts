import { ChangelogEntry } from 'common/changelog';
import { Contributor } from 'common/contributor';
import Expansion from 'game/Expansion';
import { Spec } from 'game/SPECS';
import { AlertKind } from 'interface/Alert';
import CombatLogParser from 'parser/core/CombatLogParser';
import { ReactNode } from 'react';

import type { Stats } from './shared/modules/StatTracker';

export type Build = {
  url: string;
  name: string;
  talents: [number, number, number];
  icon: ReactNode;
  /**
   * Whether the build should be visible. Using `false` can allow you to
   * incrementally add support to modules, without having to bundle
   * everything in a single giant PR or release it incomplete.
   */
  visible: boolean;
  active?: boolean;
};
export type Builds = { [name: string]: Build };

type VaultPatchCycle = `0.${0 | 2 | 5 | 7}`;
type AberrusPatchCycle = `1.${0 | 5 | 7}`;
type AmirdrassilPatchCycle = `2.${0 | 5 | 6}`;
export type DragonflightPatchVersion = `10.${
  | VaultPatchCycle
  | AberrusPatchCycle
  | AmirdrassilPatchCycle}`;
export type WrathPatchVersion = `3.4.0`;

interface Config {
  /**
   * The people that have contributed to this spec recently. People don't have
   * to sign up to be long-time maintainers to be included in this list. If
   * someone built a large part of the spec or contributed something recently to
   * that spec, they can be added to the contributors list. If someone goes MIA,
   * they may be removed after major changes or during a new expansion.
   */
  contributors: Contributor[];
  expansion: Expansion;
  /**
   * The WoW client patch this spec is compatible with.
   */
  patchCompatibility: null | DragonflightPatchVersion | WrathPatchVersion;
  /**
   * Whether support for the spec is only partial and some important elements
   * are still missing. Note: you do not need to support every possible
   * statistic to stop marking it as partial. Only the important issues need to
   * be covered with decent accuracy.
   */
  isPartial: boolean;
  /**
   * Explain the status of this spec's analysis here. Try to mention how
   * complete it is, and perhaps show links to places users can learn more.
   * If this spec's analysis does not show a complete picture please mention
   * this in the `<Warning>` component.
   */
  description: ReactNode;
  pages?: {
    overview?: {
      hideChecklist?: boolean;
      text: ReactNode;
      type: AlertKind;
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
  /**
   * A recent example report to see interesting parts of the spec. Will be shown
   * on the homepage.
   */
  exampleReport: string;
  builds?: Builds;
  /**
   * These are multipliers to the stats applied *on pull* that are not
   * included in the stats reported by WCL. These are *baked in* and do
   * not multiply temporary buffs.
   *
   * In general, it looks like armor is the only one that isn't applied
   * by WCL.
   */
  statMultipliers?: Partial<Stats>;
  timeline?: {
    separateCastBars: number[][];
  };
  /**
   * Indicates if the new Guide or old Checklist should be the default starting tab.
   * If omitted, Checklist will be the default.
   */
  guideDefault?: boolean;
  /**
   * Indicates if only the new Guide should be accessible. Requires {@link guideDefault} to be
   * `true`. If omitted, Checklist will be accessible.
   */
  guideOnly?: boolean;

  // Don't change values for props below this line;
  /**
   * The spec this config is for . This is the only place (in code) that
   * specifies which spec this parser is about.
   */
  spec: Spec;
  /**
   * The contents of your changelog.
   */
  changelog: ChangelogEntry[];
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

export default Config;
