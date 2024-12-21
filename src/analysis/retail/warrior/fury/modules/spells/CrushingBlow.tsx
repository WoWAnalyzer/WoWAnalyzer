import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/vM8zdCPFhZkxfW3y?fight=45&type=casts&source=13
 */

// Track how many times Rampage was used before using the charge of Crushing Blow it provides
class CrushingBlow extends Analyzer {
  cbBuffRefreshCount: number = 0;
  unenragedCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RECKLESS_ABANDON_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAMPAGE),
      this.onRampageCast,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.cbBuffRefreshCount,
      isGreaterThan: {
        minor: 0,
        average: 4,
        major: 8,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onRampageCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.CRUSHING_BLOW_BUFF)) {
      this.cbBuffRefreshCount += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you used <SpellLink spell={SPELLS.RAMPAGE} /> before using your
          charge of <SpellLink spell={SPELLS.CRUSHING_BLOW} />.{' '}
          <SpellLink spell={SPELLS.CRUSHING_BLOW} /> is your highest damage ability, and should be
          used every time it is available, as long as you are already enraged.
        </>,
      )
        .icon(SPELLS.CRUSHING_BLOW.icon)
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.crushingblows.missed',
            message: `${actual} missed Crushing Blows.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default CrushingBlow;
