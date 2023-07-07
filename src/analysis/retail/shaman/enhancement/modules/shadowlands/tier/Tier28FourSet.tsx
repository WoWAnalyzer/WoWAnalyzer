import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { TIERS } from 'game/TIERS';

class Tier28FourSet extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T28);
  }

  get threshold() {
    return {
      actual: this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT),
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    when(this.threshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          It is strongly adviced to select the{' '}
          <SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT} /> talent while wearing the T28
          tier 4 piece set.
        </>,
      )
        .icon(TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT.icon)
        .staticImportance(ISSUE_IMPORTANCE.MINOR),
    );
  }
}

export default Tier28FourSet;
