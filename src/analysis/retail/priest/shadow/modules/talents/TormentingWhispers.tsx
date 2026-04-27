import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { TORMENTING_WHISPERS_DAMAGE_PER_RANK } from '../../constants';

class TormentingWhispers extends Analyzer {
  damage = 0;

  multiplierTormentingWhispers =
    this.selectedCombatant.getTalentRank(TALENTS.TORMENTING_WHISPERS_TALENT) *
    TORMENTING_WHISPERS_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORMENTING_WHISPERS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_MADNESS_TALENT),
      this.onSWMDamage,
    );
  }

  onSWMDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierTormentingWhispers);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.TORMENTING_WHISPERS_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TormentingWhispers;
