import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';

import ArcaneTempo from '../talents/ArcaneTempo';

class ArcaneTempoGuide extends Analyzer {
  static dependencies = {
    arcaneTempo: ArcaneTempo,
  };

  protected arcaneTempo!: ArcaneTempo;

  get arcaneTempoUptime() {
    const util = this.arcaneTempo.arcaneTempoUptimeThresholds.actual;
    const thresholds = this.arcaneTempo.arcaneTempoUptimeThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util >= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get guideSubsection(): JSX.Element {
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneTempoIcon = <SpellIcon spell={TALENTS.ARCANE_TEMPO_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneTempo}</b> is a stacking Haste buff that gets applied whenever you spend your{' '}
          {arcaneCharge}s. This buff lasts for 12s, so you can, and should, keep this buff up for
          the entire fight by casting {arcaneBarrage} to spend your {arcaneCharge}s before the buff
          expires. This can sometimes be unavoidable due to forced downtime, but should be minimized
          as much as possible.
        </div>
      </>
    );
    const arcaneTempoTooltip = (
      <>
        {formatPercentage(this.arcaneTempo.buffUptimePercent)}% Uptime (
        {formatDuration(this.arcaneTempo.buffUptimeMS)} / {formatDuration(this.owner.fightDuration)}
        ).
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(this.arcaneTempoUptime),
              fontSize: '20px',
            }}
          >
            {arcaneTempoIcon}{' '}
            <TooltipElement content={arcaneTempoTooltip}>
              {formatPercentage(this.arcaneTempo.buffUptimePercent, 2)}% <small>Buff Uptime</small>
            </TooltipElement>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Tempo',
    );
  }
}

export default ArcaneTempoGuide;
