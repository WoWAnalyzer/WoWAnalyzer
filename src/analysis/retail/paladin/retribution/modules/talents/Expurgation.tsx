import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const BAR_COLOR = '#C27217';
const GUIDE_EXPLANATION_PERCENT = 30;
class Expurgation extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.EXPURGATION_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.EXPURGATION_DEBUFF.id);
  }

  get DowntimePerformance(): QualitativePerformance {
    if (this.uptime >= 0.99) {
      return QualitativePerformance.Perfect;
    }
    if (this.uptime >= 0.95) {
      return QualitativePerformance.Good;
    }
    if (this.uptime >= 0.8) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.EXPURGATION_DEBUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
      perf: this.DowntimePerformance,
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <strong>
          Maintain <SpellLink spell={SPELLS.EXPURGATION_DEBUFF} /> on the boss.
        </strong>
        <p>
          It is applied by <SpellLink spell={TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT} /> and it
          increases your damage done to the boss through{' '}
          <SpellLink spell={TALENTS_PALADIN.HOLY_FLAMES_TALENT} />.
        </p>
      </>
    );

    const data = (
      <RoundedPanel>
        <strong>
          <SpellLink spell={SPELLS.EXPURGATION_DEBUFF.id} /> uptime
        </strong>
        {this.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_EXPLANATION_PERCENT);
  }
}

export default Expurgation;
