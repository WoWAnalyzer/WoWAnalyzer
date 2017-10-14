import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class DistanceMoved extends Module {
    lastPositionUpdate = null;
    totalDistanceMoved = 0;

    // Events
    on_cast(event) {
        this.updatePlayerPosition(event);
    }

    on_damage(event) {
        this.updatePlayerPosition(event);
    }

    on_energize(event) {
        this.updatePlayerPosition(event);
    }

    on_heal(event) {
        this.updatePlayerPosition(event);
    }

    on_absorbed(event){
        this.updatePlayerPosition(event);
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
            <StatisticBox
            icon={<SpellIcon id={SPELLS.FRENETIC_SPEED_TALENT.id} />}
            value={`${formatNumber(this.totalDistanceMoved)} yds moved`}
            label="Distance moved during fight"
            tooltip="Consider this when analyzing the fight, as some fights require more movement than others. Unnecessary movement can result in a DPS/HPS loss."
            />
        );
    }

    // Move to the very end of the optional statistics
    statisticOrder = STATISTIC_ORDER.OPTIONAL(99);
}

export default DistanceMoved;
