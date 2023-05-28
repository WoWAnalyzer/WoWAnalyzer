import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/EventSubscriber';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { GRACE_PERIOD_INCREASE } from '../../constants';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class GracePeriod extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };
  protected hotTracker!: HotTrackerPrevoker;
  gracePeriodIncrease: number = 0;
  healingFromIncrease: number = 0;
  overhealFromIncrease: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.GRACE_PERIOD_TALENT);
    if (!this.active) {
      return;
    }
    this.gracePeriodIncrease =
      GRACE_PERIOD_INCREASE *
      this.selectedCombatant.getTalentRank(TALENTS_EVOKER.GRACE_PERIOD_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.calculateHealingIncrease);
  }

  calculateHealingIncrease(event: HealEvent) {
    const targetId = event.targetID;
    if (!this.hotTracker.hots[targetId]) {
      return;
    }
    const reversion = this.hotTracker.hots[targetId][TALENTS_EVOKER.REVERSION_TALENT.id];
    const echoReversion = this.hotTracker.hots[targetId][SPELLS.REVERSION_ECHO.id];
    if (!reversion && !echoReversion) {
      return;
    }
    let totalIncrease = this.gracePeriodIncrease;
    if (reversion) {
      if (echoReversion) {
        //grace periods' healing amp is multiplicative and increases itself
        totalIncrease = (1 + this.gracePeriodIncrease) * (1 + this.gracePeriodIncrease) - 1;
      }
      this.healingFromIncrease += calculateEffectiveHealing(event, totalIncrease);
      this.overhealFromIncrease += calculateOverhealing(event, totalIncrease);
    } else if (echoReversion) {
      this.healingFromIncrease += calculateEffectiveHealing(event, totalIncrease);
      this.overhealFromIncrease += calculateOverhealing(event, totalIncrease);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink id={TALENTS_EVOKER.GRACE_PERIOD_TALENT.id} /> provided the following:
            <ul>
              <li>{formatNumber(this.healingFromIncrease)} effective healing</li>
              <li>{formatNumber(this.overhealFromIncrease)} overheal</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.GRACE_PERIOD_TALENT}>
          <ItemHealingDone amount={this.healingFromIncrease} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default GracePeriod;
