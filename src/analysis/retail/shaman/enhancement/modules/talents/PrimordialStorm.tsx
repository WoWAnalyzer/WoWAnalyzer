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
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import SplinteredElements from './SplinteredElements';
import { formatPercentage } from 'common/format';

interface PrimordialWaveCast extends CooldownTrigger<CastEvent> {
  hits: number;
  feralSpiritActive: boolean;
  primordialStorm?: CastEvent;
  primordialStormDetails?: {
    maelstromUsed: number;
    shouldHaveHadDoomwinds: boolean;
    hadDoomwinds: boolean;
    legacyOfTheFrostWitch: boolean;
    feralSpiritActive: boolean;
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
  doomWindsAlternater: boolean = false;
  hasWitchDoctorsAncestry: boolean = false;

  constructor(options: Options) {
    super({ spell: TALENTS.PRIMORDIAL_WAVE_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT);
    if (!this.active) {
      return;
    }

    this.hasWitchDoctorsAncestry = this.selectedCombatant.hasTalent(
      TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRIMORDIAL_WAVE_TALENT),
      this.onPrimordialWaveCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_WAVE_DAMAGE),
      this.onPrimordialWaveDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_STORM_CAST),
      this.onPrimordialStormCast,
    );
  }
  onPrimordialStormCast(event: CastEvent) {
    if (this.primordialWaveCast) {
      this.doomWindsAlternater = !this.doomWindsAlternater;
      this.primordialWaveCast.primordialStorm = event;

      // If they have Doom Winds, we don't want to incorrectly flag it as missing
      if (this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF)) {
        this.doomWindsAlternater = true;
      }

      this.primordialWaveCast.primordialStormDetails = {
        shouldHaveHadDoomwinds: this.doomWindsAlternater,
        hadDoomwinds: this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF),
        legacyOfTheFrostWitch: this.selectedCombatant.hasBuff(
          SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF,
        ),
        maelstromUsed: this.resourceTracker.lastSpenderInfo!.amount,
        feralSpiritActive:
          this.hasWitchDoctorsAncestry &&
          this.selectedCombatant.hasBuff(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      };
      const details = this.primordialWaveCast.primordialStormDetails;
      const lis: ReactNode[] = [];
      if (
        details.shouldHaveHadDoomwinds &&
        !this.primordialWaveCast.primordialStormDetails!.hadDoomwinds
      ) {
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
      if (this.hasWitchDoctorsAncestry && !details.feralSpiritActive) {
        lis.push(
          <>
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} /> was not active.
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
    if (cast.primordialStormDetails === null || cast.primordialStormDetails === undefined) {
      return {
        event: cast.event,
        checklistItems: [
          {
            check: 'primordial-storm',
            timestamp: cast.event.timestamp,
            performance: QualitativePerformance.Fail,
            summary: (
              <>
                !!! <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> was not cast !!!
              </>
            ),
            details: (
              <>
                <div>
                  <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> was cast without casting{' '}
                  <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
                </div>
              </>
            ),
          },
        ],
        performance: QualitativePerformance.Fail,
        extraDetails: (
          <>
            <div>
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> is a significant DPS coooldown.
              You should always ensure to cast it after every{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />.
            </div>
          </>
        ),
      };
    }

    const maelstromUsed = cast.primordialStormDetails?.maelstromUsed ?? 0;
    const lotfwActive = cast.primordialStormDetails?.legacyOfTheFrostWitch ?? false;
    const hadDoomwinds = cast.primordialStormDetails?.hadDoomwinds ?? false;
    const shouldHaveHadDoomwinds = cast.primordialStormDetails?.shouldHaveHadDoomwinds ?? false;

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'legacy-of-the-frost-witch',
        timestamp: cast.event.timestamp,
        performance: lotfwActive ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} />{' '}
            {lotfwActive ? '' : 'not'} active.
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} />{' '}
            {lotfwActive ? '' : 'not'} active.
            {!lotfwActive && (
              <> This is a significant damage increase, aim to have it active for every cast.</>
            )}
          </div>
        ),
      },
      {
        check: 'maelstrom-weapon',
        timestamp: cast.event.timestamp,
        performance: evaluateQualitativePerformanceByThreshold({
          actual: maelstromUsed,
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
            <strong>{maelstromUsed}</strong> <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />{' '}
            used.
          </div>
        ),
      },
    ];

    if (shouldHaveHadDoomwinds) {
      checklistItems.push({
        check: 'doomwinds',
        timestamp: cast.event.timestamp,
        performance: hadDoomwinds ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {hadDoomwinds ? '' : 'not'} active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {hadDoomwinds ? '' : 'not'} active
          </div>
        ),
      });
    }

    // Add Witch Doctor's Ancestry check if the talent is selected
    if (this.hasWitchDoctorsAncestry) {
      const feralSpiritState =
        cast.feralSpiritActive && (cast.primordialStormDetails?.feralSpiritActive ?? false)
          ? 2
          : cast.feralSpiritActive || (cast.primordialStormDetails?.feralSpiritActive ?? false)
            ? 1
            : 0;

      checklistItems.push({
        check: 'feral-spirit',
        timestamp: cast.event.timestamp,
        performance: evaluateQualitativePerformanceByThreshold({
          actual: feralSpiritState,
          isGreaterThanOrEqual: {
            perfect: 2,
            ok: 1,
          },
        }),
        summary: (
          <>
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} />{' '}
            {feralSpiritState === 1 && 'partially'} {feralSpiritState > 0 ? 'active' : 'missing'}
          </>
        ),
        details: (
          <div>
            {feralSpiritState === 2 && (
              <>
                <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> and{' '}
                <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />{' '}
              </>
            )}
            {!cast.feralSpiritActive && (
              <>
                <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />{' '}
              </>
            )}
            {feralSpiritState === 0 && 'and '}
            {!(cast.primordialStormDetails?.feralSpiritActive ?? false) && (
              <>
                <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />{' '}
              </>
            )}
            {feralSpiritState !== 1 ? 'were' : 'was '} {feralSpiritState !== 2 && 'not '} buffed by{' '}
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} />.
          </div>
        ),
      });
    }

    // splintered elements hit count and haste gained
    const hits = cast.hits;

    const issues: ReactNode[] = [];
    if (shouldHaveHadDoomwinds && !hadDoomwinds) {
      issues.push(
        <>
          <li key="doom-winds">
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> should be active for every second cast.
            If the previous cast didn't have <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> active,
            this one should have.
          </li>
        </>,
      );
    }
    if (maelstromUsed < 10) {
      issues.push(
        <>
          <li key="maelstrom-weapon">
            Aim to use <strong>10</strong> <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />{' '}
            each time you cast <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
          </li>
        </>,
      );
    }
    if (
      this.hasWitchDoctorsAncestry &&
      (!cast.feralSpiritActive || !(cast.primordialStormDetails?.feralSpiritActive ?? false))
    ) {
      issues.push(
        <>
          <li key="feral-spirit">
            With <SpellLink spell={TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT} />, you should aim to have{' '}
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} /> active for every cast of{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
          </li>
        </>,
      );
    }

    const extraDetails = (
      <div>
        <ul>
          <li>
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> hit <strong>{hits}</strong> target
            {hits > 1 ? 's' : ''}.
          </li>
          <li>
            <SpellLink spell={TALENTS.SPLINTERED_ELEMENTS_TALENT} /> granted{' '}
            <strong>{formatPercentage(this.splinteredElements.getGainedHaste(hits))}%</strong>{' '}
            haste.
          </li>
        </ul>
        {issues.length > 0 && (
          <>
            <br />
            <div>
              <strong>Issues</strong>
            </div>
            <ul>{issues}</ul>
          </>
        )}
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
    this.primordialWaveCast = {
      event: event,
      hits: 0,
      feralSpiritActive:
        this.hasWitchDoctorsAncestry &&
        this.selectedCombatant.hasBuff(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
    };
  }

  onPrimordialWaveDamage() {
    if (this.primordialWaveCast) {
      this.primordialWaveCast.hits += 1;
    }
  }
}

export default PrimordialStorm;
