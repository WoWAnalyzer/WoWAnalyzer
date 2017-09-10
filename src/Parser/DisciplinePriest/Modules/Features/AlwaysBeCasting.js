import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

const debug = false;

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.PENANCE.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.SMITE.id,
    SPELLS.POWER_WORD_RADIANCE.id,
    SPELLS.PURGE_THE_WICKED_TALENT.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.MINDBENDER_TALENT_SHARED.id,
    SPELLS.LIGHTS_WRATH.id,
    SPELLS.HALO_TALENT.id,
    SPELLS.PLEA.id,
    SPELLS.DIVINE_STAR_TALENT.id,
    SPELLS.ANGELIC_FEATHER_TALENT.id,
    SPELLS.MASS_DISPEL.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.LEVITATE.id,
    SPELLS.POWER_INFUSION_TALENT.id,
    SPELLS.POWER_WORD_BARRIER_CAST.id,
    SPELLS.PURIFY.id,
    SPELLS.SHACKLE_UNDEAD.id,
    SPELLS.SHADOWFIEND.id,
    SPELLS.SCHISM_TALENT.id,
    SPELLS.SHINING_FORCE_TALENT.id,
    SPELLS.POWER_WORD_SOLACE_TALENT.id,
    SPELLS.CLARITY_OF_WILL_TALENT.id,
    SPELLS.SHADOW_COVENANT_TALENT.id,
    SPELLS.EVANGELISM_TALENT.id,
  ];

  lastPenanceStartTimestamp = null;

  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    if (spellId === SPELLS.PENANCE.id || spellId === SPELLS.PENANCE_HEAL.id) {
      if (!this.lastPenanceStartTimestamp || (castStartTimestamp - this.lastPenanceStartTimestamp) > PENANCE_CHANNEL_TIME_BUFFER) {
        debug && console.log('%cABC: New penance channel started', 'color: orange');
        this.lastPenanceStartTimestamp = castStartTimestamp;
      } else {
        // This is a follow up from an existing Penance channel, it doesn't start its own GCD but the last cast is always after the initial GCD. This makes it so the last cast is still considered a valid cast.
        debug && console.log('%cABC: Follow up penance cast, ignoring time wasted', 'color: gray');
        this.lastCastFinishedTimestamp = Math.max(this.lastCastFinishedTimestamp, cast.timestamp);
        return; // by returning here we don't get an invalid time wasted added
      }
    }

    super.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );
  }
}

export default AlwaysBeCasting;
