import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

class Judgment extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        {/* TODO: Writeup on Judgment. */}
        <b>
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />
        </b>{' '}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={SPELLS.JUDGMENT_CAST_HOLY.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default Judgment;
