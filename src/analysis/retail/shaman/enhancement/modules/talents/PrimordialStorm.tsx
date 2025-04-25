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
  elementalSpiritsActive: boolean;
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
  doomWindsAlternater = false;
  hasWitchDoctorsAncestry = false;
  hasElementalSpirits = false;

  constructor(options: Options) {
    super({ spell: TALENTS.PRIMORDIAL_WAVE_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT);
    if (!this.active) {
      return;
    }

    this.hasWitchDoctorsAncestry = this.selectedCombatant.hasTalent(
      TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT,
    );
    this.hasElementalSpirits = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_SPIRITS_TALENT);

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
          {pstorm} is currently the <strong>strongest</strong> {msw} spender, and you should always
          aim to cast it with 10 unless waiting would mean losing the cast. The {msw} spent
          double-dips and also increases the damage of the follow-up{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} />/
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> that is automatically cast.
        </p>
      </>
    );
  }

  explainPerformance(cast: PrimordialWaveCast): SpellUse {
    if (cast.primordialStormDetails === undefined) {
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
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> is a significant DPS cooldown.
              You should always ensure to cast it after every{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />.
            </div>
          </>
        ),
      };
    }

    const details = cast.primordialStormDetails;

    const maelstromUsed = details.maelstromUsed ?? 0;
    const lotfwActive = details.legacyOfTheFrostWitch ?? false;
    const hadDoomwinds = details.hadDoomwinds ?? false;
    const shouldHaveHadDoomwinds = details.shouldHaveHadDoomwinds ?? false;

    const issues: ReactNode[] = [];
    const checklistItems: ChecklistUsageInfo[] = [];

    /**
     * Legacy of the Frost Witch
     */
    checklistItems.push({
      check: 'legacy-of-the-frost-witch',
      timestamp: cast.event.timestamp,
      performance: lotfwActive ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      summary: (
        <>
          <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> {lotfwActive ? '' : 'not'}{' '}
          active.
        </>
      ),
      details: (
        <div>
          <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> {lotfwActive ? '' : 'not'}{' '}
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
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> should be active for
            every cast.
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
          <strong>{maelstromUsed}</strong> <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />{' '}
          used.
        </div>
      ),
    });
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
              cast. If the previous cast didn't have <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />{' '}
              active, this one should have.
            </li>
          </>,
        );
      }
    }

    /**
     * Primordial Wave / Elemental Spirits check
     */
    if (this.hasElementalSpirits) {
      checklistItems.push({
        check: 'pwave',
        timestamp: cast.event.timestamp,
        performance: cast.elementalSpiritsActive
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Ok,
        summary: (
          <>
            <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />{' '}
            {cast.elementalSpiritsActive ? 'active' : 'missing'} for
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> was{' '}
            {cast.elementalSpiritsActive ? '' : 'not'} buffed by{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />.
          </div>
        ),
      });
    }

    /**
     * Primordial Storm / Feral Spirit check
     */
    if (this.hasWitchDoctorsAncestry) {
      // Separate checklist item for Primordial Storm
      checklistItems.push({
        check: 'pstorm',
        timestamp: cast.event.timestamp,
        performance: details.feralSpiritActive
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            {this.hasElementalSpirits ? (
              <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />
            ) : (
              <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} />
            )}{' '}
            {details.feralSpiritActive ? 'active' : 'missing'} for
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> was{' '}
            {details.feralSpiritActive ? '' : 'not'} buffed by{' '}
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} />.
          </div>
        ),
      });
    }

    if (this.hasElementalSpirits) {
      if (!(details.feralSpiritActive && cast.elementalSpiritsActive)) {
        issues.push(
          <>
            <li key="pstorm">
              With <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> talented, you should aim
              to have them active for <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />.
            </li>
          </>,
        );
      }
    } else if (this.hasWitchDoctorsAncestry) {
      if (!details.feralSpiritActive) {
        issues.push(
          <>
            <li key="pstorm">
              With <SpellLink spell={TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT} />, the cooldown of{' '}
              <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} /> is approximately 30 seconds and
              should be synchronized with every cast of{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
            </li>
          </>,
        );
      }
    }

    const extraDetails = (
      <div>
        <ul>
          <li>
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} /> hit <strong>{cast.hits}</strong>{' '}
            target
            {cast.hits > 1 ? 's' : ''}.
          </li>
          <li>
            <SpellLink spell={TALENTS.SPLINTERED_ELEMENTS_TALENT} /> granted{' '}
            <strong>{formatPercentage(this.splinteredElements.getGainedHaste(cast.hits))}%</strong>{' '}
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
      elementalSpiritsActive:
        this.hasElementalSpirits &&
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
