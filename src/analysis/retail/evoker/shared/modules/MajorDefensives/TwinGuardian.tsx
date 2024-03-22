import {
  MajorDefensiveBuff,
  Mitigation,
  MitigationRow,
  MitigationRowContainer,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { AbsorbedEvent, ApplyBuffEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { PerformanceUsageRow } from 'parser/core/SpellUsage/core';
import { PerformanceMark } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { MitigationSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';
import Statistic from 'parser/ui/Statistic';
import BoringValue from 'parser/ui/BoringValueText';
import { formatNumber } from 'common/format';
import { getTwinGuardianPartner } from '../normalizers/DefensiveCastLinkNormalizer';

/**
 * Twin Guardian is a talent that is tied to Rescue.
 * When you use Rescue it will apply an absorb shield to both players for 30% of the Evokers current HP.
 *
 * Due to how MajorDefensive work, to make it function properly with Twin Guardian we make a few
 * custom overrides.
 * In essence the crux of the problem is that we are given both a personal and an external buff.
 * Whilst MajorDef module expects just one buff, and will count both buffs as their own usage.
 *
 * The solution implemented is to split up the buffs, giving all the relevant data to the "main" one.
 * Afterwards we can always refer to our external buff to do some of the necessary analysis.
 */
class TwinGuardian extends MajorDefensiveBuff {
  personalMitigationsData: Mitigation[] = [];
  externalMitigationsData: Mitigation[] = [];
  maxValueAbsorb = 0;

  constructor(options: Options) {
    super(TALENTS.RESCUE_TALENT, buff(SPELLS.TWIN_GUARDIAN_SHIELD), options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.TWIN_GUARDIAN_TALENT);

    this.addEventListener(Events.absorbed.spell(SPELLS.TWIN_GUARDIAN_SHIELD), this.recordDamage);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.TWIN_GUARDIAN_SHIELD),
      this.updateMaxAbsorb,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private recordDamage(event: AbsorbedEvent) {
    // We could potentially have a TG shield from another player, ignore those
    if (event.sourceID !== this.selectedCombatant.id) {
      return;
    }

    // Absorb events have the damage ability as the extraAbility
    this.recordMitigation({
      event: { ...event, ability: event.extraAbility },
      mitigatedAmount: event.amount,
    });
  }

  // Max absorb could only ever be the size of the shield
  private updateMaxAbsorb(event: ApplyBuffEvent) {
    if (!event.absorb || event.sourceID !== this.selectedCombatant.id) {
      return;
    }
    this.setMaxMitigation(event, event.absorb);
  }

  /** Create our own data
   *
   * Splits personal and external buffs up, to their own individual mitigations.
   * Merges the external information into the personal mitigation.
   */
  private onFightEnd() {
    this.personalMitigationsData = this.mitigations.filter(
      (mit) => mit.start.targetID === this.selectedCombatant.id,
    );
    this.externalMitigationsData = this.mitigations.filter(
      (mit) => mit.start.targetID !== this.selectedCombatant.id,
    );

    // Merge the relevant external data into the personal data
    this.personalMitigationsData.forEach((pMit) => {
      const eMit = this.getExternalMitigation(pMit);

      if (!eMit) {
        return;
      }

      pMit.amount += eMit.amount;
      pMit.mitigated = [...pMit.mitigated, ...eMit.mitigated];

      this.maxValueAbsorb = Math.max(this.maxValueAbsorb, pMit.amount);
    });
  }

  /** Returns original mitigationData until we have made our own.
   * Overridden such that AllCoolDownUsageList/Timeline will use our data (personalMitigationsData). */
  get mitigations(): Mitigation[] {
    if (this.personalMitigationsData.length && this.externalMitigationsData.length) {
      return this.personalMitigationsData;
    } else {
      return super.mitigations;
    }
  }

  /** Returns Partners Absorb data.*/
  private getExternalMitigation(mit: Mitigation): Mitigation | undefined {
    /** We could use externalMitigationsData[idx] to find it,
     * but potentially it could be missing and leave us with a "gap" in the array,
     * so we should ensure that we actually grab the relevant mitigation, such
     * that we don't accidentally analyze two different usages */
    return this.externalMitigationsData.find(
      (buff) => getTwinGuardianPartner(buff.start) === mit.start,
    );
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const eMit = this.getExternalMitigation(mit);

    return [
      {
        amount: mit.amount - (eMit?.amount ?? 0),
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: <>Personal shield</>,
      },
      {
        amount: eMit?.amount ?? 0,
        color: color(MAGIC_SCHOOLS.ids.NATURE),
        description: <>External shield</>,
      },
    ];
  }

  /**
   * We override this to compare Absorbed amount against the shield size
   * Basically:
   * Full absorb = perfect
   * less than 50% absorbed = okay
   * otherwise good
   */
  explainPerformance(mit: Mitigation): {
    perf: QualitativePerformance;
    explanation?: ReactNode;
  } {
    const eMit = this.getExternalMitigation(mit);

    if ((mit.maxAmount ?? this.firstSeenMaxHp) + (eMit?.maxAmount ?? 0) === mit.amount) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: 'Usage used the full absorb amount',
      };
    }

    if (((mit.maxAmount ?? this.firstSeenMaxHp) + (eMit?.maxAmount ?? 0)) / 2 > mit.amount) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: 'Usage used less than 50% of the full absorb amount',
      };
    }

    return { perf: QualitativePerformance.Good };
  }
  /**
   * We override this to override the maxValue
   * Due to maxValue being based on the highest mitigation
   * Seen between *all* analyzers.
   * Since TG has a decently low cap, this doesn't really make sense
   * So we'll base the maxValue on the biggest absorb shield seen for TG only.
   */

  mitigationPerformance(maxValue: number): BoxRowEntry[] {
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
                maxValue={this.maxValueAbsorb}
                key={mit.start.timestamp}
              />
            </div>
          </>
        ),
      };
    });
  }

  maxMitigationDescription(): ReactNode {
    return <>Shield Size</>;
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS.TWIN_GUARDIAN_TALENT} /> provides you, and your{' '}
        <SpellLink spell={TALENTS.RESCUE_TALENT} /> target with an absorb shield, equal to 30% of
        your current max HP.
        <br />
        Since <SpellLink spell={TALENTS.RESCUE_TALENT} /> is often used for dealing with mechanics,
        it is expected for some of its uses to not provide much absorption value.
      </p>
    );
  }

  statistic(): ReactNode {
    const mitigationsData = this.mitigations;
    const tooltip = (
      <div>
        External absorb is shown in green.
        <MitigationRowContainer>
          <strong>Time</strong>
          <strong>Mit.</strong>
        </MitigationRowContainer>
        {mitigationsData.map((mit) => {
          return (
            <MitigationRow
              mitigation={mit}
              segments={this.mitigationSegments(mit)}
              fightStart={this.owner.fight.start_time}
              maxValue={this.maxValueAbsorb}
              key={mit.start.timestamp}
            />
          );
        })}
      </div>
    );
    return (
      <Statistic
        size="flexible"
        tooltip={mitigationsData.length > 0 ? tooltip : undefined}
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={TALENTS.TWIN_GUARDIAN_TALENT} /> Damage Mitigated
            </>
          }
        >
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(
            mitigationsData
              .flatMap((mit) => mit.mitigated.map((event) => event.mitigatedAmount))
              .reduce((a, b) => a + b, 0),
          )}
        </BoringValue>
      </Statistic>
    );
  }
}

export default TwinGuardian;
