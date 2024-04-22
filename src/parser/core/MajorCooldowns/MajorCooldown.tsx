import { ReactNode } from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { isTalent } from 'common/TALENTS/types';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import {
  ChecklistUsageInfo,
  SpellUse,
  spellUseToBoxRowEntry,
  UsageInfo,
} from 'parser/core/SpellUsage/core';
import { AnyEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { isPresent } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

/**
 * Simple interface intended to be extended by any casts used by MajorCooldown.
 */
export interface CooldownTrigger<T extends AnyEvent> {
  event: T;
}

interface CooldownOptions {
  spell: Spell;
}

export const createChecklistItem = <Trigger extends CooldownTrigger<AnyEvent>>(
  check: string,
  trigger: Trigger,
  usageInfo: UsageInfo | undefined,
): ChecklistUsageInfo | undefined => {
  if (!usageInfo) {
    return undefined;
  }
  return { check, timestamp: trigger.event.timestamp, ...usageInfo };
};

export const createSpellUse = <Trigger extends CooldownTrigger<AnyEvent>>(
  { event }: Trigger,
  possibleChecklistItems: (ChecklistUsageInfo | null | undefined)[],
): SpellUse => {
  const checklistItems = possibleChecklistItems.filter(isPresent);
  const performance = combineQualitativePerformances(
    checklistItems.map((item) => item.performance),
  );
  const performanceExplanation =
    performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage';
  return {
    event,
    performance,
    checklistItems,
    performanceExplanation,
  };
};

/**
 * An abstract analyzer to make data about major cooldown casts easy to convert into a relatively
 * standard Guide SubSection.
 *
 * For example, see Soul Carver section in: /report/WFqxPGv4XBQfTgy6/4-Heroic+Eranog+-+Kill+(3:25)/Artydh/standard
 */
export default abstract class MajorCooldown<
  Cast extends CooldownTrigger<AnyEvent>,
> extends Analyzer {
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
