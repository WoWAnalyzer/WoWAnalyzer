import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class Evangelism extends Module {
  _previousEvangelismCast = null;
  _evangelismStatistics = {};
  atonementModule = this.owner.modules.atonement;

  on_initialized() {
    if (!this.owner.error) {
      this.active = !!this.owner.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT.id);
    }
  }

  get evangelismStatistics() {
    return Object.keys(this._evangelismStatistics).map(key => this._evangelismStatistics[key]);
  }
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EVANGELISM_TALENT.id) {
      return;
    }
    this._previousEvangelismCast = event;
    const atonedPlayers = this.atonementModule.numAtonementsActive;

    this._evangelismStatistics[event.timestamp] = {
      count: atonedPlayers,
      atonementSeconds: atonedPlayers * 7,
      healing: 0,
    };
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // Only when in the last seven seconds of an atonement
    if ([SPELLS.ATONEMENT_HEAL_NON_CRIT.id, SPELLS.ATONEMENT_HEAL_CRIT.id].indexOf(spellId) > -1) {
      const target = this.atonementModule.currentAtonementTargets.find(id => id.target !== event.targetID);
      // Pets, guardians, etc.
      if (!target) {
        return;
      }
      
      // Add all healing that shouldn't exist to expiration
      if (event.timestamp > target.atonementExpirationTimestamp && this._previousEvangelismCast) {
        this._evangelismStatistics[this._previousEvangelismCast.timestamp].healing += (event.amount + (event.absorbed || 0));
      }
    }
  }
}

export default Evangelism;
