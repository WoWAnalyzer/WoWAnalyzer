import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { BV_DAMAGE_INCREASE_PER_RANK } from '../../../constants';

class BurningVehemence extends Analyzer {
  damageBonus = 0;
  damageFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BURNING_VEHEMENCE_TALENT);
    this.damageBonus =
      BV_DAMAGE_INCREASE_PER_RANK[
        this.selectedCombatant.getTalentRank(TALENTS.BURNING_VEHEMENCE_TALENT)
      ];
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BURNING_VEHEMENCE_DAMAGE),
      this.onCleaveDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damageFromTalent += calculateEffectiveDamage(event, this.damageBonus);
  }

  onCleaveDamage(event: DamageEvent) {
    this.damageFromTalent += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
      >
        <BoringSpellValueText spell={TALENTS.BURNING_VEHEMENCE_TALENT}>
          <ItemDamageDone amount={this.damageFromTalent} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BurningVehemence;
