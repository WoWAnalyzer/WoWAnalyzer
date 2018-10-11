import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';

const MS = 1000;
const MS_BUFFER = 100;
const ORIGINAL_FRENZY_DURATION = 8000;

/**
 * Barbed Shot deals X additional damage over its duration,
 * and Frenzy's duration is increased to 9 seconds.
 *
 * Example report: https://www.warcraftlogs.com/reports/m9KrNBVCtDALZpzT#source=5&type=summary&fight=1
 */

class FeedingFrenzy extends Analyzer {

  extraBuffUptime = 0;
  lastBSCast = null;
  hasFrenzyUp = false;
  buffApplication = null;
  timesExtended = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id);
  }

  extra_BS_uptime(timestamp, lastCast) {
    const delta = timestamp - lastCast;
    if (delta > (ORIGINAL_FRENZY_DURATION)) {
      const ret = Math.min(delta - (ORIGINAL_FRENZY_DURATION), MS);
      this.timesExtended += 1;
      return ret;
    } else {
      return 0;
    }
  }
  on_toPlayerPet_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.hasFrenzyUp = false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT_PET_BUFF.id) {
      return;
    }
    this.hasFrenzyUp = true;
    this.buffApplication = event.timestamp;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id) {
      return;
    }
    this.casts++;
    if (!this.hasFrenzyUp || event.timestamp < this.buffApplication + MS_BUFFER) {
      return;
    }
    this.extraBuffUptime += this.extra_BS_uptime(event.timestamp, this.lastBSCast);
    this.lastBSCast = event.timestamp;
  }

  on_finished() {
    if (this.lastBSCast !== null) {
      this.extraBuffUptime += this.extra_BS_uptime(this.owner.fight.end_time, this.lastBSCast);
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FEEDING_FRENZY.id}
        value={`${formatNumber(this.extraBuffUptime / MS)}s added Frenzy Uptime`}
        tooltip={`This only accounts for the added uptime granted when casting Barbed Shot after 8 seconds had passed, so each cast can potentially be worth up to 1 second. <br/>
                  This happened a total of ${this.timesExtended} ${this.timesExtended > 1 ? 'times' : 'time'}.
                  <ul>
                  <li>This means that you gained an average extra uptime of ${(this.extraBuffUptime / this.timesExtended / 1000).toFixed(2)}s per cast of Barbed Shot that was cast more than 8 seconds after the last one.</li>
                  <li>Out of all your Barbed Shot casts, you gained an extra ${(this.extraBuffUptime / this.casts / 1000).toFixed(2)}s of uptime per cast.</li>
                  </ul>
`}
      />
    );
  }
}

export default FeedingFrenzy;
