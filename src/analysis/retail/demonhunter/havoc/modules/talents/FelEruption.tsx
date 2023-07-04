import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Example Report: https://www.warcraftlogs.com/reports/9tAcN6PLwjMF4vm1/#fight=1&source=1
 */

class FelEruption extends Analyzer {
  casts = 0;
  stuns = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT),
      this.countingCasts,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT),
      this.countingStuns,
    );
  }

  get badCasts() {
    return this.casts - this.stuns;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  countingCasts(_: CastEvent) {
    this.casts += 1;
  }

  countingStuns(_: ApplyDebuffEvent) {
    this.stuns += 1;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          Try to cast <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT} /> only for its
          stun. It's not worth casting for its damage since it's a DPS loss.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT} /> casts that
            didn't stun the target{' '}
          </>,
        )
        .recommended('No bad casts are recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This ability should only be used for its stun. Its a DPS loss. <br /> <br />
            You casted this ability a total of {this.casts} time(s). <br />
            It stunned a target {this.stuns} time(s).
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT}>
          {this.badCasts} <small>bad casts that didn't stun the target</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FelEruption;
