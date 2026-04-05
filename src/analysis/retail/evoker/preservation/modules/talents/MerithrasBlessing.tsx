import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface CastInfo {
  refreshed: boolean;
  timestamp: number;
}

class MerithrasBlessing extends Analyzer {
  castHealing = 0;
  absorbHealing = 0;
  procs: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_CAST),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_ABSORB),
      this.onAbsorb,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.procs.push({ timestamp: event.timestamp, refreshed: false });
  }
  onRefresh(event: RefreshBuffEvent) {
    this.procs.push({ timestamp: event.timestamp, refreshed: true });
  }
  onHeal(event: HealEvent) {
    this.castHealing += event.amount + (event.absorbed || 0);
  }
  onAbsorb(event: HealEvent) {
    this.absorbHealing += event.amount + (event.absorbed || 0);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.MERITHRAS_BLESSING_1_PRESERVATION_TALENT} />
        </b>{' '}
        is your apex talent and most important spell to consume{' '}
        <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> with. You want to consume as many echoes as
        possible with it and cast it shortly after you get it to avoid overwriting your proc.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.procs.forEach((info) => {
      if (info.refreshed) {
        const value = QualitativePerformance.Fail;
        const tooltip = (
          <>
            <p>
              <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> @{' '}
              {this.owner.formatTimestamp(info.timestamp)}{' '}
            </p>
            Refreshed without consuming
          </>
        );
        entries.push({ value, tooltip });
      } else {
        const value = QualitativePerformance.Good;
        const tooltip = (
          <>
            <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> @{' '}
            {this.owner.formatTimestamp(info.timestamp)}
          </>
        );
        entries.push({ value, tooltip });
      }
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.MERITHRAS_BLESSING_1_PRESERVATION_TALENT} />{' '}
            utilization
          </strong>
          <PerformanceBoxRow values={entries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.MERITHRAS_BLESSING_1_PRESERVATION_TALENT} />
          </label>
          <div className="value">
            <div>
              <small>
                <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} />
              </small>
            </div>
            <div>
              <ItemHealingDone amount={this.castHealing} />
            </div>
            <div>
              <small>
                <SpellLink spell={SPELLS.MERITHRAS_BLESSING_ABSORB} />
              </small>
            </div>
            <div>
              <ItemHealingDone amount={this.absorbHealing} />
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default MerithrasBlessing;
