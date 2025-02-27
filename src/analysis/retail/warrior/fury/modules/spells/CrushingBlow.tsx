import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/vM8zdCPFhZkxfW3y?fight=45&type=casts&source=13
 */

// Track how many times Crushing Blow was used when another ability would have been preferred
class CrushingBlow extends Analyzer {
  badCrushingBlows: number = 0;
  unenragedCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RECKLESS_ABANDON_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSHING_BLOW),
      this.onCrushingBlowCast,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.badCrushingBlows,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCrushingBlowCast(event: CastEvent) {
    const slaughteringStrikesStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.SLAUGHTERING_STRIKES_BUFF,
    );
    const enraged = this.selectedCombatant.hasBuff(SPELLS.ENRAGE);

    if (!enraged) {
      this.unenragedCount += 1;
      this.badCrushingBlows += 1;
      addInefficientCastReason(event, 'Crushing Blow was used while not enraged');
    } else if (slaughteringStrikesStacks >= 3) {
      this.badCrushingBlows += 1;
      addInefficientCastReason(
        event,
        'With at least 3 stacks of Slaughtering Strikes, Rampage should be used before Crushing Blow',
      );
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you used <SpellLink spell={SPELLS.CRUSHING_BLOW} /> when another
          ability would have been preferred. <SpellLink spell={SPELLS.CRUSHING_BLOW} /> was used
          while not Enraged {this.unenragedCount} times. Refer to Wowhead or Maxroll guides for a
          full description of when to best use <SpellLink spell={SPELLS.CRUSHING_BLOW} /> .
        </>,
      )
        .icon(SPELLS.CRUSHING_BLOW.icon)
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.crushingblows.bad',
            message: `${actual} bad Crushing Blows.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default CrushingBlow;
