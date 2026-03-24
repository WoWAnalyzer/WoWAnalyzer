import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { AC_DAMAGE_BONUS } from '../../constants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class AbsoluteCorruption extends Analyzer {
  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ABSOLUTE_CORRUPTION_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell(
          this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
            ? SPELLS.WITHER_DEBUFF
            : SPELLS.CORRUPTION_DEBUFF,
        ),
      this.onCorruptionDamage,
    );
  }

  onCorruptionDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.bonusDmg)} bonus damage
            <br />
            <br />
            Note: This only accounts for the passive 15% increased damage of Corruption. Actual
            bonus damage should be higher due to saved GCDs.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ABSOLUTE_CORRUPTION_TALENT}>
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AbsoluteCorruption;
