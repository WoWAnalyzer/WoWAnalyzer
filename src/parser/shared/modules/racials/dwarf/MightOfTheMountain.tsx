import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RACES from 'game/RACES';
import ROLES from 'game/ROLES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CombatLogParser from 'parser/core/CombatLogParser';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import CritEffectBonus, { ValidEvents } from 'parser/shared/modules/helpers/CritEffectBonus';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticBox from 'parser/ui/StatisticBox';

export const CRIT_EFFECT = 0.02;

class MightOfTheMountain extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
  };

  protected critEffectBonus!: CritEffectBonus;

  damage = 0;
  healing = 0;

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
    const abilities = CombatLogParser.abilitiesAffectedByHealingIncreases;
    if (abilities.length > 0 && !abilities.includes(event.ability.guid)) {
      // When this isn't configured, assume everything is affected
      return false;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return false;
    }
    return true;
  }
  isApplicableDamage(event: DamageEvent) {
    const abilities = CombatLogParser.abilitiesAffectedByDamageIncreases;
    if (abilities.length > 0 && !abilities.includes(event.ability.guid)) {
      // When this isn't configured, assume everything is affected
      return false;
    }
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

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event);
    const rawContribution = rawNormalPart * CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawContribution - overheal);

    this.healing += effectiveHealing;
  }
  onDamage(event: DamageEvent) {
    if (!this.isApplicableDamage(event)) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const raw = amount + absorbed;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event);
    const rawContribution = rawNormalPart * CRIT_EFFECT;

    this.damage += rawContribution;
  }

  statistic() {
    let value;
    switch (this.selectedCombatant.spec?.role) {
      case ROLES.HEALER:
        value = <ItemHealingDone amount={this.healing} />;
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
        break;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MIGHT_OF_THE_MOUNTAIN.id} />}
        value={value}
        label="Dwarf crit racial"
        tooltip={
          <>
            The racial contributed {this.owner.formatItemDamageDone(this.damage)} and{' '}
            {this.owner.formatItemHealingDone(this.healing)}.
          </>
        }
      />
    );
  }
}

export default MightOfTheMountain;
