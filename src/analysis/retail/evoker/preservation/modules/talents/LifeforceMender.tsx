import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class LifeforceMender extends Analyzer {
  totalIncrease = 0;
  damageDone = 0;
  healingDone = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEFORCE_MENDER_TALENT);
    if (!this.active) {
      return;
    }

    this.totalIncrease =
      this.selectedCombatant.getTalentRank(TALENTS_EVOKER.LIFEFORCE_MENDER_TALENT) * 0.2;

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIVING_FLAME_DAMAGE, SPELLS.FIRE_BREATH_DOT, SPELLS.TWIN_FLAME]),
      this.onDamage,
    );

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIVING_FLAME_HEAL, SPELLS.LIFE_GIVERS_FLAME_HEAL, SPELLS.TWIN_FLAME_HEAL]),
      this.onHeal,
    );
  }

  onDamage(event: DamageEvent) {
    this.damageDone += calculateEffectiveDamage(event, this.totalIncrease);
  }

  onHeal(event: HealEvent) {
    this.healingDone += calculateEffectiveHealing(event, this.totalIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>Extra damage from red spells: {formatNumber(this.damageDone)}</li>
              <li>Extra healing from red spells: {formatNumber(this.healingDone)}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.LIFEFORCE_MENDER_TALENT}>
          <div>
            <ItemDamageDone amount={this.damageDone} />
          </div>
          <div>
            <ItemHealingDone amount={this.healingDone} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LifeforceMender;
