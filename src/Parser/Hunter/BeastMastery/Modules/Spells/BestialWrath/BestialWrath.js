import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import getDamageBonus from "Parser/Hunter/Shared/Core/getDamageBonus";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import ITEMS from "common/ITEMS/HUNTER";

const T204P_MODIFIER = 0.15;
const T20_2P_MODIFIER_PR_STACK = 0.015;
const BESTIAL_FURY_MODIFIER = 0.15;
const BESTIAL_WRATH_BASE_MODIFIER = 0.25;
let BESTIAL_WRATH_TOTAL_MODIFIER = 0;

const AFFECTED_ABILITIES = [
  SPELLS.KILL_COMMAND.id,
  SPELLS.COBRA_SHOT.id,
  SPELLS.MULTISHOT.id,
];

const debug = false;

class BestialWrath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  get bestialWrathInitialModifier() {
    if (this.combatants.selected.hasTalent(SPELLS.BESTIAL_FURY_TALENT) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id)) {
      BESTIAL_WRATH_TOTAL_MODIFIER = BESTIAL_FURY_MODIFIER + BESTIAL_WRATH_BASE_MODIFIER;
    } else {
      BESTIAL_WRATH_TOTAL_MODIFIER = BESTIAL_WRATH_BASE_MODIFIER;
    }
    return BESTIAL_WRATH_TOTAL_MODIFIER;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    //resets the strength of bestial wrath every time it's cast and adjust for Bestial Fury talent.
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.bestialWrathInitialModifier();
    }
    if (AFFECTED_ABILITIES.every(id => spellId !== id)) {
      return;
    }

    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T20_2P_BONUS.id) && this.combatants.selecteded.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      BESTIAL_WRATH_TOTAL_MODIFIER += T20_2P_MODIFIER_PR_STACK;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    if (AFFECTED_ABILITIES.every(id => spellId !== id)) {
      this.bonusDmg += getDamageBonus(event, BESTIAL_WRATH_TOTAL_MODIFIER);
    } else {
      debug && console.log(`player cast spell: `, spellId);
      if (this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T20_4P_BONUS.id)) {
        this.bonusDmg += getDamageBonus(event, BESTIAL_WRATH_TOTAL_MODIFIER + T204P_MODIFIER);
      } else {
        this.bonusDmg += getDamageBonus(event, BESTIAL_WRATH_TOTAL_MODIFIER);
      }
    }
  }
  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    debug && console.log(`pet cast spell: `, spellId);
    if (AFFECTED_ABILITIES.every(id => spellId !== id)) {
      this.bonusDmg += getDamageBonus(event, BESTIAL_WRATH_TOTAL_MODIFIER);
    } else {
      if (this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T20_4P_BONUS.id)) {
        this.bonusDmg += getDamageBonus(event, BESTIAL_WRATH_TOTAL_MODIFIER + T204P_MODIFIER);
      }
    }
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={`${formatNumber(this.bonusDmg)}`}
        label={this.owner.formatItemDamageDone(this.bonusDmg)}
        tooltip={`Bestial Wrath contributed with this much extra damage over the course of the fight. This accounts for T20 bonuses.`} />
    );
  }
}

export default BestialWrath;
