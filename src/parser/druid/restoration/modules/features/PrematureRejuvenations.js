import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

const REJUV_DURATION = 15000;
const MS_BUFFER = 200;
const PANDEMIC_THRESHOLD = 0.7;
const FLOURISH_EXTENSION = 8000;

/*
 * This module tracks early refreshments of rejuvenation.
 * TODO: Extend/refactor this module to include other HoTs/Spells as well such as lifebloom/efflorescence
 * TODO: Add this module to checklist
 */
class PrematureRejuvenations extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    combatants: Combatants,
  };

  totalRejuvsCasts = 0;
  rejuvenations = [];
  earlyRefreshments = 0;
  timeLost = 0;

  constructor(...args) {
    super(...args);
    // TODO - Extend this module to also support when using Germination.
    this.active = !this.selectedCombatant.hasTalent(SPELLS.GERMINATION_TALENT.id);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.FLOURISH_TALENT]), this.onCast);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onRemoveBuff(event) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return; // target wasn't important (a pet probably)
    }

    // Sanity check - Remove rejuvenation from array if it was removed from target player.
    this.rejuvenations = this.rejuvenations.filter(e => e.targetId !== event.targetID);
  }

  onCast(event) {
    if (event.ability.guid === SPELLS.REJUVENATION.id) {
      this.totalRejuvsCasts += 1;

      const oldRejuv = this.rejuvenations.find(e => e.targetId === event.targetID);
      if (oldRejuv == null) {
        this.rejuvenations.push({ "targetId": event.targetID, "timestamp": event.timestamp });
        return;
      }

      const pandemicTimestamp = oldRejuv.timestamp + ((REJUV_DURATION * PANDEMIC_THRESHOLD) + MS_BUFFER);
      if (pandemicTimestamp > event.timestamp) {
        this.earlyRefreshments += 1;
        this.timeLost += pandemicTimestamp - event.timestamp;
      }

      // Account for pandemic time if hot was applied within the pandemic timeframe.
      let pandemicTime = 0;
      if (event.timestamp >= pandemicTimestamp && event.timestamp <= oldRejuv.timestamp + REJUV_DURATION) {
        pandemicTime = (oldRejuv.timestamp + REJUV_DURATION) - event.timestamp;
      } else if(event.timestamp <= pandemicTime) {
        pandemicTime = REJUV_DURATION - (REJUV_DURATION * PANDEMIC_THRESHOLD);
      }
      debug && console.log("Extended within pandemic time frame: " + pandemicTime);

      // Set the new timestamp
      oldRejuv.timestamp = event.timestamp + pandemicTime;
    } else if(event.ability.guid === SPELLS.FLOURISH_TALENT.id) {
      // TODO - Flourish extends all active rejuvenations within 60 yards by 8 seconds. Add range check possible?
      this.rejuvenations = this.rejuvenations.map(o => ({ ...o, timestamp: o.timestamp + FLOURISH_EXTENSION}));
    }
  }

  onFightend() {
    debug && console.log("Finished: %o", this.rejuvenations);
    debug && console.log("Early refreshments: "+ this.earlyRefreshments);
    debug && console.log("Time lost: " + this.timeLost);
  }

  get timeLostInSeconds() {
    return (this.timeLost/1000).toFixed(2);
  }

  get timeLostThreshold() {
    return {
      actual: this.timeLostInSeconds,
      isGreaterThan: {
        minor: 0,
        average: 20,
        major: 45,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.timeLostThreshold)
      .addSuggestion((suggest) => suggest(<>Don't refresh <SpellLink id={SPELLS.REJUVENATION.id} /> if it's not within pandemic time frame (4.5s left on buff).</>)
          .icon(SPELLS.REJUVENATION.icon)
          .actual(i18n._(t('druid.restoration.suggestions.rejuvenation.wastedSeconds')`You refreshed early ${this.earlyRefreshments} times which made you waste ${this.timeLostInSeconds} seconds of rejuvenation.`))
          .recommended(`0 seconds lost is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.REJUVENATION.id} />}
        value={this.earlyRefreshments}
        label="Early rejuvenation refreshments"
        tooltip={`The total time lost from your early refreshments was ${this.timeLostInSeconds} seconds.`}
      />
    );
  }
}

export default PrematureRejuvenations;

