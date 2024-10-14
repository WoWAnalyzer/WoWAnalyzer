import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class ChiBurst extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} />
        </b>{' '}
        is a filler spell that is also very good at resetting{' '}
        <SpellLink spell={TALENTS_MONK.JADEFIRE_STOMP_TALENT} />.{' '}
        <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} /> ideally should be used when
        anything else would break mastery, or when movement is required and you are at risk of not
        being able to reset your <SpellLink spell={TALENTS_MONK.JADEFIRE_HARMONY_TALENT} />{' '}
        cooldown.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MONK.CHI_BURST_SHARED_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default ChiBurst;
