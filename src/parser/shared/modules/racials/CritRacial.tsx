import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RACES from 'game/RACES';
import ROLES from 'game/ROLES';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import CritEffectBonus, { ValidEvents } from 'parser/shared/modules/helpers/CritEffectBonus';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';

export const CRIT_EFFECT = 0.02;

class CritRacial extends Analyzer {
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
    this.active =
      wclGameVersionToBranch(options.owner.report.gameVersion) === 'retail' &&
      (this.selectedCombatant.race === RACES.Tauren || this.selectedCombatant.race === RACES.Dwarf);
    if (!this.active) {
      return;
    }

    (options.critEffectBonus as CritEffectBonus).hook(this.getCritEffectBonus.bind(this));
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
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

    const contribution = this.critEffectBonus.getHealingContribution(event, CRIT_EFFECT, true);
    this.healing += contribution.effectiveHealing;
    this.overhealing += contribution.overhealing;
  }
  onDamage(event: DamageEvent) {
    if (!this.isApplicableDamage(event)) {
      return;
    }

    this.damage += this.critEffectBonus.getDamageContribution(event, CRIT_EFFECT, true);
  }

  onPetDamage(event: DamageEvent) {
    if (!this.isApplicableDamage(event)) {
      return;
    }

    //These effects (dwarf & tauren crit mod) apply to both the player and the pet via Apply Player/Pet Aura (202) and the pet inherits from the
    // player, effectively getting double the mod.
    this.damage += this.critEffectBonus.getDamageContribution(event, CRIT_EFFECT, true);
    this.damage += this.critEffectBonus.getDamageContribution(event, CRIT_EFFECT, true);
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
      <Statistic
        size="small"
        tooltip={
          <>
            <div>Damage: {this.owner.formatItemDamageDone(this.damage)}</div>
            <div>
              Healing: {this.owner.formatItemHealingDone(this.healing)}
              {overhealing}
            </div>
          </>
        }
      >
        <BoringSpellValueText
          spell={
            this.selectedCombatant.race === RACES.Tauren
              ? SPELLS.BRAWN
              : SPELLS.MIGHT_OF_THE_MOUNTAIN
          }
        >
          {value}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CritRacial;
