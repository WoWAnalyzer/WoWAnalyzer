import TALENTS from 'common/TALENTS/rogue';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const DAMAGE_BONUS = 0.75;

class Reverberation extends Analyzer {
  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REVERBERATION_TALENT);
    this.conduitRank = 0;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.ECHOING_REPRIMAND_TALENT),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.REVERBERATION_TALENT}>
          <ItemDamageDone amount={this.bonusDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Reverberation;
