import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { REJUVENATION_BUFFS } from 'analysis/retail/druid/restoration/constants';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import {
  calculateEffectiveHealing,
  calculateHealTargetHealthPercent,
} from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';

const DEBUG = false;

const REJUV_MAX_BOOST_PER_RANK = 0.15;
const TRANQ_MAX_BOOST_PER_RANK = 0.15;

/**
 * **Regenesis**
 * Spec Talent
 *
 * Rejuvenation healing is increased by up to (15 / 30)%, and Tranquility healing is increased by
 * up to (15 / 30)%, healing for more on low-health targets.
 */
class Regenesis extends Analyzer {
  ranks: number;
  rejuvBoostHealing: number = 0;
  tranqBoostHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.ranks = this.selectedCombatant.getTalentRank(TALENTS_DRUID.REGENESIS_TALENT);
    this.active = this.ranks > 0;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(REJUVENATION_BUFFS),
      this.onRejuvHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onTranqHeal,
    );
  }

  onRejuvHeal(event: HealEvent) {
    this.rejuvBoostHealing += this._getBoostHealing(event, REJUV_MAX_BOOST_PER_RANK * this.ranks);
  }

  onTranqHeal(event: HealEvent) {
    this.tranqBoostHealing += this._getBoostHealing(event, TRANQ_MAX_BOOST_PER_RANK * this.ranks);
  }

  _getBoostHealing(event: HealEvent, boostAmount: number): number {
    // Scaling on the boost is linear, with max boost when target is at 0% and no boost when target is full
    const healthPercentMissingBeforeHeal = 1 - calculateHealTargetHealthPercent(event);
    const att = calculateEffectiveHealing(event, boostAmount * healthPercentMissingBeforeHeal);
    if (DEBUG && event.amount > 0) {
      console.log(
        `${event.ability.name} heal for ${
          event.amount
        }\nw/ max boost ${boostAmount}\nmissing health ${healthPercentMissingBeforeHeal.toFixed(
          2,
        )}\nattributes ${att}\n`,
        event,
      );
    }
    return att;
  }

  get totalHealing() {
    return this.rejuvBoostHealing + this.tranqBoostHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Breakdown by boosted spell:
            <ul>
              <li>
                <SpellLink spell={SPELLS.REJUVENATION} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.rejuvBoostHealing)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.TRANQUILITY_HEAL} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.tranqBoostHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.REGENESIS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Regenesis;
