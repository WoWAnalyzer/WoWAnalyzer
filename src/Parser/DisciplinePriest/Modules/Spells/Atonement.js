import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;

/** The amount of time (in ms) left on a refresh Atonement for it to be considered inefficient. */
const IMPROPER_REFRESH_TIME = 3000;

class Atonement extends Module {
  healing = 0;
  totalAtones = 0;
  totalAtonementRefreshes = 0;
  currentAtonementTargets = [];
  improperAtonementRefreshes = [];

  get atonementDuration() {
    return 15;
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
      lastAtonmentAppliedTimestamp: event.timestamp,
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);
    this.totalAtones++;
    debug && console.log(`%c${this.owner.combatants.players[atonement.target].name} gained an atonement`, 'color:green', this.currentAtonementTargets);
    this.owner.triggerEvent('atonement_applied', event);
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }

    const atonement = {
      target: event.targetID,
      lastAtonmentAppliedTimestamp: event.timestamp,
    };
    let refreshedTarget = this.currentAtonementTargets.find(id => id.target === atonement.target);
    if (!refreshedTarget) {
      refreshedTarget = {
        target: event.targetID,
        lastAtonmentAppliedTimestamp: this.owner.fight.start_time,
      };
      debug && console.warn('Atonement: was applied prior to combat');
    }
    const timeSinceApplication = event.timestamp - refreshedTarget.lastAtonmentAppliedTimestamp;
    if (timeSinceApplication < ((this.atonementDuration * 1000) - IMPROPER_REFRESH_TIME)) {
      this.improperAtonementRefreshes.push(refreshedTarget);
      debug && console.log(`%c${this.owner.combatants.players[atonement.target].name} refreshed an atonement too early %c${timeSinceApplication}`, 'color:red', this.currentAtonementTargets);
      this.owner.triggerEvent('atonement_refresh_improper', event);
    }
    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    this.currentAtonementTargets.push(atonement);
    this.totalAtones++;
    this.totalAtonementRefreshes++;
    debug && console.log(`%c${this.owner.combatants.players[atonement.target].name} refreshed an atonement`, 'color:green', this.currentAtonementTargets);
    this.owner.triggerEvent('atonement_refresh', event);
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    const atonement = {
      target: event.targetID,
      lastAtonmentAppliedTimestamp: event.timestamp,
    };
    this.currentAtonementTargets = this.currentAtonementTargets.filter(id => id.target !== atonement.target);
    debug && console.log(`%c${this.owner.combatants.players[atonement.target].name} lost an atonement`, 'color:yellow', this.currentAtonementTargets);
    this.owner.triggerEvent('atonement_faded', event);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    // if (!this.owner.toPlayer(event)) {
    //   return;
    // }
    if (this.lastAtonmentAppliedTimestamp === null) {
      // This can be `null` when Atonement wasn't applied in the combatlog. This often happens as Discs like to apply Atonement prior to combat.
      this.lastAtonmentAppliedTimestamp = this.owner.fight.start_time;
      debug && console.warn('Atonement: was applied prior to combat');
    }

    if ((event.timestamp - this.lastAtonmentAppliedTimestamp) < (this.atonementDuration * 1000)) {
      return;
    }

    debug && console.log('Atonement:', event.amount + (event.absorbed || 0), 'healing done to', event.targetID);
    this.healing += event.amount + (event.absorbed || 0);
  }
}

export default Atonement;
