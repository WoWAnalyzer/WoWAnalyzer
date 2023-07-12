import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

const UNDULATION_HEALING_INCREASE = 0.5;
const BUFFER_MS = 300;

class Undulation extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNDULATION_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([TALENTS.HEALING_WAVE_TALENT, SPELLS.HEALING_SURGE]),
      this._onHeal,
    );
  }
  _onHeal(event: HealEvent) {
    const hasUndulation = this.selectedCombatant.hasBuff(
      SPELLS.UNDULATION_BUFF.id,
      event.timestamp,
      BUFFER_MS,
      BUFFER_MS,
    );

    if (hasUndulation) {
      this.healing += calculateEffectiveHealing(event, UNDULATION_HEALING_INCREASE);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.UNDULATION_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default Undulation;
