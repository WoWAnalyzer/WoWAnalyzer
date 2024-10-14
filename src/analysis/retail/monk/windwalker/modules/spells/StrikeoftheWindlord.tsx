import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class StrikeoftheWindlord extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} />
        </b>{' '}
        is one of your strongest medium-length cooldown dps abilities.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> cast efficiency
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
        spellId={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default StrikeoftheWindlord;
