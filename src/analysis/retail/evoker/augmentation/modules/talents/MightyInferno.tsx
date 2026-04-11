import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { MIGHTY_INFERNO_DAMAGE_MULTIPLIER } from '../../constants';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';

/**
 * Inferno's Blessing deals 40% increased damage.
 * Sands of Time also extends Inferno's Blessing. [NYI]
 */
class MightyInferno extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIGHTY_INFERNO_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, MIGHTY_INFERNO_DAMAGE_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.damage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MIGHTY_INFERNO_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MightyInferno;
