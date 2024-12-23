import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent, Ability } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS';
import { getDamageEvent } from '../../../normalizers/AtonementTracker';
import ScovSourceDonut from './ShadowCovSourceDonut';
import { SpellLink } from 'interface';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

const SHADOW_BUFFED_HEALS = [
  SPELLS.DARK_REPRIMAND_HEAL.id,
  SPELLS.SHADOW_HALO_HEAL.id,
  SPELLS.SHADOW_DIVINE_STAR_HEAL.id,
  TALENTS_PRIEST.VAMPIRIC_EMBRACE_TALENT.id,
];

class ShadowCovenant extends Analyzer {
  bonus = 0;

  hasPtw = false;
  damage = 0;
  healing = 0;
  healingMap: Map<number, number> = new Map();
  abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.SHADOW_COVENANT_TALENT);

    this.bonus = this.calculateBonus();

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.SHADOW_COVENANT_TALENT),
      this.onHeal,
    );

    this.hasPtw = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PURGE_THE_WICKED_TALENT);
  }

  calculateBonus() {
    let bonus;

    // Check for VOIDWRAITH_TALENT first, since it overrides the initial bonus
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.VOIDWRAITH_TALENT)) {
      bonus = 0.25;
    } else {
      // voidwraith is not present
      bonus = this.selectedCombatant.hasTalent(TALENTS_PRIEST.MINDBENDER_DISCIPLINE_TALENT)
        ? 0.1
        : 0.25;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWILIGHT_CORRUPTION_TALENT)) {
      bonus += 0.1;
    }

    return bonus;
  }

  onAtoneHeal(event: HealEvent) {
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }

    // Shadow covenant only buffs expiation if you aren't talented into PTW
    if (damageEvent.ability.guid === SPELLS.EXPIATION_DAMAGE.id && this.hasPtw) {
      return;
    }

    if (
      !this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id) ||
      // Shadow spells only
      damageEvent.ability.type !== MAGIC_SCHOOLS.ids.SHADOW ||
      // no pets here
      damageEvent.ability.guid === -MAGIC_SCHOOLS.ids.SHADOW ||
      damageEvent.ability.guid === SPELLS.VOID_FLAY_DAMAGE_DISC.id
    ) {
      return;
    }

    this.attributeToMap(event.amount, damageEvent);
    this.healing += calculateEffectiveHealing(event, this.bonus);
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  onHeal(event: HealEvent) {
    if (!SHADOW_BUFFED_HEALS.includes(event.ability.guid)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id) ||
      // Shadow spells only
      event.ability.type !== MAGIC_SCHOOLS.ids.SHADOW ||
      // no pets here
      event.ability.guid === -MAGIC_SCHOOLS.ids.SHADOW
    ) {
      return;
    }

    // Shadow covenant only buffs expiation if you aren't talented into PTW
    if (event.ability.guid === SPELLS.EXPIATION_DAMAGE.id && this.hasPtw) {
      return;
    }

    this.damage += calculateEffectiveDamage(event, this.bonus);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={
          <>
            This value includes the healing from bonus atonement healing caused by the damage amped
            and bonus healing to spells which do shadow healing. This number represents the{' '}
            {this.selectedCombatant.hasTalent(TALENTS_PRIEST.MINDBENDER_DISCIPLINE_TALENT)
              ? this.selectedCombatant.hasTalent(TALENTS_PRIEST.VOIDWRAITH_TALENT)
                ? 25
                : 10
              : 25}
            % amp from <SpellLink spell={TALENTS_PRIEST.SHADOW_COVENANT_TALENT} />, and the extra
            10% amp from <SpellLink spell={TALENTS_PRIEST.TWILIGHT_CORRUPTION_TALENT} /> if it is
            talented.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.SHADOW_COVENANT_TALENT}>
          <ItemHealingDone amount={this.healing} /> <br />
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
        <ScovSourceDonut abilityMap={this.abilityMap} healingMap={this.healingMap} />
      </Statistic>
    );
  }
}

export default ShadowCovenant;
