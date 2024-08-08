import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { CastEvent, DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import InsanityIcon from 'interface/icons/Insanity';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { DISTORTED_REALITY_MULTIPLIER } from '../../constants';

class DistortedReality extends Analyzer {
  damage = 0;
  insanitySpent = 0; // extra insanity requred to cast spell

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DISTORTED_REALITY_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDevouringPlagueDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDevouringPlagueCast,
    );
  }

  onDevouringPlagueDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, DISTORTED_REALITY_MULTIPLIER);
  }

  onDevouringPlagueCast(event: CastEvent) {
    const resource = event.classResources?.at(0)?.cost; //Some buffs grant free Devouring Plagues, which do not have a resource cost
    if (resource !== undefined) {
      //If devouring Plague is free, then we have not spent the extra insanity
      this.insanitySpent += 5;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Amount of extra Insanity used due to the increased cost"
      >
        <BoringSpellValueText spell={TALENTS.DISTORTED_REALITY_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            <InsanityIcon /> {formatNumber(this.insanitySpent)} <small> Extra Insanity Cost</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DistortedReality;
