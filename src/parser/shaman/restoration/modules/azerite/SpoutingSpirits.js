import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const BUFFER_START = 500;
const BUFFER_END = 1500;

class SpoutingSpirits extends BaseHealerAzerite {
  static TRAIT = SPELLS.SPOUTING_SPIRITS.id;
  static HEAL = SPELLS.SPOUTING_SPIRITS_HEAL.id;

  spiritLinkCastTimestamp = 0;
  potentialSpoutingSpiritsTargets = 0;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.SPIRIT_LINK_TOTEM.id) {
      return;
    }
    this.spiritLinkCastTimestamp = event.timestamp;
  }

  on_byPlayerPet_heal(event) {
    const spellId = event.ability.guid;
    // checking for a 1 second timespan shortly after SLT cast to find out how many people are inside the link when spouting spirits would heal
    if (!this.hasTrait && spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id && this.spiritLinkCastTimestamp <= event.timestamp - BUFFER_START && this.spiritLinkCastTimestamp >= event.timestamp - BUFFER_END) {
      this.potentialSpoutingSpiritsTargets += 1;
    }
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    // checking for a 1 second timespan shortly after SLT cast to find out how many people are inside the link when spouting spirits would heal
    if (!this.hasTrait && spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id && this.spiritLinkCastTimestamp <= event.timestamp - BUFFER_START && this.spiritLinkCastTimestamp >= event.timestamp - BUFFER_END) {
      this.potentialSpoutingSpiritsTargets += 1;
    }
  }

  get spoutingSpiritsHits() {
    return this.potentialSpoutingSpiritsTargets;
  }
}

export default SpoutingSpirits;
