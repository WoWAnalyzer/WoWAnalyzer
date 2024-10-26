import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { RUSHING_WIND_KICK_INCREASE } from '../../constants';

class RushingWindKick extends Analyzer {
  healing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RUSHING_WINDS_BUFF)) {
      this.healing += calculateEffectiveHealing(event, RUSHING_WIND_KICK_INCREASE);
    }
  }
}

export default RushingWindKick;
