import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import StatTracker from 'parser/shared/modules/StatTracker';
import { getArmorMitigationForEvent } from 'parser/retail/armorMitigation';
import {
  buff,
  MajorDefensiveBuff,
  Mitigation,
  MitigationRow,
  MitigationRowContainer,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { CALCIFIED_SPIKES_DR } from '../../../constants';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerformanceMark } from 'interface/guide';
import { PerformanceUsageRow } from 'parser/core/SpellUsage/core';

const BASE_DURATION = 12000;
const CAST_MATCH_BUFFER_MS = 1000;

export default class DemonSpikes extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    statTracker: StatTracker,
  };

  private spikesDurationPerCast = BASE_DURATION;
  private maximumUptime = 0;
  private demonSpikesCasts: CastEvent[] = [];
  private hasCalcifiedSpikes = this.selectedCombatant.hasTalent(
    TALENTS_DEMON_HUNTER.CALCIFIED_SPIKES_TALENT,
  );

  constructor(options: Options & { statTracker: StatTracker }) {
    super(SPELLS.DEMON_SPIKES, buff(SPELLS.DEMON_SPIKES_BUFF), options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMON_SPIKES),
      this.onDemonSpikesCast,
    );
    this.spikesDurationPerCast = BASE_DURATION;
    options.statTracker.add(SPELLS.DEMON_SPIKES_BUFF.id, {
      armor: () => this.bonusArmorGain(options.statTracker),
    });
  }
  get uptimeInMilliseconds() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);
  }

  get maximumUptimeInMilliseconds() {
    return this.maximumUptime;
  }

  get wastedUptimeInMilliseconds() {
    return this.maximumUptimeInMilliseconds - this.uptimeInMilliseconds;
  }

  override get mitigations() {
    return super.mitigations.flatMap((mit) => this.splitMitigationByCast(mit));
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.DEMON_SPIKES} /> nearly <strong>doubles</strong> the amount of
        armor that you have and is critical to have up while actively tanking melee hits.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }

  private bonusArmorGain(statTracker: StatTracker) {
    return (75 * statTracker.currentAgilityRating) / 100;
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }
    let mitigatedAmount = 0;

    if (event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL) {
      mitigatedAmount += getArmorMitigationForEvent(event, this.owner.fight)?.amount ?? 0;
    }
    if (this.hasCalcifiedSpikes) {
      mitigatedAmount += event.amount * CALCIFIED_SPIKES_DR;
    }
    if (mitigatedAmount > 0) {
      this.recordMitigation({
        event,
        mitigatedAmount,
      });
    }
  }

  override mitigationPerformance(maxValue: number): BoxRowEntry[] {
    return this.mitigations.map((mit) => {
      const { perf, explanation } = this.explainPerformance(mit);
      return {
        value: perf,
        tooltip: (
          <>
            <PerformanceUsageRow>
              <PerformanceMark perf={perf} /> {explanation ?? 'Good Usage'}
            </PerformanceUsageRow>
            <div>
              <MitigationRowContainer>
                <strong>Time</strong>
                <strong>Mit.</strong>
              </MitigationRowContainer>
              <MitigationRow
                mitigation={mit}
                segments={this.mitigationSegments(mit)}
                fightStart={this.owner.fight.start_time}
                maxValue={maxValue}
                key={mit.start.timestamp}
              />
            </div>
          </>
        ),
      };
    });
  }

  private splitMitigationByCast(mit: Mitigation) {
    const castTimestamps = [
      ...new Set(
        this.demonSpikesCasts
          .filter(
            (event) =>
              event.timestamp >= mit.start.timestamp - CAST_MATCH_BUFFER_MS &&
              event.timestamp <= mit.end.timestamp,
          )
          .map((event) => event.timestamp)
          .sort((a, b) => a - b),
      ),
    ];

    if (castTimestamps.length <= 1) {
      return [mit];
    }

    return castTimestamps.map((castTimestamp, index) => {
      const startTimestamp = index === 0 ? mit.start.timestamp : castTimestamp;
      const endTimestamp =
        index === castTimestamps.length - 1 ? mit.end.timestamp : castTimestamps[index + 1];
      const mitigated = mit.mitigated.filter(({ event }) =>
        index === castTimestamps.length - 1
          ? event.timestamp >= startTimestamp && event.timestamp <= endTimestamp
          : event.timestamp >= startTimestamp && event.timestamp < endTimestamp,
      );

      return {
        ...mit,
        start:
          startTimestamp === mit.start.timestamp
            ? mit.start
            : { ...mit.start, timestamp: startTimestamp },
        end: endTimestamp === mit.end.timestamp ? mit.end : { ...mit.end, timestamp: endTimestamp },
        mitigated,
        amount: mitigated.reduce((total, event) => total + event.mitigatedAmount, 0),
      };
    });
  }

  private onDemonSpikesCast(event: CastEvent) {
    this.demonSpikesCasts.push(event);
    this.maximumUptime += this.spikesDurationPerCast;
  }
}
