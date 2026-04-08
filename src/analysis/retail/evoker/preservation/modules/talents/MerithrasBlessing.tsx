import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
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
import {
  getEchoConsumptions,
  getMerithrasGeneratingCast,
  getMerithrasHealing,
} from '../../normalizers/EventLinking/helpers';
import { formatPercentage, formatNumber } from 'common/format';

interface MerithrasCastData {
  cast: CastEvent;
  effectiveHealing: number;
  overhealing: number;
  echoConsumptions: number;
}

class MerithrasBlessing extends Analyzer {
  castHealing = 0;
  absorbHealing = 0;
  badRefreshes: number[] = [];
  lastRefresh = 0;
  castData: MerithrasCastData[] = [];

  dreamBreathCasts = [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id];

  constructor(options: Options) {
    super(options);
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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const healingEvents = getMerithrasHealing(event);
    const echoConsumptions = getEchoConsumptions(event);

    let effectiveHealing = 0;
    let overhealing = 0;

    for (const heal of healingEvents) {
      if (heal.amount) {
        effectiveHealing += heal.amount + (heal.absorbed || 0);
      }
      if (heal.overheal) {
        overhealing += heal.overheal;
      }
    }

    this.castData.push({
      cast: event,
      effectiveHealing,
      overhealing,
      echoConsumptions: echoConsumptions.length > 0 ? echoConsumptions.length : 0,
    });
  }

  onRefresh(event: RefreshBuffEvent) {
    const generatingCast = getMerithrasGeneratingCast(event);
    if (
      generatingCast &&
      this.dreamBreathCasts.includes(generatingCast.ability.guid) &&
      this.lastRefresh !== event.timestamp
    ) {
      this.lastRefresh = event.timestamp;
      this.badRefreshes.push(event.timestamp);
    }
  }
  onHeal(event: HealEvent) {
    this.castHealing += event.amount + (event.absorbed || 0);
  }
  onAbsorb(event: HealEvent) {
    this.absorbHealing += event.amount + (event.absorbed || 0);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <div>
        <p>
          <b>
            <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} />
          </b>{' '}
          is your apex talent and most important spell to consume{' '}
          <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> with. You aim should be to consume your
          procs into as many <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
          es as possible right as damage hits the group
        </p>
        <p>
          It is important that you use your <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} />{' '}
          procs before <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> becomes available,
          as casting it would overwrite the buff with a new one making you miss out on a cast of it.
        </p>
      </div>
    );

    const allEvents = [
      ...this.castData.map((cast) => ({
        type: 'cast' as const,
        timestamp: cast.cast.timestamp,
        data: cast,
      })),
      ...this.badRefreshes.map((timestamp) => ({
        type: 'refresh' as const,
        timestamp,
      })),
    ].sort((a, b) => a.timestamp - b.timestamp);

    const entries: BoxRowEntry[] = allEvents.map((ev) => {
      let value = QualitativePerformance.Good;
      let tooltip = (
        <>
          <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> @{' '}
          {this.owner.formatTimestamp(ev.timestamp)}
        </>
      );

      if (ev.type === 'refresh') {
        value = QualitativePerformance.Fail;
        tooltip = (
          <>
            <div>{tooltip}</div>
            <div>
              <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> was used while{' '}
              <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> was already active.
            </div>
          </>
        );
      } else {
        const castInfo = ev.data!;
        const totalRawHealing = castInfo.effectiveHealing + castInfo.overhealing;
        const overhealPercent = totalRawHealing > 0 ? castInfo.overhealing / totalRawHealing : 0;
        if (overhealPercent > 0.4) value = QualitativePerformance.Ok;
        tooltip = (
          <>
            <div>{tooltip}</div>
            <div>
              <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />s consumed:{' '}
              {castInfo.echoConsumptions}{' '}
            </div>
            <div>Effective Healing: {formatNumber(castInfo.effectiveHealing)}</div>
            <div>Overhealing: {formatPercentage(overhealPercent, 1)}%</div>
          </>
        );
      }

      return { value, tooltip };
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.MERITHRAS_BLESSING_1_PRESERVATION_TALENT} /> usages
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
              <div>
                <ItemHealingDone amount={this.castHealing} />
              </div>
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
