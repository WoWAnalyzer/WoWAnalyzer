import type { JSX } from 'react';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class Judgment extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />
          </b>{' '}
          is a filler you cast for damage, and for the{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> it generates. It is not something to
          hold a global open for, which is why the best logs cast it well below its theoretical
          maximum -- the graph below is there to show you when you cast it, not to be filled in.
        </p>
        <p>
          Never spend an <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> proc on it.{' '}
          <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> is always the better home for a proc.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> casts
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
      // Deliberately no useThresholds: grading this on efficiency would tell players to cast
      // it more, when it is the lowest priority thing they can press.
      <CastEfficiencyBar
        spell={SPELLS.JUDGMENT_CAST_HOLY}
        gapHighlightMode={GapHighlight.None}
        minimizeIcons
        slimLines
      />
    );
  }
}

export default Judgment;
