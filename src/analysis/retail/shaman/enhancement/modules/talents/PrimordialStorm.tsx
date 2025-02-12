import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { ReactNode } from 'react';
import { MaelstromWeaponTracker } from '../resourcetracker';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { SPLINTERED_ELEMENTS_LINK } from 'analysis/retail/shaman/shared/constants';
import SplinteredElements from './SplinteredElements';
import { formatPercentage } from 'common/format';

interface PrimordialWaveCast extends CooldownTrigger<CastEvent> {
  primordialStorm?: CastEvent;
  primordialStormDetails?: {
    maelstromUsed: number;
    doomwinds: boolean;
    legacyOfTheFrostWitch: boolean;
  };
}

class PrimordialStorm extends MajorCooldown<PrimordialWaveCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    resourceTracker: MaelstromWeaponTracker,
    splinteredElements: SplinteredElements,
  };

  resourceTracker!: MaelstromWeaponTracker;
  splinteredElements!: SplinteredElements;
  primordialWaveCast: PrimordialWaveCast | null = null;

  constructor(options: Options) {
    super({ spell: TALENTS.PRIMORDIAL_WAVE_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRIMORDIAL_WAVE_TALENT),
      this.onPrimordialWaveCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_STORM_CAST),
      this.onPrimordialStormCast,
    );
  }

  onPrimordialStormCast(event: CastEvent) {
    if (this.primordialWaveCast) {
      this.primordialWaveCast.primordialStorm = event;
      this.primordialWaveCast.primordialStormDetails = {
        doomwinds: this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF),
        legacyOfTheFrostWitch: this.selectedCombatant.hasBuff(
          SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF,
        ),
        maelstromUsed: this.resourceTracker.lastSpenderInfo!.amount,
      };
      const details = this.primordialWaveCast.primordialStormDetails;
      const lis: ReactNode[] = [];
      if (!details.doomwinds) {
        lis.push(
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> was missing.
          </>,
        );
      }
      if (!details.legacyOfTheFrostWitch) {
        lis.push(
          <>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> was missing.
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
      this.recordCooldown(this.primordialWaveCast);
    }
    this.primordialWaveCast = null;
  }

  get guideSubsection() {
    return (
      <>
        <CooldownUsage
          analyzer={this}
          title={
            <>
              <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />
            </>
          }
        />
      </>
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
          deals combination physical and spell damage, and all hits are amplified by{' '}
          <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} />, and{' '}
          <SpellLink spell={SPELLS.PRIMORDIAL_FROST} /> is buffed twice.
        </p>
        <p>
          {pstorm} is currently the <strong>strongest</strong> {msw} spender, and should you should
          always aim to cast it with 10 unless waiting would mean losing the cast. The {msw} spent
          double-dips and also increases the damage of the follow-up{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} />/
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> that is automatically cast.
        </p>
      </>
    );
  }

  explainPerformance(cast: PrimordialWaveCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'doomwinds',
        timestamp: cast.event.timestamp,
        performance: cast.primordialStormDetails?.doomwinds
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> active
          </div>
        ),
      },
      {
        check: 'legacy-of-the-frost-witch',
        timestamp: cast.event.timestamp,
        performance: cast.primordialStormDetails?.legacyOfTheFrostWitch
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> active
          </div>
        ),
      },
      {
        check: 'maelstrom-weapon',
        timestamp: cast.event.timestamp,
        performance: evaluateQualitativePerformanceByThreshold({
          actual: cast.primordialStormDetails?.maelstromUsed ?? 0,
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
            <strong>{cast.primordialStormDetails?.maelstromUsed ?? 0}</strong>{' '}
            <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> used
          </div>
        ),
      },
    ];

    // splintered elements hit count and haste gained
    const hits =
      GetRelatedEvents<DamageEvent>(
        cast.event,
        SPLINTERED_ELEMENTS_LINK,
        (e) => e.type === EventType.Damage,
      )?.length ?? 0;
    const extraDetails = (
      <div>
        <ul>
          <li>
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> hit <strong>{hits}</strong> targets
          </li>
          <li>
            <SpellLink spell={TALENTS.SPLINTERED_ELEMENTS_TALENT} /> granted{' '}
            <strong>{formatPercentage(this.splinteredElements.getGainedHaste(hits))}%</strong>{' '}
            haste.
          </li>
        </ul>
      </div>
    );

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: getAveragePerf(checklistItems.map((c) => c.performance)),
      extraDetails: extraDetails,
    };
  }

  onPrimordialWaveCast(event: CastEvent) {
    if (this.primordialWaveCast) {
      addInefficientCastReason(
        this.primordialWaveCast.event,
        <>
          <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> was not cast!
        </>,
      );
      this.recordCooldown(this.primordialWaveCast);
    }
    this.primordialWaveCast = { event: event };
  }
}

export default PrimordialStorm;
