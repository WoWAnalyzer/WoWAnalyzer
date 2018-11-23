import { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const BUFFER_START = 500;
const BUFFER_END = 1500;

class SpoutingSpirits extends BaseHealerAzerite {
  static TRAIT = SPELLS.SPOUTING_SPIRITS;
  static HEAL = SPELLS.SPOUTING_SPIRITS_HEAL;

  spiritLinkCastTimestamp = 0;
  potentialSpoutingSpiritsTargets = 0;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.SPIRIT_LINK_TOTEM), this._onSpiritLinkCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE), this._onSpiritLinkRedistribution);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE), this._onSpiritLinkRedistribution);
  }

  _onSpiritLinkCast(event) {
    this.spiritLinkCastTimestamp = event.timestamp;
  }

  _onSpiritLinkRedistribution(event) {
    // checking for a 1 second timespan shortly after SLT cast to find out how many people are inside the link when spouting spirits would heal
    if (!this.hasTrait && this.spiritLinkCastTimestamp <= event.timestamp - BUFFER_START && this.spiritLinkCastTimestamp >= event.timestamp - BUFFER_END) {
      this.potentialSpoutingSpiritsTargets += 1;
    }
  }

  get spoutingSpiritsHits() {
    return this.potentialSpoutingSpiritsTargets;
  }
}

export default SpoutingSpirits;
