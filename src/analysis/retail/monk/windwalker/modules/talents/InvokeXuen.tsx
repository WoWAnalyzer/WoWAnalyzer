import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';

import { TALENTS_MONK } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class InvokeXuen extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} />
        </b>{' '}
        is one of your strongest cooldowns. When{' '}
        <SpellLink spell={TALENTS_MONK.INVOKERS_DELIGHT_TALENT} /> is taken, you get a personal
        bloodlust for 20 seconds, making Windwalker a very powerful two minute class.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> cast efficiency
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
        spellId={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default InvokeXuen;
