import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DistortedReality extends Analyzer {
  damage = 0;
  insanity = 0; // extra insanity requred to cast spell
  multiplierDistortedReality = 0.2; //20%

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
    this.damage += calculateEffectiveDamage(event, this.multiplierDistortedReality);
  }

  onDevouringPlagueCast() {
    this.insanity += 5;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Amount of Insanity Lost due to higher cost"
      >
        <BoringSpellValueText spell={TALENTS.DISTORTED_REALITY_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
            <ItemInsanityGained amount={this.insanity} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DistortedReality;
