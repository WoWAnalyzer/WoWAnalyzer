import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import HasteIcon from 'interface/icons/Haste';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const furiousGazeStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.FURIOUS_GAZE.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

const FURIOUS_GAZE_DURATION = 12000;

/**
 * Furious Gaze
 * When Eye Beam finishes fully channeling, your Haste is increased by 887 for 12 sec.
 *
 * Example Report: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Harwezz/statistics
 */
class FuriousGaze extends Analyzer{

  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };

  haste = 0;
  furiousGazeProcsCounter = 0;
  furiousGazeStartTime = undefined;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FURIOUS_GAZE.id);
    if (!this.active) {
      return;
    }

    const { haste } = furiousGazeStats(this.selectedCombatant.traitsBySpellId[SPELLS.FURIOUS_GAZE.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.FURIOUS_GAZE_BUFF.id, {
      haste,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FURIOUS_GAZE_BUFF), this.onFuriousGazeApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FURIOUS_GAZE_BUFF), this.onFuriousGazeRemove);
  }

  onFuriousGazeApply(event) {
    if (this.furiousGazeStartTime === undefined) {
      this.furiousGazeStartTime = event.timestamp;
    }
  }

  onFuriousGazeRemove(event) {
    if (this.furiousGazeStartTime !== undefined) {
      this.furiousGazeProcsCounter += Math.round((event.timestamp - this.furiousGazeStartTime) / FURIOUS_GAZE_DURATION);
      this.furiousGazeStartTime = undefined;
    }
  }

  get averageHaste() {
    return this.buffUptime * this.haste;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURIOUS_GAZE_BUFF.id) / this.owner.fightDuration;
  }

  get eyeBeamCasts() {
    return this.abilityTracker.getAbility(SPELLS.EYE_BEAM.id).casts || 0;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            <SpellLink id={SPELLS.FURIOUS_GAZE.id} /> buff is only gained when you succesfully<br />
            finish an <SpellLink id={SPELLS.EYE_BEAM.id} /> channel. Cancelling the channel <br />
            prematurely will result in not receiving the buff and will <br />
            translate in a considerable DPS loss.<br /><br />

            {formatPercentage(this.buffUptime)}% uptime<br />
            {this.furiousGazeProcsCounter} out of {this.eyeBeamCasts} possible procs<br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FURIOUS_GAZE}>
          <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste</small><br />
          {this.eyeBeamCasts - this.furiousGazeProcsCounter} <small><SpellLink id={SPELLS.FURIOUS_GAZE.id} /> buffs lost</small><br />
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default FuriousGaze;
