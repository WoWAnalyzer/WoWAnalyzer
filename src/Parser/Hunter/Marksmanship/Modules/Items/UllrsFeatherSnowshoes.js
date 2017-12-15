import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import { formatNumber } from "common/format";
import SpellLink from "common/SpellLink";

const COOLDOWN_REDUCTION_MS = 800;

const AFFECTED_ABILITIES = [
  SPELLS.AIMED_SHOT.id,
  SPELLS.MARKED_SHOT.id,
  SPELLS.ARCANE_SHOT.id,
  SPELLS.MULTISHOT.id,
];

/*
 * Equip: The remaining cooldown on Trueshot is reduced by 0.8 sec each time you cast a damaging Shot.
 */
class UllrsFeatherSnowshoes extends Analyzer {
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
    if (AFFECTED_ABILITIES.every(id => spellId !== id)) {
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
        <dfn data-tip={`You wasted ${formatNumber(this.wastedTrueshotReductionMs / 1000)} seconds of CDR.<br/> `}>
          reduced <SpellLink id={SPELLS.TRUESHOT.id} /> CD by {formatNumber(this.effectiveTrueshotReductionMs / 1000)}s in total.
        </dfn>
      ),
    };
  }
}

export default UllrsFeatherSnowshoes;
