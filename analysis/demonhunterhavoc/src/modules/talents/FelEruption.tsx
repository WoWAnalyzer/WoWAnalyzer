import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Example Report: https://www.warcraftlogs.com/reports/9tAcN6PLwjMF4vm1/#fight=1&source=1
 */

class FelEruption extends Analyzer {
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

  casts = 0;
  stuns = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEL_ERUPTION_TALENT),
      this.countingCasts,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FEL_ERUPTION_TALENT),
      this.countingStuns,
    );
  }

  countingCasts(event: CastEvent) {
    this.casts += 1;
  }

  countingStuns(event: ApplyDebuffEvent) {
    this.stuns += 1;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> only for its stun. It's not
          worth casting for its damage since it's a DPS loss.
        </>,
      )
        .icon(SPELLS.FEL_ERUPTION_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> casts that didn't stun the
            target{' '}
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
        <BoringSpellValueText spellId={SPELLS.FEL_ERUPTION_TALENT.id}>
          <>
            {this.badCasts} <small>bad casts that didn't stun the target</small>{' '}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FelEruption;
