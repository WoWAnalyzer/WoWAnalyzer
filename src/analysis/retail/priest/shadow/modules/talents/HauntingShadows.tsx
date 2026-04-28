import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import { HAUNTING_SHADOWS_DAMAGE_PER_RANK } from '../../constants';

class HauntingShadows extends Analyzer {
  damage = 0;

  multiplierHauntingShadows =
    this.selectedCombatant.getTalentRank(TALENTS.HAUNTING_SHADOWS_TALENT) *
    HAUNTING_SHADOWS_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HAUNTING_SHADOWS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onSADamage,
    );
  }

  onSADamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierHauntingShadows);
  }

  subStatistic() {
    return (
      <BoringSpellValueText spell={TALENTS.HAUNTING_SHADOWS_TALENT}>
        <div>
          <ItemDamageDone amount={this.damage} />
        </div>
      </BoringSpellValueText>
    );
  }
}

export default HauntingShadows;
