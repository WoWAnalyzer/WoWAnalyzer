import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import HIT_TYPES from "Parser/Core/HIT_TYPES";
import { formatPercentage, formatNumber} from "common/format";
import getDamageBonus from "../../../Shared/Core/getDamageBonus";

const T20_2P_CRIT_DMG_BONUS = 0.15;

class Tier20_2p extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  totalAimed = 0;
  buffedAimed = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_2P_BONUS.id);
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id)) {
      if (isCrit) {
        this.bonusDmg += getDamageBonus(event, T20_2P_CRIT_DMG_BONUS);
      }
      if (spellId === SPELLS.AIMED_SHOT.id) {
        this.buffedAimed += 1;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.totalAimed += 1;
    }
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Your utilization of tier 20 2 piece: <br/> Buffed aimed shots: ${this.buffedAimed}.<br/> Total aimed shots:  ${this.totalAimed}.<br/> `}>
          Buffed Aimed Shots: {formatPercentage(this.buffedAimed / this.totalAimed)}%<br/>
          {formatNumber(this.bonusDmg)} - {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default Tier20_2p;
