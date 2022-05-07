import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/HelpfulFormulas';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS = [
  0,
  0.07,
  0.08,
  0.09,
  0.1,
  0.11,
  0.12,
  0.13,
  0.14,
  0.15,
  0.16,
  0.17,
  0.18,
  0.19,
  0.2,
  0.21,
];

class PoisonedKatar extends Analyzer {
  conduitRank: number = 0;
  bonusDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.POISONED_KATAR.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.POISONED_KATAR.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FAN_OF_KNIVES),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <ConduitSpellText spellId={SPELLS.POISONED_KATAR.id} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default PoisonedKatar;
