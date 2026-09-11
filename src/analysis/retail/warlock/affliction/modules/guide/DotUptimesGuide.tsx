import Analyzer from 'parser/core/Analyzer';
import { JSX } from 'react';
import { SpellLink, TooltipElement } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import Agony from '../analyzers/Agony';
import Corruption from '../analyzers/Corruption';
import Haunt from '../analyzers/Haunt';
import { formatPercentage } from 'common/format';

class DotUptimesGuide extends Analyzer {
  static dependencies = {
    agony: Agony,
    corruption: Corruption,
    haunt: Haunt,
  };

  protected agony!: Agony;
  protected corruption!: Corruption;
  protected haunt!: Haunt;

  get guideSubsection(): JSX.Element {
    const hauntActive = this.selectedCombatant.hasTalent(TALENTS.HAUNT_TALENT);
    const witherActive = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT);
    const corruptionSpell = witherActive ? SPELLS.WITHER_DEBUFF : SPELLS.CORRUPTION_DEBUFF;

    const explanation = (
      <>
        <p>
          <b>Keep your DoTs active at all times.</b>
        </p>
        <p>
          <SpellLink spell={SPELLS.AGONY} /> is your primary Soul Shard generator.
        </p>
        <p>
          <SpellLink spell={corruptionSpell} /> enables rotational synergies with{' '}
          <SpellLink spell={SPELLS.NIGHTFALL_BUFF} />.
        </p>
        {hauntActive && (
          <p>
            <SpellLink spell={TALENTS.HAUNT_TALENT} /> increases all damage dealt to the target by{' '}
            <TooltipElement
              content={
                <>
                  Haunt's damage bonus:
                  <ul>
                    <li>+16% baseline</li>
                    {this.haunt.shadowOfNathrezaBonus > 0 && (
                      <li>
                        +{formatPercentage(this.haunt.shadowOfNathrezaBonus, 0)}% from{' '}
                        <SpellLink spell={TALENTS.SHADOW_OF_NATHREZA_2_AFFLICTION_TALENT} />
                      </li>
                    )}
                  </ul>
                </>
              }
            >
              <b>{formatPercentage(this.haunt.hauntDamageBonus, 0)}%</b>
            </TooltipElement>{' '}
            for 18 seconds.
          </p>
        )}
        {this.agony.DowntimePerformance === QualitativePerformance.Ok && (
          <p style={{ color: 'orange' }}>Agony uptime is average. Refresh it more consistently.</p>
        )}
        {this.agony.DowntimePerformance === QualitativePerformance.Fail && (
          <p style={{ color: 'red' }}>Agony uptime is low! Keep it applied at all times.</p>
        )}
        {this.corruption.DowntimePerformance === QualitativePerformance.Ok && (
          <p style={{ color: 'orange' }}>
            <SpellLink spell={corruptionSpell} /> uptime is average. Refresh it more consistently.
          </p>
        )}
        {this.corruption.DowntimePerformance === QualitativePerformance.Fail && (
          <p style={{ color: 'red' }}>
            <SpellLink spell={corruptionSpell} /> uptime is low! Keep it applied at all times.
          </p>
        )}
        {hauntActive && this.haunt.DowntimePerformance === QualitativePerformance.Ok && (
          <p style={{ color: 'orange' }}>
            <SpellLink spell={TALENTS.HAUNT_TALENT} /> uptime is average. Reapply before it falls
            off.
          </p>
        )}
        {hauntActive && this.haunt.DowntimePerformance === QualitativePerformance.Fail && (
          <p style={{ color: 'red' }}>
            <SpellLink spell={TALENTS.HAUNT_TALENT} /> uptime is low! Focus on keeping it applied at
            all times.
          </p>
        )}
      </>
    );

    const data = (
      <RoundedPanel>
        {this.agony.subStatistic()}
        {this.corruption.subStatistic()}
        {hauntActive && this.haunt.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const hauntActive = this.selectedCombatant.hasTalent(TALENTS.HAUNT_TALENT);
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.agony.subStatistic()}
        {this.corruption.subStatistic()}
        {hauntActive && this.haunt.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimesGuide;
