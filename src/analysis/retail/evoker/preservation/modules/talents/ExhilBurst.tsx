import SPELLS from 'common/SPELLS/evoker';
import { TALENTS_EVOKER } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class ExhilBurst extends Analyzer {
  totalBoost: number = 0;
  totalHealing: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.EXHILARATING_BURST_TALENT);
    this.totalBoost =
      this.selectedCombatant.getTalentRank(TALENTS_EVOKER.EXHILARATING_BURST_TALENT) * 0.075;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.EXHIL_BURST_BUFF.id) &&
      event.hitType === HIT_TYPES.CRIT
    ) {
      this.totalHealing += calculateEffectiveHealing(event, this.totalBoost);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.EXHILARATING_BURST_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ExhilBurst;
