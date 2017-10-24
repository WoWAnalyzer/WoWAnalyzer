import React from 'react';

import Icon from 'common/Icon';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

const debug = false;

class DistanceMoved extends Analyzer {
  lastPositionUpdate = null;
  totalDistanceMoved = 0;

  // Events
  on_cast(event) {
    if (this.owner.byPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_damage(event) {
    if (this.owner.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.updatePlayerPosition(event);
    }
  }

  on_energize(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_heal(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_absorbed(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  // Data parsing
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  updateTotalDistance(event) {
    if (!this.lastPositionUpdate) {
      return;
    }
    this.totalDistanceMoved += this.calculateDistance(this.lastPositionUpdate.x, this.lastPositionUpdate.y, event.x, event.y);
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.updateTotalDistance(event);
    this.lastPositionUpdate = event;
  }

  statistic() {
    debug && console.log(`Total distance moved: ${this.totalDistanceMoved} yds`);
    return (
      <SmallStatisticBox
        icon={<Icon icon="spell_fire_burningspeed" />}
        value={`≈${formatThousands(this.totalDistanceMoved)} yards`}
        label="Distance moved"
        tooltip={`≈${formatThousands(this.totalDistanceMoved / (this.owner.fightDuration / 1000) * 60)} yards per minute. Consider this when analyzing the fight, as some fights require more movement than others. Unnecessary movement can result in a DPS/HPS loss.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT();
}

export default DistanceMoved;
