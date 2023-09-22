import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { CastEvent } from 'parser/core/Events';
import { SuggestionFactory, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SuggestionThresholds from '../../SuggestionThresholds';

const debug = false;

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  // counting damaging abilities here because of atonement mechanics
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.POWER_WORD_RADIANCE.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.HALO_TALENT.id,
    TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT.id,
    SPELLS.MASS_DISPEL.id,
    TALENTS.DISPEL_MAGIC_TALENT.id,
    SPELLS.POWER_WORD_BARRIER_CAST.id,
    SPELLS.PURIFY.id,
    TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id,
    TALENTS_PRIEST.SHADOW_COVENANT_TALENT.id,
    TALENTS_PRIEST.EVANGELISM_TALENT.id,
  ];

  lastPenanceStartTimestamp: number = 0;
  _lastCastFinishedTimestamp: number = 0;

  // TODO: Fix me
  recordCastTime(
    castStartTimestamp: number,
    globalCooldown: number,
    begincast: number,
    cast: CastEvent,
    spellId: number,
  ) {
    if (spellId === SPELLS.PENANCE.id || spellId === SPELLS.PENANCE_HEAL.id) {
      if (
        !this.lastPenanceStartTimestamp ||
        castStartTimestamp - this.lastPenanceStartTimestamp > PENANCE_CHANNEL_TIME_BUFFER
      ) {
        debug && console.log('%cABC: New penance channel started', 'color: orange');
        this.lastPenanceStartTimestamp = castStartTimestamp;
      } else {
        // This is a follow up from an existing Penance channel, it doesn't start its own GCD but the last cast is always after the initial GCD. This makes it so the last cast is still considered a valid cast.
        debug && console.log('%cABC: Follow up penance cast, ignoring time wasted', 'color: gray');
        this._lastCastFinishedTimestamp = Math.max(this._lastCastFinishedTimestamp, cast.timestamp);
        return; // by returning here we don't get an invalid time wasted added
      }
    }
  }

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(SuggestionThresholds.ABC_NOT_CASTING.minor)
      .addSuggestion((suggest: SuggestionFactory, actual: number, recommended: number) =>
        suggest(
          "Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you're not healing try to contribute some damage.",
        )
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
              id: 'priest.discipline.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(SuggestionThresholds.ABC_NOT_CASTING.regular)
          .major(SuggestionThresholds.ABC_NOT_CASTING.major),
      );
  }
}

export default AlwaysBeCasting;
