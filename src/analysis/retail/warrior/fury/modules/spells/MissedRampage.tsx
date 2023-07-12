import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/KhynM7v96cZkTBdg#fight=6&type=damage-done&source=78
 */

const RAGE_GENERATORS = [
  SPELLS.RAGING_BLOW,
  SPELLS.BLOODTHIRST,
  SPELLS.EXECUTE_FURY,
  SPELLS.WHIRLWIND_FURY_CAST,
];

// This whole module is kind of messed up on the theorycrafting level. As of 8.3 there are a lot of times that Rampage isn't the top priority if you have to keep Bloodthirst up for gushing wounds or cast whirlwind before rampage to cleave. TBD in shadowlands
class MissedRampage extends Analyzer {
  missedRampages: number = 0;
  hasFB: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RAMPAGE_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([...RAGE_GENERATORS]), this.onCast);
  }

  get suggestionThresholds() {
    if (this.hasFB) {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 0,
          major: 0,
        },
        style: ThresholdStyle.NUMBER,
      };
    } else {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 5,
          major: 10,
        },
        style: ThresholdStyle.NUMBER,
      };
    }
  }

  onCast(event: CastEvent) {
    if (!event.classResources) {
      return;
    }

    if (
      !event.classResources.find((classResources) => classResources.type === RESOURCE_TYPES.RAGE.id)
    ) {
      return;
    }

    const rage = event.classResources[0].amount / 10;
    if (rage >= 90) {
      this.missedRampages += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you casted a rage generating ability when you should have cast{' '}
          <SpellLink spell={SPELLS.RAMPAGE} />.
          <SpellLink spell={SPELLS.RAMPAGE} /> is your 2nd highest damage ability behind{' '}
          <SpellLink spell={SPELLS.EXECUTE_FURY} /> and causes you to{' '}
          <SpellLink spell={SPELLS.ENRAGE} />, increasing all of your damage done. You should never
          hold a <SpellLink spell={SPELLS.RAMPAGE} />, unless you are casting{' '}
          <SpellLink spell={SPELLS.WHIRLWIND_FURY_CAST} /> to cleave it.
        </>,
      )
        .icon(SPELLS.RAMPAGE.icon)
        .actual(
          t({
            id: 'warrior.fury.suggestions.rampages.missed',
            message: `${actual} missed Rampages.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default MissedRampage;
