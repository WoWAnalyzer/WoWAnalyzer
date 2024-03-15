import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/paladin/holy/Guide';
import { SpellLink } from 'interface';
import spells from 'common/SPELLS';
import talents from 'common/TALENTS/paladin';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class HolyShock extends Analyzer {
  get guideSubSection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={spells.HOLY_SHOCK_HEAL} />
        </b>{' '}
        is your most efficient healing spell available. Try to cast them as much as possible without
        overhealing. It is your only source of <SpellLink spell={spells.INFUSION_OF_LIGHT} /> and
        how you spread <SpellLink spell={talents.GLIMMER_OF_LIGHT_TALENT} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={talents.HOLY_SHOCK_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <CastEfficiencyBar
              gapHighlightMode={GapHighlight.FullCooldown}
              spellId={talents.HOLY_SHOCK_TALENT.id}
              slimLines
              minimizeIcons
              useThresholds
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default HolyShock;
