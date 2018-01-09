import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS/OTHERS';
import SPELLS from 'common/SPELLS/OTHERS';
//NLC Tier 2 Traits
import MurderousIntent from 'Parser/Core/Modules/NetherlightCrucibleTraits/MurderousIntent';
import ChaoticDarkness from 'Parser/Core/Modules/NetherlightCrucibleTraits/ChaoticDarkness';
import LightsEmbrace from 'Parser/Core/Modules/NetherlightCrucibleTraits/LightsEmbrace';
import SecureInTheLight from 'Parser/Core/Modules/NetherlightCrucibleTraits/SecureInTheLight';
import InfusionOfLight from 'Parser/Core/Modules/NetherlightCrucibleTraits/InfusionOfLight';
import RefractiveShell from 'Parser/Core/Modules/NetherlightCrucibleTraits/RefractiveShell';
import Shadowbind from 'Parser/Core/Modules/NetherlightCrucibleTraits/Shadowbind';
import Shocklight from 'Parser/Core/Modules/NetherlightCrucibleTraits/Shocklight';
import TormentTheWeak from 'Parser/Core/Modules/NetherlightCrucibleTraits/TormentTheWeak';
import DarkSorrows from 'Parser/Core/Modules/NetherlightCrucibleTraits/DarkSorrows';
import LightSpeed from 'Parser/Core/Modules/NetherlightCrucibleTraits/LightSpeed';
import MasterOfShadows from 'Parser/Core/Modules/NetherlightCrucibleTraits/MasterOfShadows';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

/*
 * Insignia of the Grand Army
 * Equip: Increase the effects of Light and Shadow powers granted by the Netherlight Crucible by 50%.
*/

const VERSATILITY_AMOUNT = 1500;
const CRIT_AMOUNT = 1500;
const MASTERY_AMOUNT = 500;
const AVOIDANCE_AMOUNT = 1000;
const HASTE_AMOUNT = 500;
const MOVEMENT_SPEED_AMOUNT = 500;

