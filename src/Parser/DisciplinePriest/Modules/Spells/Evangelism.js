import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class Evangelism extends Module {
  _previousEvangelismCast = null;
  evangelismStatistics = {};
  atonementModule = this.owner.modules.atonement;
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EVANGELISM_TALENT.id) {
      return;
    }
    this._previousEvangelismCast = event;
    const atonedPlayers = this.atonementModule.numAtonementsActive;

    this.evangelismStatistics[event.timestamp] = {
      count: atonedPlayers,
      atonementSeconds: atonedPlayers * 7,
      healing: 0,
    };
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // Only when in the last seven seconds of an atonement
    if ([SPELLS.ATONEMENT_HEAL_NON_CRIT.id, SPELLS.ATONEMENT_HEAL_CRIT.id].indexOf(spellId) > -1) {
      const target = this.atonementModule.currentAtonementTargets.filter(id => id.target !== event.targetID)[0];
      
      // Pets, guardians, etc.
      if (!target) {
        return;
      }
      
      // Add all healing that shouldn't exist to expiration
      if (event.timestamp > target.atonementExpirationTimestamp) {
        this.evangelismStatistics[this._previousEvangelismCast.timestamp].healing += (event.amount + (event.absorbed || 0));
      }
    }
  }
}

export default Evangelism;
