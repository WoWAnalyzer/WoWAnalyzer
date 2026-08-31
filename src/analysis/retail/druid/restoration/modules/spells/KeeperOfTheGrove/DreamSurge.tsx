import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

const DREAM_SURGE_BASE_TARGETS = 3;

/**
 * **Dream Surge**
 * Hero Talent - Keeper of the Grove (keystone)
 *
 * When Grove Guardians are summoned, they grow Dream Petals on your target,
 * healing up to 3 nearby allies.
 *
 * No solo statistic card (Dream Bloom is visible in the healing breakdown).
 * Hero-tree {@link totalHealing} is the base-target share of Dream Bloom:
 * all of it without Power of the Dream, or 3/4 when PotD adds a 4th target.
 */
export default class DreamSurge extends Analyzer {
  private rawHealing = 0;
  private readonly hasPowerOfTheDream: boolean;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DREAM_SURGE_TALENT);
    this.hasPowerOfTheDream = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DREAM_BLOOM),
      this.onDreamBloomHeal,
    );
  }

  private onDreamBloomHeal(event: HealEvent) {
    this.rawHealing += event.amount + (event.absorbed || 0);
  }

  /** Base Dream Surge share for the hero-tree total (excludes PotD's extra ally). */
  get totalHealing() {
    if (this.hasPowerOfTheDream) {
      const totalTargets = DREAM_SURGE_BASE_TARGETS + 1;
      return (this.rawHealing * DREAM_SURGE_BASE_TARGETS) / totalTargets;
    }
    return this.rawHealing;
  }
}
