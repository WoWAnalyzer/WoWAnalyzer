import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { PULSE_CAPACITOR_INCREASE } from '../../../constants';

class PulseCapacitor extends Analyzer {
  healingContribution = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PULSE_CAPACITOR_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.healingContribution += calculateEffectiveHealing(event, PULSE_CAPACITOR_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingContribution)}</strong> bonus healing
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PULSE_CAPACITOR_TALENT}>
          <ItemHealingDone amount={this.healingContribution} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PulseCapacitor;
