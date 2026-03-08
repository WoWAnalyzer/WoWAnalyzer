import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const BOOMING_VOICE_DAMAGE_INCREASE = 0.2;

class BoomingVoice extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.DEMORALIZING_SHOUT.id)) {
      this.bonusDmg += calculateEffectiveDamage(event, BOOMING_VOICE_DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.BOOMING_VOICE_TALENT} /> Damage
            </>
          }
        >
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default BoomingVoice;
