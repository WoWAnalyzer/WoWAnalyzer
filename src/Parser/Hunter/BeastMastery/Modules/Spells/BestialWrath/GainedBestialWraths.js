import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

const COOLDOWN_REDUCTION_MS = 12000;
const BESTIAL_WRATH_BASE_CD = 90000;

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec.
 * Bestial Wrath's remaining cooldown is reduced by 12 sec each time you use Barbed Shot
 *
 * Example log: https://www.warcraftlogs.com/reports/pdm6qYNZ2ktMXDRr#fight=7&type=damage-done&source=8
 */

class GainedBestialWraths extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveBWReduction = 0;
  wastedBWReduction = 0;
  casts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id && spellId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.casts += 1;
      return;
    }
    const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
    if (bestialWrathIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.BESTIAL_WRATH.id, COOLDOWN_REDUCTION_MS);
      this.effectiveBWReduction += reductionMs;
      this.wastedBWReduction += (COOLDOWN_REDUCTION_MS - reductionMs);
    } else {
      this.wastedBWReduction += COOLDOWN_REDUCTION_MS;
    }
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.BESTIAL_WRATH.id, this.owner.fight.start_time);
    }
  }

  get gainedBestialWraths() {
    return this.effectiveBWReduction / BESTIAL_WRATH_BASE_CD;
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(16)}
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={formatNumber(this.gainedBestialWraths)}
        label="extra Bestial Wraths"
        tooltip={`<ul><li>You reduced Bestial Wraths cooldown by ${(this.effectiveBWReduction / 1000).toFixed(1)} seconds in total, which resulted in you gaining ${formatNumber(this.gainedBestialWraths, 2)} extra Bestial Wrath casts. </li> <li>You lost out on ${(this.wastedBWReduction / 1000).toFixed(1)} seconds of CD reduction by casting Barbed Shot while Bestial Wrath wasn't on cooldown or while the cooldown had less than ${COOLDOWN_REDUCTION_MS / 1000} seconds remaining. </li></ul>`}
      />
    );
  }

}

export default GainedBestialWraths;
