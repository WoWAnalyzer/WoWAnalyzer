import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from "common/SPELLS";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

let COOLDOWN_REDUCTION_MS = 12000;
const BESTIAL_WRATH_BASE_CD = 90000;

class GainedBestialWraths extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveBWReduction = 0;
  wastedBWReduction = 0;

  on_initialized() {
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T19_4P_BONUS.id)) {
      COOLDOWN_REDUCTION_MS = 16000;
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST.id && spellId !== SPELLS.DIRE_FRENZY_TALENT.id) {
      return;
    }
    this.casts += 1;
    const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
    if (bestialWrathIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.BESTIAL_WRATH.id, COOLDOWN_REDUCTION_MS);
      this.effectiveBWReduction += reductionMs;
      this.wastedBWReduction += (COOLDOWN_REDUCTION_MS - reductionMs);
    } else {
      this.wastedBWReduction += COOLDOWN_REDUCTION_MS;
    }
  }

  statistic() {
    const gainedBestialWraths = this.effectiveBWReduction / BESTIAL_WRATH_BASE_CD;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={formatNumber(gainedBestialWraths)}
        label={`extra Bestial Wraths`}
        tooltip={`<ul><li>You reduced Bestial Wraths cooldown by ${(this.effectiveBWReduction / 1000).toFixed(1)} seconds in total, which resulted in you gaining ${formatNumber(gainedBestialWraths, 2)} extra Bestial Wrath casts. </li> <li>You lost out on ${this.wastedBWReduction / 1000} seconds of CD reduction by casting Dire Beast/Dire Frenzy while Bestial Wrath wasn't on cooldown or while the cooldown had less than ${COOLDOWN_REDUCTION_MS / 1000} seconds remaining. </li></ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);

}

export default GainedBestialWraths;
