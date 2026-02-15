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
import { formatPercentage } from 'common/format';

interface PrimordialStormCast extends CooldownTrigger<CastEvent> {
  details: {
    maelstromUsed: number;
    shouldHaveHadDoomwinds: boolean;
    hadDoomwinds: boolean;
    legacyOfTheFrostWitch: boolean;
    surgingElementsActive: boolean;
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
      legacyOfTheFrostWitch: this.selectedCombatant.hasBuff(
        SPELLS.LIGHTNING_STRIKES_BUFF,
        event.timestamp,
      ),
      maelstromUsed: this.resourceTracker.lastSpenderInfo?.amount ?? 0,
      surgingElementsActive: this.selectedCombatant.hasBuff(
        SPELLS.SURGING_ELEMENTS_BUFF,
        event.timestamp,
      ),
    };

    const lis: ReactNode[] = [];

    if (details.shouldHaveHadDoomwinds && !details.hadDoomwinds) {
      lis.push(
        <>
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> was missing.
        </>,
      );
    }

    if (!details.legacyOfTheFrostWitch) {
      lis.push(
        <>
          <SpellLink spell={SPELLS.LIGHTNING_STRIKES_BUFF} /> was missing.
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

  get guideSubsection() {
    return (
      <>
        <CooldownUsage
          analyzer={this}
          title={
            <>
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />
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
          <SpellLink spell={SPELLS.LIGHTNING_STRIKES_BUFF} />, and{' '}
          <SpellLink spell={SPELLS.PRIMORDIAL_FROST} /> is buffed twice.
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

    const maelstromUsed = details.maelstromUsed ?? 0;
    const lotfwActive = details.legacyOfTheFrostWitch ?? false;
    const hadDoomwinds = details.hadDoomwinds ?? false;
    const shouldHaveHadDoomwinds = details.shouldHaveHadDoomwinds ?? false;
    const surgingElementsActive = details.surgingElementsActive ?? false;

    const issues: ReactNode[] = [];
    const checklistItems: ChecklistUsageInfo[] = [];

    /**
     * Legacy of the Frost Witch (buff)
     */
    checklistItems.push({
      check: 'legacy-of-the-frost-witch',
      timestamp: cast.event.timestamp,
      performance: lotfwActive ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      summary: (
        <>
          <SpellLink spell={SPELLS.LIGHTNING_STRIKES_BUFF} /> {lotfwActive ? '' : 'not'}
          active.
        </>
      ),
      details: (
        <div>
          <SpellLink spell={SPELLS.LIGHTNING_STRIKES_BUFF} /> {lotfwActive ? '' : 'not'}
          active.
          {!lotfwActive && (
            <> This is a significant damage increase, aim to have it active for every cast.</>
          )}
        </div>
      ),
    });
    if (!lotfwActive) {
      issues.push(
        <>
          <li key="lotfw">
            <SpellLink spell={SPELLS.LIGHTNING_STRIKES_BUFF} /> should be active for every cast.
          </li>
        </>,
      );
    }

    /**
     * Maelstrom Used
     */
    checklistItems.push({
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
          <strong>{maelstromUsed}</strong> <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />
          used.
        </div>
      ),
    });
    if (maelstromUsed < 10) {
      issues.push(
        <>
          <li key="maelstrom-weapon">
            Aim to use <strong>10</strong> <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />
            each time you cast <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
          </li>
        </>,
      );
    }

    /**
     * Doom Winds
     */
    if (shouldHaveHadDoomwinds) {
      checklistItems.push({
        check: 'doom-winds',
        timestamp: cast.event.timestamp,
        performance: hadDoomwinds ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {hadDoomwinds ? '' : 'not'} active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> {hadDoomwinds ? '' : 'not'} active.
          </div>
        ),
      });

      if (!hadDoomwinds) {
        issues.push(
          <>
            <li key="doom-winds">
              <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> should be active for every second
              cast.
            </li>
          </>,
        );
      }
    }

    const extraDetails = (
      <div>
        <ul>
          <li>
            <SpellLink spell={SPELLS.SURGING_ELEMENTS_BUFF} />{' '}
            {surgingElementsActive ? 'granted' : 'did not grant'}{' '}
            <strong>{formatPercentage(0.15)}%</strong> haste.
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
      checklistItems,
      performance: getAveragePerf(checklistItems.map((c) => c.performance)),
      extraDetails,
    };
  }
}

export default PrimordialStorm;
