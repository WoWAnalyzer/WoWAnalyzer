import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellLink from 'interface/SpellLink';
import { CRISIS_MANAGEMENT_PER_RANK } from '../../../constants';

const AFFECTED_SPELLS = [SPELLS.FLASH_HEAL, TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT];

/**
 * Crisis Management
 * Increases the critical strike chance of Flash Heal and Prayer of Healing by 15%.
 */

class CrisisManagement extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
  private totalAttributableHealing = 0;
  private critIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CRISIS_MANAGEMENT_TALENT);

    if (this.active) {
      this.critIncrease = CRISIS_MANAGEMENT_PER_RANK;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS),
      this.onAffectedHeal,
    );
  }

  /**
   * Estimates the healing contributed by the increased critical strike chance.
   * For each critical heal of a spell that benefits from the talent, we calculate:
   * - The extra healing from this heal being a crit compared to a non‑crit.
   * - Then attribute a fraction of that extra healing equal to the proportion of
   *   the increased crit chance relative to the player's total crit chance at that moment.
   */
  private onAffectedHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;

    const extraHealingFromCrit = raw - raw / 2;
    const effectiveExtraHealing = Math.max(0, extraHealingFromCrit - overheal);

    const totalCritChance = this.statTracker.currentCritPercentage + this.critIncrease;
    const fractionFromTalent = this.critIncrease / totalCritChance;

    this.totalAttributableHealing += effectiveExtraHealing * fractionFromTalent;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              This talent increases the critical strike chance of{' '}
              <SpellLink spell={SPELLS.FLASH_HEAL} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} /> by{' '}
              {this.critIncrease * 100}%.
            </div>
            <div>
              The value shown is the estimated healing contributed by this additional crit chance,
              based on the proportion of your total crit chance that comes from the talent.
            </div>
            <div>
              Note: This module does not yet account for contributions to{' '}
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} /> or other secondary healing effects,
              which may undervalue the talent slightly.
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.CRISIS_MANAGEMENT_TALENT}>
          <ItemPercentHealingDone amount={this.totalAttributableHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CrisisManagement;
