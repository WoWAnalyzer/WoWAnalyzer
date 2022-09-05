import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RACES from 'game/RACES';
import ROLES from 'game/ROLES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import CritEffectBonus, { ValidEvents } from 'parser/shared/modules/helpers/CritEffectBonus';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticBox from 'parser/ui/StatisticBox';

export const CRIT_EFFECT = 0.02;

class MightOfTheMountain extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
    abilities: Abilities,
  };

  protected critEffectBonus!: CritEffectBonus;
  protected abilities!: Abilities;

  damage = 0;
  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Dwarf;
    if (!this.active) {
      return;
    }

    (options.critEffectBonus as CritEffectBonus).hook(this.getCritEffectBonus.bind(this));
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  isApplicableHeal(event: HealEvent) {
    if (!this.abilities.getAffectedByHealingIncreases(event.ability.guid)) {
      return false;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return false;
    }
    return true;
  }

  isApplicableDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return false;
    }
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return false;
    }
    return true;
  }

  getCritEffectBonus(critEffectModifier: number, event: ValidEvents) {
    if (event.type === EventType.Heal && !this.isApplicableHeal(event)) {
      return critEffectModifier;
    }

    return critEffectModifier + CRIT_EFFECT;
  }

  onHeal(event: HealEvent) {
    if (!this.isApplicableHeal(event)) {
      return;
    }

    const contribution = this.critEffectBonus.getHealingContribution(event, CRIT_EFFECT);
    this.healing += contribution.effectiveHealing;
    this.overhealing += contribution.overhealing;
  }
  onDamage(event: DamageEvent) {
    if (!this.isApplicableDamage(event)) {
      return;
    }

    this.damage += this.critEffectBonus.getDamageContribution(event, CRIT_EFFECT);
  }

  statistic() {
    let value;
    let overhealing;
    switch (this.selectedCombatant.spec?.role) {
      case ROLES.HEALER:
        value = <ItemHealingDone amount={this.healing} />;
        overhealing = (
          <li>Overhealing: {formatNumber(this.owner.getPerSecond(this.overhealing))} HPS</li>
        );
        break;
      case ROLES.DPS.MELEE:
      case ROLES.DPS.RANGED:
        value = <ItemDamageDone amount={this.damage} />;
        break;
      default:
        value = (
          <>
            <ItemHealingDone amount={this.healing} />
            <br />
            <ItemDamageDone amount={this.damage} />
          </>
        );
        overhealing = (
          <li>Overhealing: {formatNumber(this.owner.getPerSecond(this.overhealing))} HPS</li>
        );
        break;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MIGHT_OF_THE_MOUNTAIN.id} />}
        value={value}
        label="Dwarf crit racial"
        tooltip={
          <>
            <ul>
              <li>Damage: {this.owner.formatItemDamageDone(this.damage)}</li>
              <li>Healing: {this.owner.formatItemHealingDone(this.healing)}</li>
              {overhealing}
            </ul>
          </>
        }
      />
    );
  }
}

export default MightOfTheMountain;
