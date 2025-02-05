import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

// 215% instead of 200% is a 7.5% increase
const WHITE_WATER_BUFF = 0.075;

export default class WhiteWater extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WHITE_WATER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    // ignore non-crit heals
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    this.healingDoneFromTalent += calculateEffectiveHealing(event, WHITE_WATER_BUFF);

    this.overhealingDoneFromTalent += calculateOverhealing(event, WHITE_WATER_BUFF);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.WHITE_WATER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
