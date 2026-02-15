import type { JSX } from 'react';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/paladin';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class Judgment extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />
        </b>{' '}
        is one of your primary damaging spells but is also your highest priority healing spell
        (alongside <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} />) due to its synergy with
        generating <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />,{' '}
        <SpellLink spell={TALENTS.GREATER_JUDGMENT_HOLY_TALENT} /> and{' '}
        <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} />, and{' '}
        <SpellLink spell={TALENTS.EMPYREAN_LEGACY_HOLY_TALENT} />.
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
        spell={SPELLS.JUDGMENT_CAST_HOLY}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default Judgment;
