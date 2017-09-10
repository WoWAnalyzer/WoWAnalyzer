import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

import isAtonement from '../Core/isAtonement';
import Atonement from '../Spells/Atonement';

const EVANGELISM_DURATION = 6;

class Evangelism extends Module {
  static dependencies = {
    atonementModule: Atonement,
  };

  _previousEvangelismCast = null;
  _evangelismStatistics = {};

  on_initialized() {
    this.active = !!this.owner.modules.combatants.selected.hasTalent(SPELLS.EVANGELISM_TALENT.id);
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
      atonementSeconds: atonedPlayers * EVANGELISM_DURATION,
      healing: 0,
    };
  }

  on_byPlayer_heal(event) {
    if (isAtonement(event)) {
      const target = this.atonementModule.currentAtonementTargets.find(id => id.target === event.targetID);
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
