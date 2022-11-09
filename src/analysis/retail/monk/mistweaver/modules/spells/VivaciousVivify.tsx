import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class VivaciousVivification extends Analyzer {
  totalCasts: number = 0;
  totalHealed: number = 0;
  wastedApplications: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onRefresh,
    );
  }

  onRefresh(event: RefreshBuffEvent) {
    // every refresh is a wasted buff application and the CD restarts
    this.wastedApplications += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedApplications,
      isGreaterThan: {
        minor: 2,
        average: 5,
        major: 8,
      },
      recommended: 0,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are overcapping on <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} />{' '}
          and wasting instant <SpellLink id={SPELLS.VIVIFY.id} /> casts
        </>,
      )
        .icon(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.icon)
        .actual(
          `${this.wastedApplications + ' '}${t({
            id: 'monk.mistweaver.suggestions.vivaciousVivification.wastedApplications',
            message: `wasted applications`,
          })}`,
        )
        .recommended(`0 wasted applications is recommended`),
    );
  }
}

export default VivaciousVivification;
