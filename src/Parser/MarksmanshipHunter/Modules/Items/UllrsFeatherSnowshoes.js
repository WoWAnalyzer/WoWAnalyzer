import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import { formatPercentage } from "common/format";
import { formatNumber } from "common/format";


const COOLDOWN_REDUCTION_MS = 800;

class UllrsFeatherSnowshoes extends Module {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.ULLRS_FEATHER_SNOWSHOES.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.MARKED_SHOT.id && spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.MULTISHOT.id) {
      return;
    }
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
      item: ITEMS.ULLRS_FEATHER_SNOWSHOES,
      result: (
        <dfn data-tip={`Your utilization of Ullrs: <br/> You effectively reduced Trueshots cooldown by: ${formatNumber(this.effectiveTrueshotReductionMs / 1000)} seconds.<br/> You wasted   ${formatNumber(this.wastedTrueshotReductionMs / 1000)} seconds of CDR.<br/> `}>
          Ullrs CDR effectiveness: {formatPercentage(this.effectiveTrueshotReductionMs / (this.effectiveTrueshotReductionMs + this.wastedTrueshotReductionMs))}%
        </dfn>
      ),
    };
  }
}

export default UllrsFeatherSnowshoes;
