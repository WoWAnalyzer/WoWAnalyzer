import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { GRACE_PERIOD_INCREASE } from '../../constants';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';
import { getHealForLifebindHeal } from '../../normalizers/EventLinking/helpers';

class GracePeriod extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };
  protected hotTracker!: HotTrackerPrevoker;
  gracePeriodIncrease: number = 0;
  healingFromIncrease: number = 0;
  overhealFromIncrease: number = 0;
  lifebindIncrease: number = 0;
  lifebindOverheal: number = 0;
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
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBIND_HEAL),
      this.onLifebindHeal,
    );
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
    if (reversion && echoReversion) {
      totalIncrease = (1 + this.gracePeriodIncrease) * (1 + this.gracePeriodIncrease) - 1;
    }
    this.healingFromIncrease += calculateEffectiveHealing(event, totalIncrease);
    this.overhealFromIncrease += calculateOverhealing(event, totalIncrease);
  }

  onLifebindHeal(event: HealEvent) {
    const sourceEvent = getHealForLifebindHeal(event);
    if (!sourceEvent) {
      return;
    }
    const targetId = sourceEvent?.targetID;
    if (!this.hotTracker.hots[targetId]) {
      return;
    }
    const reversion = this.hotTracker.hots[targetId][TALENTS_EVOKER.REVERSION_TALENT.id];
    const echoReversion = this.hotTracker.hots[targetId][SPELLS.REVERSION_ECHO.id];
    if (!reversion && !echoReversion) {
      return;
    }
    let totalIncrease = this.gracePeriodIncrease;
    if (reversion && echoReversion) {
      totalIncrease = (1 + this.gracePeriodIncrease) * (1 + this.gracePeriodIncrease) - 1;
    }
    this.lifebindIncrease += calculateEffectiveHealing(event, totalIncrease);
    this.lifebindOverheal += calculateOverhealing(event, totalIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={TALENTS_EVOKER.GRACE_PERIOD_TALENT} /> provided the following:
            <ul>
              <li>
                {formatNumber(this.healingFromIncrease + this.lifebindIncrease)} total effective
                healing
              </li>
              <li>
                {formatNumber(this.overhealFromIncrease + this.lifebindOverheal)} total overheal
              </li>
              <li>
                {formatNumber(this.lifebindIncrease)}{' '}
                <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> effective healing
              </li>
              <li>
                {formatNumber(this.lifebindOverheal)}{' '}
                <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> overheal
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.GRACE_PERIOD_TALENT}>
          <ItemHealingDone amount={this.healingFromIncrease + this.lifebindIncrease} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default GracePeriod;