class InsigniaOfTheGrandArmy extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    murderousIntent: MurderousIntent,
    refractiveShell: RefractiveShell,
    shocklight: Shocklight,
    secureInTheLight: SecureInTheLight,
    infusionOfLight: InfusionOfLight,
    lightsEmbrace: LightsEmbrace,
    shadowbind: Shadowbind,
    chaoticDarkness: ChaoticDarkness,
    tormentTheWeak: TormentTheWeak,
    darkSorrows: DarkSorrows,
    baseLightSpeed: LightSpeed,
    baseMasterOfShadows: MasterOfShadows,
  };

  // NO MEMES<
  damage = 0;
  healing = 0;
  refractiveHealing = 0;
  secureInTheLightDamage = 0;
  secureInTheLightHealing = 0;
  infusionOfLightDamage = 0;
  infusionOfLightHealing = 0;
  lightsEmbraceHealing = 0;
  shadowBindDamage = 0;
  shadowBindHealing = 0;
  chaoticDarknessDamage = 0;
  chaoticDarknessHealing = 0;
  tormentTheWeakDamage = 0;
  darkSorrowsDamage = 0;

  on_initialized() {
    this.active = Object.keys(this.constructor.dependencies)
      .map(key => this[key]).some(dependency => dependency.active) && this.combatants.selected.hasFinger(ITEMS.INSIGNIA_OF_THE_GRAND_ARMY.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.SECURE_IN_THE_LIGHT_DAMAGE.id && spellID !== SPELLS.INFUSION_OF_LIGHT_DAMAGE.id && spellID !== SPELLS.SHADOWBIND_DAMAGE_HEALING.id && spellID !== SPELLS.CHAOTIC_DARKNESS_DAMAGE.id && spellID !== SPELLS.TORMENT_THE_WEAK_DAMAGE.id && spellID !== SPELLS.DARK_SORROWS_DAMAGE.id) {
      return;
    }
    if (spellID === SPELLS.SECURE_IN_THE_LIGHT_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.secureInTheLightDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.INFUSION_OF_LIGHT_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.infusionOfLightDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.shadowBindDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.CHAOTIC_DARKNESS_DAMAGE.id) {
      this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
      this.chaoticDarknessDamage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
    }
    if (spellID === SPELLS.TORMENT_THE_WEAK_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.tormentTheWeakDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.DARK_SORROWS_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.darkSorrowsDamage += event.amount + (event.absorbed || 0);
    }

  }
  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRACTIVE_SHELL_BUFF.id && spellId !== SPELLS.HOLY_BULWARK.id) {
      return;
    }
    if (spellId === SPELLS.REFRACTIVE_SHELL_BUFF.id) {
      this.healing += event.amount;
      this.refractiveHealing += event.amount;
    }
    if (spellId === SPELLS.HOLY_BULWARK.id) {
      this.healing += event.amount;
      this.secureInTheLightHealing += event.amount;
    }
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.INFUSION_OF_LIGHT_HEALING.id && spellId !== SPELLS.LIGHTS_EMBRACE_HEALING.id && spellId !== SPELLS.CHAOTIC_DARKNESS_HEALING.id && spellId !== SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      return;
    }
    if (spellId === SPELLS.INFUSION_OF_LIGHT_HEALING.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.infusionOfLightHealing += (event.amount || 0) + (event.absorbed || 0);
    }
    if (spellId === SPELLS.LIGHTS_EMBRACE_HEALING.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lightsEmbraceHealing += (event.amount || 0) + (event.absorbed || 0);
    }
    if (spellId === SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.shadowBindHealing += (event.amount || 0) + (event.absorbed || 0);
    }
    if (spellId === SPELLS.CHAOTIC_DARKNESS_HEALING.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.chaoticDarknessHealing += (event.amount || 0) + (event.absorbed || 0);
    }

  }

  get averageCritFromRing() {
    return (((this.combatants.selected.getBuffUptime(SPELLS.SHOCKLIGHT_BUFF.id) / this.owner.fightDuration) * CRIT_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.SHOCKLIGHT_TRAIT.id]) / 2).toFixed(2);
  }

  get averageVersFromRing() {
    return (((this.combatants.selected.getBuffUptime(SPELLS.MURDEROUS_INTENT_BUFF.id) / this.owner.fightDuration) * VERSATILITY_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.MURDEROUS_INTENT_TRAIT.id]) / 2).toFixed(2);
  }

  get lightSpeedHasteIncrease() {
    return (HASTE_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_SPEED_TRAIT.id]) / 2;
  }

  get lightSpeedMovementIncrease() {
    return (MOVEMENT_SPEED_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_SPEED_TRAIT.id]) / 2;
  }

  get masterOfShadowsMasteryIncrease() {
    return (MASTERY_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS_TRAIT.id]) / 2;
  }

  get masterOfShadowsAvoidanceIncrease() {
    return (AVOIDANCE_AMOUNT * this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS_TRAIT.id]) / 2;
  }

  item() {
    //Basics
    let tooltip = this.damage + this.healing > 0 ? `This list will show how much of your total NLC trait contribution, the insignia was responsible for: <ul>` : ``;
    tooltip += this.damage > 0 ? `<li>Damage: ${this.owner.formatItemDamageDone(this.damage / 3)}</li>` : ``;
    tooltip += this.healing > 0 ? `<li>Healing: ${this.owner.formatItemHealingDone(this.healing / 3)}</li>` : ``;
    tooltip += this.damage + this.healing > 0 ? `</ul>` : ``;
    //More in depth
    tooltip += `The following will be a breakdown of your individual NLC traits and how they were impacted by the legendary ring: <ul>`;
    //Murderous Intent
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.MURDEROUS_INTENT_TRAIT.id] > 0 ? `<li>Murderous Intent: <ul><li>${this.averageVersFromRing} average versatility </li></ul></li>` : ``;
    //Shocklight
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.SHOCKLIGHT_TRAIT.id] > 0 ? `<li>Shocklight: <ul><li>${this.averageCritFromRing} average crit </li></ul></li>` : ``;
    //MasterOfShadows
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS_TRAIT.id] > 0 ? `<li>Master Of Shadows: <ul><li>${this.masterOfShadowsMasteryIncrease} increased mastery </li><li>${this.masterOfShadowsAvoidanceIncrease} increased avoidance</li></ul></li>` : ``;
    //LightSpeed
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.LIGHT_SPEED_TRAIT.id] > 0 ? `<li>Light Speed: <ul><li>${this.lightSpeedHasteIncrease} increased haste </li><li>${this.lightSpeedMovementIncrease} increased movement speed</li></ul></li>` : ``;
    //Refractive Shell
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.REFRACTIVE_SHELL_TRAIT.id] > 0 ? `<li>Refractive Shell:<ul><li>${this.owner.formatItemHealingDone(this.refractiveHealing / 3)}</li></ul></li>` : ``;
    //Secure In The Light
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.SECURE_IN_THE_LIGHT_TRAIT.id] > 0 ? `<li>The ring contributed with the following damage and healing over the course of the encounter from Secure In The Light: <li>${this.owner.formatItemDamageDone(this.secureInTheLightDamage / 3)}</li><li>${this.owner.formatItemHealingDone(this.secureInTheLightHealing / 3)}</li></li>` : ``;
    //Infusion Of Light
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_LIGHT_TRAIT.id] > 0 ? `<li>Infusion Of Light: <ul><li>${this.owner.formatItemDamageDone(this.infusionOfLightDamage / 3)}</li><li>${this.owner.formatItemHealingDone(this.infusionOfLightHealing / 3)}</li></ul></li>` : ``;
    //Lights Embrace
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.LIGHTS_EMBRACE_TRAIT.id] > 0 ? `<li>Light's Embrace:<ul><li>${this.owner.formatItemHealingDone(this.lightsEmbraceHealing / 3)}</li></ul></li>` : ``;
    //Shadowbind
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.SHADOWBIND_TRAIT.id] > 0 ? `<li>Shadowbind: <ul><li>${this.owner.formatItemDamageDone(this.shadowBindDamage / 3)}</li><li>${this.owner.formatItemHealingDone(this.shadowBindHealing / 3)}</li></ul></li>` : ``;
    //Chaotic Darkness
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.CHAOTIC_DARKNESS_TRAIT.id] > 0 ? `<li>Chaotic Darkness: <ul><li>${this.owner.formatItemDamageDone(this.chaoticDarknessDamage / 3)}</li><li>${this.owner.formatItemHealingDone(this.chaoticDarknessHealing / 3)}</li></ul></li>` : ``;
    //Torment The Weak
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.TORMENT_THE_WEAK_TRAIT.id] > 0 ? `<li>Torment The Weak: <ul><li>${this.owner.formatItemDamageDone(this.tormentTheWeakDamage / 3)}</li</ul></li>` : ``;
    //Dark Sorrows
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.DARK_SORROWS_TRAIT.id] > 0 ? `<li>Dark Sorrows: <ul><li>${this.owner.formatItemDamageDone(this.darkSorrowsDamage / 3)}</li</ul></li>` : ``;

    if (this.damage > 0 || this.healing > 0) {
      return {
        item: ITEMS.INSIGNIA_OF_THE_GRAND_ARMY,
        result: (
          <dfn data-tip={tooltip}>
            <ItemDamageDone amount={this.damage / 3} /><br />
            <ItemHealingDone amount={this.healing / 3} />
          </dfn>
        ),
      };
    } else {
      return {
        item: ITEMS.INSIGNIA_OF_THE_GRAND_ARMY,
        result: (
          <dfn data-tip={tooltip}>
            This buffed your Tier 2 NLC Traits by 50%, see more in the tooltip.
          </dfn>
        ),
      };
    }
  }
}

export default InsigniaOfTheGrandArmy;
