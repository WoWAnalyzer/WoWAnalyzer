import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class RisingSunKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
        </b>{' '}
        is one of your primary dps skills and should be used immediately in most cases, as dictated
        by the APL. When <SpellLink spell={TALENTS_MONK.XUENS_BATTLEGEAR_TALENT} /> is talented,{' '}
        <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> reduces the cooldown of{' '}
        <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} /> by 4 seconds.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> cast efficiency
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
        spellId={TALENTS_MONK.RISING_SUN_KICK_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default RisingSunKick;
