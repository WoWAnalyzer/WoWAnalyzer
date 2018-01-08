import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatNumber } from 'common/format';
import ITEMS from "common/ITEMS/HUNTER";
import SpellLink from "common/SpellLink";
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

const COOLDOWN_REDUCTION_MS = 3000;

class QaplaEredunWarOrder extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  effectiveKillCommandReductionMs = 0;
  wastedKillCommandReductionMs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.QAPLA_EREDUN_WAR_ORDER.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST.id && spellId !== SPELLS.DIRE_FRENZY_TALENT.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND.id)) {
      const globalCooldown = this.globalCooldown.getCurrentGlobalCooldown(spellId);
      if (this.spellUsable.cooldownRemaining(SPELLS.KILL_COMMAND.id) < (COOLDOWN_REDUCTION_MS + globalCooldown)) {
        const effectiveReductionMs = this.spellUsable.cooldownRemaining(SPELLS.KILL_COMMAND.id) - globalCooldown;
        this.effectiveKillCommandReductionMs += effectiveReductionMs;
        this.wastedKillCommandReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
      } else {
        const reductionMs = this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND.id, COOLDOWN_REDUCTION_MS);
        this.effectiveKillCommandReductionMs += reductionMs;
      }
    } else {
      this.wastedKillCommandReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }
  item() {
    return {
      item: ITEMS.QAPLA_EREDUN_WAR_ORDER,
      result: (
        <dfn data-tip={`You wasted ${formatNumber(this.wastedKillCommandReductionMs / 1000)} seconds of CDR by using Dire Beast when Kill Command wasn't on cooldown or had less than 3 seconds remaning on CD.`}>
          reduced <SpellLink id={SPELLS.KILL_COMMAND.id} /> CD by {formatNumber(this.effectiveKillCommandReductionMs / 1000)}s in total.
        </dfn>
      ),
    };
  }
}

export default QaplaEredunWarOrder;
