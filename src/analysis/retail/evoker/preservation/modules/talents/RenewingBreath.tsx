import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { RENEWING_BREATH_INCREASE } from '../../constants';

class RenewingBreath extends Analyzer {
  effectiveHealing: number = 0;
  overhealing: number = 0;
  totalIncrease: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.RENEWING_BREATH_TALENT);
    this.totalIncrease =
      this.selectedCombatant.getTalentRank(TALENTS_EVOKER.RENEWING_BREATH_TALENT) *
      RENEWING_BREATH_INCREASE;
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH_ECHO, SPELLS.DREAM_BREATH]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.effectiveHealing += calculateEffectiveHealing(event, this.totalIncrease);
    this.overhealing += calculateOverhealing(event, this.totalIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Total effective healing: {formatNumber(this.effectiveHealing)}</li>
            <li>Total overhealing: {formatNumber(this.overhealing)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.RENEWING_BREATH_TALENT}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RenewingBreath;
