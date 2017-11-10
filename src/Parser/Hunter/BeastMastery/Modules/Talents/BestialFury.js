import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import ITEMS from "common/ITEMS/HUNTER";

//Calculates the actual % increase in damage from Bestial Fury
const BESTIAL_FURY_MODIFIER = (1.4/1.25)-1;

const debug = false;

class BestialWrath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BESTIAL_FURY_TALENT) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    debug && console.log(`player cast spell: `, spellId);
    this.bonusDmg += getDamageBonus(event, BESTIAL_FURY_MODIFIER);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    debug && console.log(`pet cast spell: `, spellId);
    this.bonusDmg += getDamageBonus(event, BESTIAL_FURY_MODIFIER);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BESTIAL_FURY_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg)}`}
        label={this.owner.formatItemDamageDone(this.bonusDmg)}
        tooltip={`Bestial Fury contributed in total with this much damage by boosting the baseline damage bonus of Bestial Wrath.`} />
    );
  }
}

export default BestialWrath;
