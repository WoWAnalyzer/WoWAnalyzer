import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import HIT_TYPES from "Parser/Core/HIT_TYPES";
import { formatPercentage, formatNumber } from "common/format";
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";

const T21_2P_DMG_BONUS = 0.3;

class Tier20_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  focusGeneratorCasts = {
    [SPELLS.ARCANE_SHOT.id]: {
      casts: 0,
      energyGain: 8,
      bonusDmg: 0,
    },
    [SPELLS.MULTISHOT.id]: {
      casts: 0,
      energyGain: 3,
      bonusDmg: 0,
    },
    [SPELLS.SIDEWINDERS_TALENT.id]: {
      casts: 0,
      energyGain: 35,
      bonusDmg: 0,
    },
    [SPELLS.CRITICAL_FOCUS_FOCUSMODULE.id]: {
      casts: 0,
      energyGain: 5,
    },
  };

  buffedAimed = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T21_2P_BONUS.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MULTISHOT.id || spellId !== SPELLS.ARCANE_SHOT.id || spellId !== SPELLS.SIDEWINDERS_TALENT.id || spellId !== SPELLS.CRITICAL_FOCUS_FOCUSMODULE.id) {
      return false;
    }
    this.focusGeneratorCasts[spellId].casts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MULTISHOT.id || spellId !== SPELLS.ARCANE_SHOT.id || spellId !== SPELLS.SIDEWINDERS_TALENT.id || spellId !== SPELLS.CRITICAL_FOCUS_FOCUSMODULE.id) {
      return false;
    }
    this.focusGeneratorCasts[spellId].bonusDmg += getDamageBonus(event, T21_2P_DMG_BONUS)

  }

  item() {
    const totalFocusGain = this.focusGeneratorCasts[];
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      result: (
        <dfn data-tip={`Your utilization of tier 20 2 piece: <ul> <li> Buffed aimed shots: ${this.buffedAimed}.</li> <li> Total aimed shots:  ${this.totalAimed}.</li></ul> `}>
          Buffed Aimed Shots: {formatPercentage(this.buffedAimed / this.totalAimed)}%<br />
          {formatNumber(this.bonusDmg)} - {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default Tier20_2p;
