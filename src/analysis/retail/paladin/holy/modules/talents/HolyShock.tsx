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

class HolyShock extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} />
        </b>{' '}
        is the driving force behind the whole specialization. It is your main{' '}
        <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> generator, procs{' '}
        <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} />, and does great single-target healing due to
        talents like <SpellLink spell={TALENTS.AWESTRUCK_TALENT} />,{' '}
        <SpellLink spell={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} />,{' '}
        <SpellLink spell={TALENTS.DIVINE_GLIMPSE_TALENT} />,{' '}
        <SpellLink spell={TALENTS.RECLAMATION_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.OVERFLOWING_LIGHT_TALENT} />. Your usage of{' '}
        <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> is further made available via{' '}
        <SpellLink spell={TALENTS.LIGHTS_CONVICTION_TALENT} />,{' '}
        <SpellLink spell={TALENTS.GLORIOUS_DAWN_TALENT} />,{' '}
        <SpellLink spell={TALENTS.CRUSADERS_MIGHT_TALENT} />, and{' '}
        <SpellLink spell={TALENTS.IMBUED_INFUSIONS_TALENT} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> cast efficiency
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
        spell={TALENTS.HOLY_SHOCK_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default HolyShock;
