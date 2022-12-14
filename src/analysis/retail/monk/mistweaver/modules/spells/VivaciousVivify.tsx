import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Vivify from './Vivify';

class VivaciousVivification extends Analyzer {
  static dependencies = {
    vivify: Vivify,
  };
  protected vivify!: Vivify;
  currentRenewingMists: number = 0;
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
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemoveRem,
    );
  }

  onApplyRem(event: ApplyBuffEvent) {
    this.currentRenewingMists += 1;
  }

  onRemoveRem(event: RemoveBuffEvent) {
    this.currentRenewingMists -= 1;
  }

  onRefresh(event: RefreshBuffEvent) {
    // every refresh is a wasted buff application and the CD restarts
    if (this.currentRenewingMists > this.vivify.estimatedAverageReMs) {
      this.wastedApplications += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedApplications,
      isGreaterThan: {
        minor: 0,
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
          when the raid has a high amount of <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />{' '}
          and wasting instant <SpellLink id={SPELLS.VIVIFY.id} /> casts
        </>,
      )
        .icon(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.icon)
        .actual(
          `${this.wastedApplications + ' '}${t({
            id: 'monk.mistweaver.suggestions.vivaciousVivification.wastedApplications',
            message: `wasted applications with high Renewing Mist Counts`,
          })}`,
        )
        .recommended(`0 wasted applications is recommended`),
    );
  }
}

export default VivaciousVivification;
