import { ReactNode } from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { isTalent, Talent } from 'common/TALENTS/types';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import {
  ChecklistUsageInfo,
  SpellUse,
  spellUseToBoxRowEntry,
  UsageInfo,
} from 'parser/core/SpellUsage/core';
import { CastEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';

/**
 * Simple interface intended to be extended by any casts used by MajorCooldown.
 */
export interface SpellCast {
  event: CastEvent;
}

interface CooldownOptions {
  spell: Talent;
}

export const createChecklistItem = <Cast extends SpellCast>(
  check: string,
  cast: Cast,
  usageInfo: UsageInfo | undefined,
): ChecklistUsageInfo | undefined => {
  if (!usageInfo) {
    return undefined;
  }
  return { check, timestamp: cast.event.timestamp, ...usageInfo };
};

/**
 * An abstract analyzer to make data about major cooldown casts easy to convert into a relatively
 * standard Guide SubSection.
 *
 * For example, see Soul Carver section in: /report/WFqxPGv4XBQfTgy6/4-Heroic+Eranog+-+Kill+(3:25)/Artydh/standard
 */
export default abstract class MajorCooldown<Cast extends SpellCast> extends Analyzer {
  private cooldownCasts: Cast[] = [];
  private cooldownUses: SpellUse[] = [];
  readonly spell: Spell;

  protected constructor({ spell }: CooldownOptions, options: Options) {
    super(options);
    this.spell = spell;
    this.active = isTalent(this.spell) ? this.selectedCombatant.hasTalent(this.spell) : true;
  }

  get casts() {
    return this.cooldownCasts;
  }

  get uses() {
    return this.cooldownUses;
  }

  abstract description(): ReactNode;

  abstract explainPerformance(cast: Cast): SpellUse;

  cooldownPerformance(): BoxRowEntry[] {
    const fightStart = this.owner.fight.start_time;
    return this.cooldownUses.map((it) => spellUseToBoxRowEntry(it, fightStart));
  }

  protected recordCooldown(cast: Cast) {
    this.cooldownCasts.push(cast);
    this.cooldownUses.push(this.explainPerformance(cast));
  }
}
