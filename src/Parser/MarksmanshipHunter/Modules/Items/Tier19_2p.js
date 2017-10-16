import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from "common/format";

const debug = true;

//1000ms/45focus = 22.2ms/focus
const CDR_PER_FOCUS = 22.22222;

const AFFECTED_ABILITIES = [
  SPELLS.AIMED_SHOT.id,
  SPELLS.PIERCING_SHOT_TALENT.id,
  SPELLS.BURSTING_SHOT.id,
  SPELLS.MARKED_SHOT.id,
  SPELLS.WINDBURST.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.EXPLOSIVE_SHOT_TALENT.id,
  SPELLS.BLACK_ARROW_TALENT.id,
  SPELLS.VOLLEY_ACTIVATED.id,
];

class Tier19_2p extends Module {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;
  lastFocusCost = 0;
  focusUpdates = [];

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T19_2P_BONUS.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (AFFECTED_ABILITIES.every(id => spellId !== id)) {
      return;
    }
    //the added || 0 ensures we don't get any undefined
    this.lastFocusCost = event.classResources[0]['cost'] || 0;
    debug && console.log(`lastFocusCost is at`, this.lastFocusCost);
    const COOLDOWN_REDUCTION_MS = CDR_PER_FOCUS * this.lastFocusCost;
    const trueshotIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.TRUESHOT.id);
    if (trueshotIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.TRUESHOT.id, COOLDOWN_REDUCTION_MS);
      this.effectiveTrueshotReductionMs += reductionMs;
    } else {
      this.wastedTrueshotReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T19_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.TRUESHOT.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T19_2P_BONUS.id} />,
      result: (
        <dfn data-tip={`You wasted ${formatNumber(this.wastedTrueshotReductionMs / 1000)} seconds of CDR.<br/> `}>
           <SpellLink id={SPELLS.TRUESHOT.id} /> CD reduced by {formatNumber(this.effectiveTrueshotReductionMs / 1000)}s in total.
        </dfn>
      ),
    };
  }
}

export default Tier19_2p;
