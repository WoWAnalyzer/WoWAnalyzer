import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS = 0.2;

/*
  From the Shadows:
    Casting Call Dreadstalkers causes the target to take 20% additional Shadowflame damage from you for the next 12 sec.
 */
class TheHoundmastersStratagem extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THE_HOUNDMASTERS_STRATAGEM_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEMONBOLT, SPELLS.HAND_OF_GULDAN_DAMAGE, SPELLS.IMPLOSION_DAMAGE]),
      this.handleDamage,
    );
  }

  handleDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.FROM_THE_SHADOWS_DEBUFF.id)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} bonus damage`}
      >
        <BoringSpellValueText spellId={TALENTS.THE_HOUNDMASTERS_STRATAGEM_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TheHoundmastersStratagem;
