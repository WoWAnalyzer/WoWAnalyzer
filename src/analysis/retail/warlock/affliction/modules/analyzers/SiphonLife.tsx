import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SL_DAMAGE_BONUS } from '../../constants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class SiphonLife extends Analyzer {
  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SIPHON_LIFE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CORRUPTION_DEBUFF),
      this.onCorruptionDamage,
    );
  }

  onCorruptionDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, SL_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>{formatThousands(this.bonusDmg)} bonus damage</>}
      >
        <BoringSpellValueText spell={TALENTS.SIPHON_LIFE_TALENT}>
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SiphonLife;
