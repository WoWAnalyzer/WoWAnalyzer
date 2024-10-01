import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealingFromCritIncrease } from 'parser/core/EventCalculateLib';

const MS_BUFFER = 100;
export const ABUNDANCE_MANA_REDUCTION = 0.08;
const ABUNDANCE_INCREASED_CRIT = 0.08;
const IMP_REGROWTH_CRIT_BONUS = 0.4;

/**
 * **Abundance**
 * Spec Talent Tier 4
 *
 * For each Rejuvenation you have active, Regrowth's cost is reduced by 8% and critical effect
 * chance is increased by 8%, to a maximum of 96%.
 */
class Abundance extends Analyzer.withDependencies({
  statTracker: StatTracker,
  combatants: Combatants,
}) {
  hasImpRegrowth: boolean;

  /** Total healing attributable to increased crit */
  totalEffCritHealing = 0;
  /** Total crit percent cumulatively (divide by casts for avg) - respects 100% cap */
  totalEffCritGain = 0;
  /** Total cumulative stacks */
  totalStacks: number = 0;
  /** Total cumulative stacks for mana casts */
  totalManaStacks: number = 0;
  /** Number of non-free Regrowth casts */
  manaCasts: number = 0;
  /** Number of Regrowths (including free from Clearcast/NS or procced from Convoke) */
  allHits: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    this.hasImpRegrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPROVED_REGROWTH_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHit);
  }

  // The crit bonus is relevant for all Regrowth direct heals - deal with it here
  onHit(event: HealEvent) {
    if (event.tick) {
      return; // only tally the direct heals
    }
    const stacks = this.selectedCombatant.getOwnBuffStacks(SPELLS.ABUNDANCE_BUFF);

    this.allHits += 1;
    this.totalStacks += stacks;

    // more complex calc for effective crit gain because we can't go over 100%
    let currCrit = this.deps.statTracker.currentCritPercentage;
    if (this.hasImpRegrowth) {
      const tar = this.deps.combatants.getEntity(event);
      if (tar && tar.hasOwnBuff(SPELLS.REGROWTH)) {
        currCrit += IMP_REGROWTH_CRIT_BONUS;
      }
    }
    currCrit = Math.min(1, currCrit);
    const bonusCrit = Math.min(1 - currCrit, stacks * ABUNDANCE_INCREASED_CRIT);

    this.totalEffCritGain += bonusCrit;
    this.totalEffCritHealing += calculateEffectiveHealingFromCritIncrease(
      event,
      currCrit,
      bonusCrit,
    );
  }

  // The mana discount is relevant only for non-free Regrowth casts, deal with it here
  onCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasOwnBuff(SPELLS.CLEARCASTING_BUFF, MS_BUFFER) ||
      this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp, MS_BUFFER)
    ) {
      return; // don't tally already free casts
    }
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.ABUNDANCE_BUFF.id);

    this.manaCasts += 1;
    this.totalManaStacks += stacks;
  }

  /** Average stacks for any Regrowth direct heal */
  get avgStacks() {
    return this.allHits === 0 ? 0 : this.totalStacks / this.allHits;
  }

  /** Average stacks for Regrowth casts that weren't free */
  get avgManaStacks() {
    return this.manaCasts === 0 ? 0 : this.totalManaStacks / this.manaCasts;
  }

  /** Average discount to non-free Regrowth casts */
  get avgPercentManaSaved() {
    return ABUNDANCE_MANA_REDUCTION * this.avgManaStacks;
  }

  /** Average effective crit gain for Regrowth hits */
  get avgCritGain() {
    return this.allHits === 0 ? 0 : this.totalEffCritGain / this.allHits;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <p>
              The listed average stacks counts all direct Regrowth heals. The mana portion is only
              relevant to non-free casts however - your average stacks on non-free Regrowth casts
              was <strong>{this.avgManaStacks.toFixed(1)}</strong>.
            </p>
            <p>
              <ul>
                <li>
                  Avg mana discount:{' '}
                  <strong>{formatPercentage(this.avgPercentManaSaved, 1)}%</strong>
                </li>
                <li>
                  Avg crit gained: <strong>{formatPercentage(this.avgCritGain, 1)}%</strong>
                </li>
                <li>
                  Total healing gained from extra crits:{' '}
                  <strong>
                    {formatPercentage(
                      this.owner.getPercentageOfTotalHealingDone(this.totalEffCritHealing),
                      1,
                    )}
                    %
                  </strong>
                </li>
              </ul>
            </p>
            <p>
              Listed average crit gain may be lower than "stacks times bonus-per-stack" because crit
              gain over 100% crit is not counted.
            </p>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> Average Abundance stacks
            </>
          }
        >
          <>{this.avgStacks.toFixed(1)}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Abundance;
