import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';

const MS = 1000;

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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id);
  }

  extra_BS_uptime(timestamp, lastCast) {
    const delta = timestamp - lastCast;
    if (delta > (ORIGINAL_FRENZY_DURATION)) {
      const ret = Math.min(delta - (ORIGINAL_FRENZY_DURATION), MS);
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
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARBED_SHOT.id || !this.hasFrenzyUp) {
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
        tooltip={`This only accounts for the duration `}
      />
    );
  }
}

export default FeedingFrenzy;
