import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const THUNDER_CAPACITOR_DAMAGE_INCREASE = 0.2;

/**
 * Lightning Bolt and Chain Lightning deal 20% increased damage
 * and have a 20% chance to refund the Maelstrom Weapon spent.
 */

class ThunderCapacitor extends Analyzer {
  private bonusDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.THUNDER_CAPACITOR_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT]),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }

    this.bonusDamage += calculateEffectiveDamage(event, THUNDER_CAPACITOR_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.THUNDER_CAPACITOR_TALENT}>
          <div>
            <ItemDamageDone amount={this.bonusDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ThunderCapacitor;
