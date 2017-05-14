import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

const debug = true;

/** This is affected by Haste */
const PENANCE_CHANNEL_TIME = 2000;

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.PENANCE.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.SMITE.id,
    SPELLS.POWER_WORD_RADIANCE.id,
    SPELLS.PURGE_THE_WICKED_TALENT.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.MINDBENDER_TALENT.id,
    SPELLS.LIGHTS_WRATH.id,
    SPELLS.HALO_TALENT.id,
    SPELLS.PLEA.id,
    SPELLS.DIVINE_STAR_TALENT.id,
    SPELLS.ANGELIC_FEATHER_TALENT.id,
    SPELLS.MASS_DISPEL.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.LEVITATE.id,
    SPELLS.POWER_INFUSION_TALENT.id,
    SPELLS.POWER_WORD_BARRIER.id,
    SPELLS.PURIFY.id,
    SPELLS.SHACKLE_UNDEAD.id,
    SPELLS.SHADOW_FIEND.id,
    SPELLS.SCHISM_TALENT.id,
    SPELLS.SHINING_FORCE_TALENT.id,
    SPELLS.POWER_WORD_SOLACE_TALENT.id,
    SPELLS.CLARITY_OF_WILL_TALENT.id,
    SPELLS.SHADOW_COVENANT_TALENT.id,
  ];

  lastPenanceStartTimestamp = null;
  truePenanceCasts = 0;

  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    if (spellId === SPELLS.PENANCE.id) {
      if (!this.lastPenanceStartTimestamp || (castStartTimestamp - this.lastPenanceStartTimestamp) > PENANCE_CHANNEL_TIME) {
        debug && console.log(`%cABC: New penance channel started`, 'color: orange');
        this.truePenanceCasts += 1; // also track the amount of penance casts. Since we're already doing this here, this way we don't need a separate module.
        this.lastPenanceStartTimestamp = castStartTimestamp;
      } else {
        // This is a follow up from an existing Penance channel, it doesn't start its own GCD but the last cast is always after the initial GCD. This makes it so the last cast is still considered a valid cast.
        debug && console.log(`%cABC: Follow up penance cast, ignoring time wasted`, 'color: gray');
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


  on_finished() {
    this.lastPenanceStartTimestamp = null;
    this.truePenanceCasts = 0;

    super.on_finished();
  }
}

export default AlwaysBeCasting;
