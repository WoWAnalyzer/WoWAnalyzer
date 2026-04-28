import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { DESCENDING_DARKNESS_DAMAGE_PER_RANK } from '../../constants';

class DescendingDarkness extends Analyzer {
  damage = 0;

  multiplierDescendingDarkness =
    this.selectedCombatant.getTalentRank(TALENTS.DESCENDING_DARKNESS_TALENT) *
    DESCENDING_DARKNESS_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DESCENDING_DARKNESS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TENTACLE_SLAM_TALENT_DAMAGE),
      this.onTSDamage,
    );
  }

  onTSDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.multiplierDescendingDarkness);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.DESCENDING_DARKNESS_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DescendingDarkness;
