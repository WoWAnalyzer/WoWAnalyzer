import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const DRUID_HOTS = [
  SPELLS.REJUVENATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.CULTIVATION.id,
  SPELLS.CENARION_WARD.id,
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  // Make sure to check that event.tick is true, because regrowth uses the same id for the heal and the HoT part
  SPELLS.REGROWTH.id,
  SPELLS.SPRING_BLOSSOMS.id,
  SPELLS.DREAMER.id,
];

// attributions
const DEFAULT = 0; // indicates the regular application method of the HoT, whatever that might be
const POTA = 1; // Power of the Archdruid (Rejuv or Regrowth)
const TEARSTONE = 2; // Tearstone of Elune (Rejuv)
const T194P = 3; // Tier 19 4pc (Rejuv)
const T214P = 4; // Tier 21 4pc (Dreamer, used to distinguish Dreamer procs that would not have happened but for the 4pc)

const debug = false;

/*
 * Backend module for tracking attribution of HoTs, e.g. what applied them / applied parts of them / boosted them
 */
class Rejuvenation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // {
  //   [playerId]: {
  //      [hotId]: { applied, attributions },
  //   },
  // }
  hots = {};

  on_byPlayer_heal(event) {
    // TODO
  }

  on_byPlayer_cast(event) {
    // TODO
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (!DRUID_HOTS.includes(spellId)) {
      return;
    }

    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} cast on target without ID @${this.owner.formatTimestamp(event.timestamp)}... HoT will not be tracked.`);
      return;
    }

    if(!this.hots[targetId]) {
      this.hots[targetId] = {};
    }

    this.hots[targetId][spellId] = {
      applied: event.timestamp,
      attributions: this._getAttributions(spellId, event.timestamp),
      // TODO need more fields?
    };
  }

  _getAttributions(spellId, timestamp) {
    if (spellId === SPELLS.REJUVENATION.id || SPELLS.REJUVENATION_GERMINATION.id) {


    } else {
      // ...
    }
  }


}

export default Rejuvenation;
