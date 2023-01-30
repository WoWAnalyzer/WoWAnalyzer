import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const DAMAGE_INCREASE_FROM_BURNING_VEHEMENCE = 0.25;

class BurningVehemence extends Analyzer {
  holyFireDamage = 0;
  holyFireCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BURNING_VEHEMENCE_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE), this.onDamage);
  }

  onCast(event: CastEvent) {
    this.holyFireCasts += 1;
  }

  onDamage(event: DamageEvent) {
    this.holyFireDamage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    const damageIncrease = this.holyFireDamage * DAMAGE_INCREASE_FROM_BURNING_VEHEMENCE;
    return (
      <Statistic
        tooltip={
          <>
            Holy Fire Casts: {this.holyFireCasts}
            <br />
            Total Damage: {formatThousands(this.holyFireDamage)}
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
      >
        <BoringSpellValueText spellId={TALENTS.BURNING_VEHEMENCE_TALENT.id}>
          <ItemDamageDone amount={damageIncrease} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BurningVehemence;
