import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatants from 'parser/shared/modules/Combatants';
import HIT_TYPES from 'game/HIT_TYPES';
import {
  calculateEffectiveHealingFromCritIncrease,
  calculateOverhealingFromCritIncrease,
} from 'parser/core/EventCalculateLib';

const MS_BUFFER = 100;
export const ABUNDANCE_MANA_REDUCTION = 0.6;
export const ABUNDANCE_INCREASED_CRIT = 0.6;
const IMP_REGROWTH_CRIT_BONUS = 0.4;
const INTENSITY_CRIT_HEAL_MULTIPLIER = 2.6;

/**
 * **Abundance**
 * Spec Talent Tier 9
 *
 * While you have at least 5 Rejuvenations active, Regrowth's cost is reduced by 60% and critical
 * effect chance is increased by 60%.
 */
class Abundance extends Analyzer.withDependencies({
  statTracker: StatTracker,
  combatants: Combatants,
}) {
  hasImpRegrowth: boolean;
  hasIntensity: boolean;

  /** Total healing attributable to increased crit */
  totalEffCritHealing = 0;
  /** Total overhealing attributable to increased crit */
  totalEffCritOverhealing = 0;
  /** Total crit percent cumulatively (divide by abundanceHits for avg) - respects 100% cap */
  totalEffCritGain = 0;
  /** Number of Regrowth healing events with Abundance active */
  abundanceHits = 0;
  /** Number of non-free Regrowth casts with Abundance active */
  abundanceManaCasts = 0;
  /** Number of non-free Regrowth casts */
  manaCasts = 0;
  /** Number of Regrowth healing events (direct and periodic) */
  allHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    this.hasImpRegrowth = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPROVED_REGROWTH_TALENT);
    this.hasIntensity = this.selectedCombatant.hasTalent(TALENTS_DRUID.INTENSITY_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHit);
  }

  // Crit attribution applies to all Regrowth healing events, direct and periodic.
  // Improved Regrowth itself is only a direct-heal modifier.
  onHit(event: HealEvent) {
    const hasAbundance = this.selectedCombatant.hasBuff(
      SPELLS.ABUNDANCE_BUFF.id,
      event.timestamp,
      MS_BUFFER,
    );

    this.allHits += 1;
    if (hasAbundance) {
      this.abundanceHits += 1;
    }

    // more complex calc for effective crit gain because we can't go over 100%
    let currCrit = this.deps.statTracker.currentCritPercentage;
    if (this.hasImpRegrowth && !event.tick) {
      const tar = this.deps.combatants.getEntity(event);
      if (tar && tar.hasOwnBuff(SPELLS.REGROWTH)) {
        currCrit += IMP_REGROWTH_CRIT_BONUS;
      }
    }
    currCrit = Math.min(1, currCrit);
    const bonusCrit = hasAbundance ? Math.min(1 - currCrit, ABUNDANCE_INCREASED_CRIT) : 0;

    this.totalEffCritGain += bonusCrit;

    if (event.hitType !== HIT_TYPES.CRIT || bonusCrit <= 0) {
      return;
    }

    this.totalEffCritHealing += this.hasIntensity
      ? calculateEffectiveHealingFromCritIncrease(
          event,
          currCrit,
          bonusCrit,
          INTENSITY_CRIT_HEAL_MULTIPLIER,
        )
      : calculateEffectiveHealingFromCritIncrease(event, currCrit, bonusCrit);
    this.totalEffCritOverhealing += this.hasIntensity
      ? calculateOverhealingFromCritIncrease(
          event,
          currCrit,
          bonusCrit,
          INTENSITY_CRIT_HEAL_MULTIPLIER,
        )
      : calculateOverhealingFromCritIncrease(event, currCrit, bonusCrit);
  }

  // The mana discount is relevant only for non-free Regrowth casts, deal with it here
  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasOwnBuff(SPELLS.CLEARCASTING_BUFF, MS_BUFFER)) {
      return; // don't tally already free casts
    }
    this.manaCasts += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.ABUNDANCE_BUFF.id, event.timestamp, MS_BUFFER)) {
      this.abundanceManaCasts += 1;
    }
  }

  /** Fraction of Regrowth healing events with Abundance active */
  get abundanceHitRate() {
    return this.allHits === 0 ? 0 : this.abundanceHits / this.allHits;
  }

  /** Fraction of non-free Regrowth casts with Abundance active */
  get abundanceManaCastRate() {
    return this.manaCasts === 0 ? 0 : this.abundanceManaCasts / this.manaCasts;
  }

  /** Average discount to non-free Regrowth casts */
  get avgPercentManaSaved() {
    return ABUNDANCE_MANA_REDUCTION * this.abundanceManaCastRate;
  }

  /** Average effective crit gain on Regrowth hits while Abundance is up */
  get avgCritGain() {
    return this.abundanceHits === 0 ? 0 : this.totalEffCritGain / this.abundanceHits;
  }

  get abundanceBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ABUNDANCE_BUFF.id);
  }

  get abundanceBuffUptimePercent() {
    return this.abundanceBuffUptime / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <p>
              Abundance was active for Regrowth heals (direct and periodic)
              <strong> {formatPercentage(this.abundanceHitRate, 1)}%</strong> of the time. For
              non-free Regrowth casts, it was active{' '}
              <strong>{formatPercentage(this.abundanceManaCastRate, 1)}%</strong> of the time.
            </p>
            <p>
              Abundance buff uptime: <strong>{formatDuration(this.abundanceBuffUptime)}</strong> (
              <strong>{formatPercentage(this.abundanceBuffUptimePercent, 1)}%</strong>)
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
                <li>
                  <strong>
                    Overhealing:{' '}
                    {formatOverhealing(this.totalEffCritOverhealing, this.totalEffCritHealing)}
                  </strong>
                </li>
              </ul>
            </p>
            <p>
              Listed average crit gain may be lower than 60% because crit gain over 100% crit is not
              counted.
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.ABUNDANCE_TALENT}>
          <ItemPercentHealingDone amount={this.totalEffCritHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Abundance;
