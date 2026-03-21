import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import ShadowWordPain from 'analysis/retail/priest/shared/ShadowWordPain';
import { TALENTS_PRIEST } from 'common/TALENTS';

class DotUptimes extends Analyzer {
  static dependencies = {
    shadowWordPain: ShadowWordPain,
  };
  protected shadowWordPain!: ShadowWordPain;

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <b>Keep your DoTs up on the boss.</b>
        </p>
        <p>
          By keeping <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> active, your over time healing
          through <SpellLink spell={SPELLS.ATONEMENT_BUFF} /> is increased.
        </p>
        <p>
          If talented, <SpellLink spell={TALENTS_PRIEST.POWER_OF_THE_DARK_SIDE_TALENT} />,{' '}
          <SpellLink spell={TALENTS_PRIEST.SHADOW_MEND_TALENT} />, and{' '}
          <SpellLink spell={TALENTS_PRIEST.EXPIATION_TALENT} /> will synergize with{' '}
          <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> and increase your overall output.
        </p>
      </>
    );

    const data = <RoundedPanel>{this.shadowWordPain.subStatistic()}</RoundedPanel>;

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.shadowWordPain.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimes;
