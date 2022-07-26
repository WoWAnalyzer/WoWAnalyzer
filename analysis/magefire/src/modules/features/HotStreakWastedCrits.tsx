import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { HasTarget, EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import { FIRE_DIRECT_DAMAGE_SPELLS, StandardChecks } from '@wowanalyzer/mage';

class HotStreakWastedCrits extends Analyzer {
  static dependencies = {
    standardChecks: StandardChecks,
  };
  protected standardChecks!: StandardChecks;

  hasPyromaniac: boolean = this.selectedCombatant.hasTalent(SPELLS.PYROMANIAC_TALENT.id);

  // prettier-ignore
  wastedCrits = () => {
    let events = this.standardChecks.getEventsByBuff(true, SPELLS.HOT_STREAK, EventType.Damage, FIRE_DIRECT_DAMAGE_SPELLS);

    //Filter it out if they were using their Hot Streak at the exact same time that Scorch was cast.
    //There is a small grace period and Scorch has no travel time, so this makes it look like the Scorch cast was wasted when it wasnt.
    events = events.filter(e => !e.ability.guid === SPELLS.SCORCH.id || this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id, e.timestamp + 50));

    //Filter out anything that isnt a Crit
    events = events.filter(e => e.hitType === HIT_TYPES.CRIT);

    //Filter out Phoenix Flames cleaves
    events = events.filter(e => {
      const cast = this.standardChecks.getEvents(true, EventType.Cast, 1, e.timestamp, 5000, SPELLS[e.ability.guid])[0];
      if (cast && HasTarget(cast)) {
        const castTarget = encodeTargetString(cast.targetID, cast.targetInstance);
        return castTarget === encodeTargetString(e.targetID, e.targetInstance);
      }
      return true;
    });

    //If the player got a Pyromaniac proc, then dont count it as a wasted proc because there is nothing they could have done to prevent the crit from being wasted.
    events = events.filter((e) => {
      const pyromaniacProc = this.standardChecks.getEvents(true, EventType.RemoveBuff, 1, e.timestamp, 250, SPELLS.HOT_STREAK)[0];
      return !this.hasPyromaniac || !pyromaniacProc;
    });

    //Highlight Timeline
    events.forEach((e) => {
      const cast = this.standardChecks.getEvents(true, EventType.Cast, 1, e.timestamp, 5000, SPELLS[e.ability.guid])[0];
      const tooltip = 'This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.';
      cast && this.standardChecks.highlightInefficientCast(cast, tooltip);
    });
    return events.length;
  };

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCrits() / (this.owner.fightDuration / 60000),
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.wastedCritsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You crit with {formatNumber(this.wastedCrits())} (
          {formatNumber(this.wastedCritsThresholds.actual)} Per Minute) direct damage abilities
          while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste since those
          crits could have contibuted towards your next Hot Streak. Try to use your procs as soon as
          possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(
          <Trans id="mage.fire.suggestions.hotStreak.wastedCrits">
            {formatNumber(this.wastedCrits())} crits wasted
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }
}

export default HotStreakWastedCrits;
