import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import { ApplyBuffEvent, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';

import isAtonement from '../core/isAtonement';
import AtonementApplicationSource from '../features/AtonementApplicationSource';

const debug = false;

/** The amount of time (in ms) left on a refresh Atonement for it to be considered inefficient. */
const IMPROPER_REFRESH_TIME = 3000;

interface AtonementTarget {
  target: number;
  lastAtonementAppliedTimestamp: number;
  atonementExpirationTimestamp: number;
}

class Atonement extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    combatants: Combatants,
    atonementApplicationSource: AtonementApplicationSource,
  };

  protected eventEmitter!: EventEmitter;
  protected combatants!: Combatants;
  protected atonementApplicationSource!: AtonementApplicationSource;

  healing = 0;
  totalAtones = 0;
  totalAtonementRefreshes = 0;
  currentAtonementTargets: AtonementTarget[] = [];
  improperAtonementRefreshes: AtonementTarget[] = [];

  get atonementDuration() {
    const applicatorEvent = this.atonementApplicationSource.event;
    if (!applicatorEvent) {
      return 15;
    }
    const applicatorSpellId = applicatorEvent.ability.guid;
    let duration = this.atonementApplicationSource.duration.get(applicatorSpellId);

    if (applicatorSpellId === SPELLS.POWER_WORD_SHIELD.id && this.selectedCombatant.hasBuff(SPELLS.RAPTURE.id, applicatorEvent.timestamp)) {
      duration += 6;
    }

    return duration;
  }

  get numAtonementsActive() {
    return this.currentAtonementTargets.length;
  }

  get giftActive() {
    return this.numAtonementsActive >= 3;
  }

  constructor(options: Options) {
    super(options);
    this.active = true;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }

    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
      atonementExpirationTimestamp: event.timestamp + this.atonementDuration,
    };

    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);
    this.totalAtones += 1;
    // @ts-ignore
    debug && console.log(`%c${this.combatants.players[atonement.target].name} gained an atonement`, 'color:green', this.currentAtonementTargets);
    this.eventEmitter.fabricateEvent({
      type: 'atonement_applied',
      // @ts-ignore
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      targetID: event.targetID,
    }, event);
  }

  on_byPlayer_refreshbuff(event: RefreshBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }

    // Check if Atonement was refreshed too early
    let refreshedTarget: AtonementTarget | undefined = this.currentAtonementTargets.find(id => id.target === event.targetID);
    if (!refreshedTarget) {
      refreshedTarget = {
        target: event.targetID,
        lastAtonementAppliedTimestamp: this.owner.fight.start_time,
        atonementExpirationTimestamp: 0,
      };
      debug && console.warn('Atonement: was applied prior to combat');
    }
    const timeSinceApplication = event.timestamp - refreshedTarget.lastAtonementAppliedTimestamp;
    if (timeSinceApplication < ((this.atonementDuration) - IMPROPER_REFRESH_TIME)) {
      this.improperAtonementRefreshes.push(refreshedTarget);
      // @ts-ignore
      debug && console.log(`%c${this.combatants.players[event.targetID].name} refreshed an atonement too early %c${timeSinceApplication}`, 'color:red', this.currentAtonementTargets);
      this.eventEmitter.fabricateEvent({
        type: 'atonement_refresh_improper',
        // @ts-ignore
        timestamp: event.timestamp,
        sourceID: event.sourceID,
        targetID: event.targetID,
      }, event);
    }

    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
      // Refreshing an Atonement will never reduce its duration
      atonementExpirationTimestamp: Math.max(refreshedTarget.atonementExpirationTimestamp, event.timestamp + this.atonementDuration),
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(item => item.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);

    this.totalAtones += 1;
    this.totalAtonementRefreshes += 1;
    // @ts-ignore
    debug && console.log(`%c${this.combatants.players[atonement.target].name} refreshed an atonement`, 'color:orange', this.currentAtonementTargets);
    this.eventEmitter.fabricateEvent({
      type: 'atonement_refresh',
      // @ts-ignore
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      targetID: event.targetID,
    }, event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    const atonement = {
      target: event.targetID,
      lastAtonementAppliedTimestamp: event.timestamp,
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    // @ts-ignore
    debug && console.log(`%c${this.combatants.players[atonement.target].name} lost an atonement`, 'color:red', this.currentAtonementTargets);
    this.eventEmitter.fabricateEvent({
      type: 'atonement_faded',
      // @ts-ignore
      sourceID: event.sourceID,
      targetID: event.targetID,
    }, event);
  }

  on_byPlayer_heal(event: HealEvent) {
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

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ATONEMENT_HEAL_NON_CRIT.id} />}
        value={improperLength}
        label={(
          <>
            Early Atonement refreshes
          </>
        )}
        tooltip={`The amount of Atonement instances that were refreshed earlier than within 3 seconds of the buff expiring. You applied Atonement ${totalAtones} times in total, ${totalAtonementRefreshes} (${formatPercentage((totalAtonementRefreshes / totalAtones), 2)}%) of them were refreshes of existing Atonement instances, and ${improperLength} (${formatPercentage((improperLength / totalAtones), 2)}%) of them were considered early.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Atonement;
