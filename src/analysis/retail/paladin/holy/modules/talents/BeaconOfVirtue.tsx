import { TALENTS_PALADIN } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer from 'parser/core/Analyzer';
import talents from 'common/TALENTS/paladin';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellLink from 'interface/SpellLink';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

class BeaconOfVirtue extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={talents.BEACON_OF_VIRTUE_TALENT} />
        </b>{' '}
        is your best tool to handle burst AoE damage. It is quite mana expensive though, so you
        should use it on cooldown only when healing is required.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={talents.BEACON_OF_VIRTUE_TALENT} /> cast efficiency
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
        spellId={TALENTS_PALADIN.BEACON_OF_VIRTUE_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default BeaconOfVirtue;
