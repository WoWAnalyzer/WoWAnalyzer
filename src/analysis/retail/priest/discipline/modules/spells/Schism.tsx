import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AtonementDamageSource from '../features/AtonementDamageSource';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import SPELLS from 'common/SPELLS';
import { ATONEMENT_DAMAGE_IDS } from '../../constants';

const NON_AMPED_DAMAGE = [
  SPELLS.MAGIC_MELEE.id,
  TALENTS_PRIEST.INESCAPABLE_TORMENT_TALENT.id,
  SPELLS.LIGHTSPAWN_MELEE.id,
  TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT.id,
];

const SCHISM_DAMAGE_IDS = ATONEMENT_DAMAGE_IDS.filter((spell) => !NON_AMPED_DAMAGE.includes(spell));

class Schism extends Analyzer {
  protected enemies!: Enemies;
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  static bonus = 0.1;

  private damageFromBuff = 0;
  private healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.SCHISM_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }
    const target = this.enemies.getEntity(damageEvent);

    if (
      !target?.hasBuff(SPELLS.SCHISM_DEBUFF.id) ||
      NON_AMPED_DAMAGE.includes(damageEvent.ability.guid)
    ) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, Schism.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);

    if (!SCHISM_DAMAGE_IDS.includes(event.ability.guid)) {
      return;
    }
    if (target?.hasBuff(TALENTS_PRIEST.SCHISM_TALENT.id)) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={
          <>
            The effective healing contributed by Schism was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% of total
            healing done.
            <br />
            The effective damage contributed by the Schism bonus was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff))}% of
            total damage done. <br />
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.SCHISM_TALENT}>
          <ItemHealingDone amount={this.healing} /> <br />
          <ItemDamageDone amount={this.damageFromBuff} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Schism;
