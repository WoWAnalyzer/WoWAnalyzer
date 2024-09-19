import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/priest/holy/Guide';

class holyWordSanctify extends Analyzer {
  sanctifyHealing = 0;
  sanctifyOverhealing = 0;
  sanctifyCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.HOLY_WORD_SANCTIFY]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_WORD_SANCTIFY.id) {
      this.sanctifyCasts += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.HOLY_WORD_SANCTIFY} />
        </b>{' '}
        is one of our most efficient spells and we should avoid being capped on stacks as our other
        spells reduce its cooldown.
      </p>
    );

    const data = <CastEfficiencyPanel spell={SPELLS.HOLY_WORD_SANCTIFY} useThresholds />;

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default holyWordSanctify;
