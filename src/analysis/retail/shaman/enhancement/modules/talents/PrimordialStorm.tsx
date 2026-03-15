import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { MaelstromWeaponTracker } from '../resourcetracker';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';

interface PrimordialStormCast extends CooldownTrigger<CastEvent> {
  details: {
    maelstromUsed: number;
    shouldHaveHadDoomwinds: boolean;
    hadDoomwinds: boolean;
  };
}

class PrimordialStorm extends MajorCooldown<PrimordialStormCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    resourceTracker: MaelstromWeaponTracker,
  };

  resourceTracker!: MaelstromWeaponTracker;
  doomWindsAlternater = false;

  constructor(options: Options) {
    super({ spell: TALENTS.PRIMORDIAL_STORM_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_STORM_CAST),
      this.onPrimordialStormCast,
    );
  }

  private onPrimordialStormCast(event: CastEvent) {
    this.doomWindsAlternater = !this.doomWindsAlternater;

    const hadDoomwinds = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF, event.timestamp);
    // If they have Doom Winds, we don't want to incorrectly flag it as missing
    if (hadDoomwinds) {
      this.doomWindsAlternater = true;
    }

    const details: PrimordialStormCast['details'] = {
      shouldHaveHadDoomwinds: this.doomWindsAlternater,
      hadDoomwinds,
      maelstromUsed: this.resourceTracker.lastSpenderInfo?.amount ?? 0,
    };

    const lis: ReactNode[] = [];

    if (details.shouldHaveHadDoomwinds && !details.hadDoomwinds) {
      lis.push(
        <>
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> was missing.
        </>,
      );
    }

    if (details.maelstromUsed < 10) {
      lis.push(
        <>
          Cast with less than 10 <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />
        </>,
      );
    }

    if (lis.length === 1) {
      addInefficientCastReason(event, lis[0]);
    } else if (lis.length > 1) {
      addInefficientCastReason(
        event,
        <>
          Cast without the following conditions met:
          <ul>
            {lis.map((x, i) => {
              return <li key={i}>{x}</li>;
            })}
          </ul>
        </>,
      );
    }

    this.recordCooldown({ event, details });
  }

  private buildOverviewStats() {
    const totalMaelstromUsed = this.casts.reduce(
      (total, cast) => total + (cast.details.maelstromUsed ?? 0),
      0,
    );
    const doomWindsExpected = this.casts.filter((cast) => cast.details.shouldHaveHadDoomwinds);
    const doomWindsSynced = doomWindsExpected.filter((cast) => cast.details.hadDoomwinds).length;

    return [
      {
        value: `${this.casts.length}`,
        label: 'Total Casts',
        tooltip: (
          <>
            Total <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> casts.
          </>
        ),
      },
      {
        value: this.casts.length > 0 ? (totalMaelstromUsed / this.casts.length).toFixed(1) : '0.0',
        label: 'Avg Maelstrom',
        tooltip: (
          <>
            Average <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> stacks spent on each{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> cast.
          </>
        ),
      },
      {
        value:
          doomWindsExpected.length > 0 ? `${doomWindsSynced}/${doomWindsExpected.length}` : '0/0',
        label: 'Doom Winds Sync',
        tooltip: (
          <>
            Successful <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> pairings with{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
          </>
        ),
      },
    ];
  }

  private buildPerCastData(): PerCastData[] {
    return this.casts.map((cast) => {
      const spellUse = this.explainPerformance(cast);
      const details = cast.details;

      return {
        performance: spellUse.performance,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        detailsIcon: null,
        stats: [
          {
            value: `${details.maelstromUsed}`,
            label: 'Maelstrom',
            tooltip: (
              <>
                {' '}
                <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> stacks spent.
              </>
            ),
            performance: spellUse.checklistItems.find((item) => item.check === 'maelstrom-weapon')
              ?.performance,
          },
          {
            value: details.shouldHaveHadDoomwinds ? (details.hadDoomwinds ? 'Yes' : 'No') : 'N/A',
            label: 'Doom Winds',
            tooltip: (
              <>
                Every second <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> cast should be
                paired with <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />.
              </>
            ),
            performance: spellUse.checklistItems.find((item) => item.check === 'doom-winds')
              ?.performance,
          },
        ],
      };
    });
  }

  get guideSubsection() {
    if (!this.active) {
      return null;
    }

    return (
      <GuideSection spell={TALENTS.PRIMORDIAL_STORM_TALENT} explanation={this.description()}>
        <CastOverview spell={TALENTS.PRIMORDIAL_STORM_TALENT} stats={this.buildOverviewStats()} />
        <CastDetail title="Primordial Storm Casts" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }

  description() {
    const pstorm = (
      <>
        <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />
      </>
    );
    const msw = <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />;

    return (
      <>
        <p>
          Each hit from {pstorm} is considered a Main-Hand attack, and can trigger{' '}
          <SpellLink spell={TALENTS.WINDFURY_WEAPON_TALENT} /> separately and are AoE. Each hit
          deals combination physical and spell damage.
        </p>
        <p>
          {pstorm} is currently the <strong>strongest</strong> {msw} spender, and you should always
          aim to cast it with 10 unless waiting would mean losing the cast. The {msw} spent
          double-dips and also increases the damage of the follow-up{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} />/
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> that is automatically cast.
        </p>
      </>
    );
  }

  explainPerformance(cast: PrimordialStormCast): SpellUse {
    const details = cast.details;
    const checklistItems: ChecklistUsageInfo[] = [];

    /**
     * Maelstrom Used
     */
    checklistItems.push({
      check: 'maelstrom-weapon',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: details.maelstromUsed,
        isGreaterThanOrEqual: {
          perfect: 10,
          good: 8,
          ok: 5,
        },
      }),
      summary: (
        <>
          <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> usage
        </>
      ),
      details: (
        <div>
          <strong>{details.maelstromUsed}</strong>{' '}
          <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> used.
        </div>
      ),
    });

    /**
     * Doom Winds
     */
    if (details.shouldHaveHadDoomwinds) {
      checklistItems.push({
        check: 'doom-winds',
        timestamp: cast.event.timestamp,
        performance: details.hadDoomwinds
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {details.hadDoomwinds ? '' : 'not'}{' '}
            active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {details.hadDoomwinds ? '' : 'not'}{' '}
            active.
          </div>
        ),
      });
    }

    return {
      event: cast.event,
      checklistItems,
      performance: getAveragePerf(checklistItems.map((c) => c.performance)),
    };
  }
}

export default PrimordialStorm;
