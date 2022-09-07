import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const EARTHEN_SPIKE = {
  INCREASE: 0.2,
};

/**
 * Summons an Earthen Spike under an enemy, dealing (108% of Attack power)
 * Physical damage and increasing Physical and Nature damage you deal
 * to the target by 20% for 10 sec.
 *
 * Example Log:
 *
 */
class EarthenSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  protected damageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTHEN_SPIKE_TALENT),
      this.onEarthenSpikeDamage,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAnyDamage);
  }

  get buffedSchools() {
    return [MAGIC_SCHOOLS.ids.PHYSICAL, MAGIC_SCHOOLS.ids.NATURE];
  }

  onEarthenSpikeDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onAnyDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    if (!enemy.hasBuff(SPELLS.EARTHEN_SPIKE_TALENT.id)) {
      return;
    }

    if (!this.buffedSchools.includes(event.ability.type)) {
      return;
    }

    this.damageGained += calculateEffectiveDamage(event, EARTHEN_SPIKE.INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.EARTHEN_SPIKE_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EarthenSpike;
