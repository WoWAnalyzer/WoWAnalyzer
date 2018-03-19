import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import isAtonement from '../Core/isAtonement';
import AtonementApplicationSource from '../Features/AtonementApplicationSource';

const debug = false;

/** The amount of time (in ms) left on a refresh Atonement for it to be considered inefficient. */
const IMPROPER_REFRESH_TIME = 3000;

class Atonement extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonementApplicationSource: AtonementApplicationSource,
  };

  healing = 0;
  totalAtones = 0;
  totalAtonementRefreshes = 0;
  currentAtonementTargets = [];
  improperAtonementRefreshes = [];

  get atonementDuration() {
    const applicatorEvent = this.atonementApplicationSource.event;
    if (!applicatorEvent) {
      return 15;
    }
    const applicatorSpellId = applicatorEvent.ability.guid;
    let duration = this.atonementApplicationSource.duration.get(applicatorSpellId);

    if (applicatorSpellId === SPELLS.POWER_WORD_SHIELD.id && this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T19_4SET_BONUS_BUFF.id, applicatorEvent.timestamp) && this.owner.modules.combatants.selected.hasBuff(SPELLS.RAPTURE.id, applicatorEvent.timestamp)) {
      duration += 6;
    }

    return duration;
  }

  get numAtonementsActive() {
    return this.currentAtonementTargets.length;
  }

  on_initialized() {
    this.active = true;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }

    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
      atonementExpirationTimestamp: event.timestamp + this.atonementDuration * 1000,
    };

    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);
    this.totalAtones += 1;
    debug && console.log(`%c${this.combatants.players[atonement.target].name} gained an atonement`, 'color:green', this.currentAtonementTargets);
    this.owner.fabricateEvent('atonement_applied', null, event);
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }

    // Check if Atonement was refreshed too early
    let refreshedTarget = this.currentAtonementTargets.find(id => id.target === event.targetID);
    if (!refreshedTarget) {
      refreshedTarget = {
        target: event.targetID,
        lastAtonementAppliedTimestamp: this.owner.fight.start_time,
      };
      debug && console.warn('Atonement: was applied prior to combat');
    }
    const timeSinceApplication = event.timestamp - refreshedTarget.lastAtonementAppliedTimestamp;
    if (timeSinceApplication < ((this.atonementDuration * 1000) - IMPROPER_REFRESH_TIME)) {
      this.improperAtonementRefreshes.push(refreshedTarget);
      debug && console.log(`%c${this.combatants.players[event.targetID].name} refreshed an atonement too early %c${timeSinceApplication}`, 'color:red', this.currentAtonementTargets);
      this.owner.fabricateEvent('atonement_refresh_improper', null, event);
    }

    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
      // Refreshing an Atonement will never reduce its duration
      atonementExpirationTimestamp: Math.max(refreshedTarget.atonementExpirationTimestamp, event.timestamp + this.atonementDuration * 1000),
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(item => item.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);

    this.totalAtones += 1;
    this.totalAtonementRefreshes += 1;
    debug && console.log(`%c${this.combatants.players[atonement.target].name} refreshed an atonement`, 'color:orange', this.currentAtonementTargets);
    this.owner.fabricateEvent('atonement_refresh', null, event);
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    debug && console.log(`%c${this.combatants.players[atonement.target].name} lost an atonement`, 'color:red', this.currentAtonementTargets);
    this.owner.fabricateEvent('atonement_faded', null, event);
  }

  on_byPlayer_heal(event) {
    if (isAtonement(event)) {
      return;
    }

    debug && console.log('Atonement:', event.amount + (event.absorbed || 0), 'healing done to', event.targetID);
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const improperLength = this.improperAtonementRefreshes.length || 0;
    const totalAtonementRefreshes = this.totalAtonementRefreshes || 0;
    const totalAtones = this.totalAtones || 0;

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ATONEMENT_HEAL_NON_CRIT.id} />}
        value={improperLength}
        label={(
          <dfn data-tip={
            `The amount of Atonement instances that were refreshed earlier than within 3 seconds of the buff expiring. You applied Atonement ${totalAtones} times in total, ${totalAtonementRefreshes} (${formatPercentage((totalAtonementRefreshes / totalAtones), 2)}%) of them were refreshes of existing Atonement instances, and ${improperLength} (${formatPercentage((improperLength / totalAtones), 2)}%) of them were considered early.`
            }>
            Early Atonement refreshes
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Atonement;
