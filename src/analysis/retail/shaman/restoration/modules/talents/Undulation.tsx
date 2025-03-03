import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

const UNDULATION_HEALING_INCREASE = 0.5;
const BUFFER_MS = 300;

class Undulation extends Analyzer {
  healing = 0;
  overHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNDULATION_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.HEALING_WAVE, SPELLS.HEALING_SURGE]),
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
      this.overHealing += calculateOverhealing(event, UNDULATION_HEALING_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healing)}</strong> bonus healing (
            {formatNumber(this.overHealing)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.UNDULATION_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Undulation;
