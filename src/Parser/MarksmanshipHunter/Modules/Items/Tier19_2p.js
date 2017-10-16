import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from "../../../../common/format";

const debug = false;

const CDR_PER_FOCUS = 22.22222;

class Tier19_2p extends Module {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;

  focusUpdates = [];

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T19_2P_BONUS.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id && spellId !== SPELLS.BURSTING_SHOT.id && spellId !== SPELLS.MARKED_SHOT.id && spellId !== SPELLS.WINDBURST.id) {
      return;
    }
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.FOCUS)
        .forEach(({ cost }) => {
          const focusCost = cost || 0;
          this.focusUpdates.unshift({
            used: focusCost,
          });
        });
    }
    debug && console.log(`focusUpdates is now at: `, this.focusUpdates[0].used);
    //1000ms/45focus = 22.2ms/focus
    const COOLDOWN_REDUCTION_MS = CDR_PER_FOCUS * this.focusUpdates[0].used;
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
          You reduced <SpellLink id={SPELLS.TRUESHOT.id} /> by {formatNumber(this.effectiveTrueshotReductionMs / 1000)} seconds in total over the course of the fight.
        </dfn>
      ),
    };
  }
}

export default Tier19_2p;
