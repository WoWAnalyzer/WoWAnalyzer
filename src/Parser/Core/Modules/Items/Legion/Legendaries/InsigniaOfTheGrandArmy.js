import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS/OTHERS';
import SPELLS from 'common/SPELLS/OTHERS';
//NLC Tier 2 Traits
import Shadowbind from 'Parser/Core/Modules/NetherlightCrucibleTraits/Shadowbind';
import DarkSorrows from 'Parser/Core/Modules/NetherlightCrucibleTraits/DarkSorrows';
import MasterOfShadows from 'Parser/Core/Modules/NetherlightCrucibleTraits/MasterOfShadows';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

/*
 * Insignia of the Grand Army
 * Equip: Increase the effects of Light and Shadow powers granted by the Netherlight Crucible by 50%.
*/

const MASTERY_AMOUNT = 500;
const AVOIDANCE_AMOUNT = 1000;

class InsigniaOfTheGrandArmy extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    shadowbind: Shadowbind,
    darkSorrows: DarkSorrows,
    baseMasterOfShadows: MasterOfShadows,
  };

  // NO MEMES<
  damage = 0;
  healing = 0;
  shadowBindDamage = 0;
  shadowBindHealing = 0;
  darkSorrowsDamage = 0;

  on_initialized() {
    this.active = Object.keys(this.constructor.dependencies)
      .map(key => this[key]).some(dependency => dependency.active) && this.combatants.selected.hasFinger(ITEMS.INSIGNIA_OF_THE_GRAND_ARMY.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.shadowBindDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.DARK_SORROWS_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.darkSorrowsDamage += event.amount + (event.absorbed || 0);
    }

  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      return;
    }
    if (spellId === SPELLS.SHADOWBIND_DAMAGE_HEALING.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.shadowBindHealing += (event.amount || 0) + (event.absorbed || 0);
    }
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
    //MasterOfShadows
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS_TRAIT.id] > 0 ? `<li>Master Of Shadows: <ul><li>${this.masterOfShadowsMasteryIncrease} increased mastery </li><li>${this.masterOfShadowsAvoidanceIncrease} increased avoidance</li></ul></li>` : ``;
    //Shadowbind
    tooltip += this.combatants.selected.traitsBySpellId[SPELLS.SHADOWBIND_TRAIT.id] > 0 ? `<li>Shadowbind: <ul><li>${this.owner.formatItemDamageDone(this.shadowBindDamage / 3)}</li><li>${this.owner.formatItemHealingDone(this.shadowBindHealing / 3)}</li></ul></li>` : ``;
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
