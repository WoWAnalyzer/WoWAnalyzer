import { ReactNode } from 'react';

import { change } from 'common/changelog';
import { Spec } from 'game/SPECS';
import CombatLogParser from 'parser/core/CombatLogParser';

export interface Contributor {
  nickname: string;
  github: string;
  discord?: string;
  twitter?: string;
  avatar?: string;
  desc?: string;
  mains?: Array<{ name: string; spec: any; link: string }>;
  alts?: Array<{ name: string; spec: any; link: string }>;
}

interface Config {
  /**
   * The people that have contributed to this spec recently. People don't have
   * to sign up to be long-time maintainers to be included in this list. If
   * someone built a large part of the spec or contributed something recently to
   * that spec, they can be added to the contributors list. If someone goes MIA,
   * they may be removed after major changes or during a new expansion.
   */
  contributors: Contributor[];
  /**
   * The WoW client patch this spec was last updated to be fully compatible
   * with.
   */
  patchCompatibility:
    | '7.3'
    | '8.0.1'
    | '8.1'
    | '8.1.5'
    | '8.2.5'
    | '8.3'
    | string;
  /**
   * If set to `false`, the spec will show up as unsupported.
   */
  isSupported: boolean;
  /**
   * Explain the status of this spec's analysis here. Try to mention how
   * complete it is, and perhaps show links to places users can learn more.
   * If this spec's analysis does not show a complete picture please mention
   * this in the `<Warning>` component.
   */
  description: ReactNode;
  /**
   * A recent example report to see interesting parts of the spec. Will be shown
   * on the homepage.
   */
  exampleReport: string;
  builds?: {
    [id: string]: {
      url: string;
      name: string;
      icon: ReactNode;
      /**
       * Whether the build should be visible. Using `false` can allow you to
       * incrementally add support to modules, without having to bundle
       * everything in a single giant PR or release it incomplete.
       */
      visible: boolean;
    };
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
  changelog: ReturnType<typeof change>[];
  /**
   * The CombatLogParser class for your spec.
   */
  parser: () => Promise<typeof CombatLogParser>;
  /**
   * The path to the current directory (relative form project root). This is
   * used for generating a GitHub link directly to your spec's code.
   */
  path: string;
}

export default Config;
