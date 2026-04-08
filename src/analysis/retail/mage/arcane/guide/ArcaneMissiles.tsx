import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatDurationMillisMinSec } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';

import ArcaneMissiles, { ArcaneMissilesData } from '../analyzers/ArcaneMissiles';
import { TipBox } from 'interface/guide/components';

const MISSILE_EARLY_CLIP_DELAY = 200;

class ArcaneMissilesGuide extends Analyzer {
  static dependencies = {
    arcaneMissiles: ArcaneMissiles,
  };

  protected arcaneMissiles!: ArcaneMissiles;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);
  hasOrbMastery: boolean = this.selectedCombatant.hasTalent(TALENTS.ORB_MASTERY_TALENT);
  isSpellslingerMissile: boolean = this.isSpellslinger && !this.hasOrbMastery;
  isSpellslingerOrb: boolean = this.isSpellslinger && this.hasOrbMastery;
  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);
  hasHighVoltage: boolean = this.selectedCombatant.hasTalent(TALENTS.HIGH_VOLTAGE_TALENT);
  hasOverpoweredMissiles: boolean = this.selectedCombatant.hasTalent(
    TALENTS.OVERPOWERED_MISSILES_TALENT,
  );

  private evaluateMissilesCast(am: ArcaneMissilesData): CastEvaluation {
    const clippedBeforeGCD =
      am.channelEnd && am.gcdEnd && am.gcdEnd - am.channelEnd > MISSILE_EARLY_CLIP_DELAY;

    // TALENT CONFLICTS
    // The return has dummy values as these will never actually be used
    if (
      (this.isSpellslingerOrb && this.hasOverpoweredMissiles) ||
      (this.isSpellslingerOrb && this.hasHighVoltage)
    ) {
      return {
        timestamp: 0,
        performance: QualitativePerformance.Fail,
        reason: '',
      };
    }

    // FAIL CONDITIONS
    if (clippedBeforeGCD) {
      return {
        performance: QualitativePerformance.Fail,
        reason: 'Arcane Missiles Clipped during GCD',
        timestamp: am.cast.timestamp,
      };
    }

    if (this.isSpellslingerMissile && am.opMissiles && am.salvoStacks > 10) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `You had Overpowered Missiles and ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslingerMissile && !am.opMissiles && am.salvoStacks > 15) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `You didn't have Overpowered Missiles and had ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslingerMissile && this.hasHighVoltage && am.arcaneCharges >= 2) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `You had ${am.arcaneCharges} Arcane Charges with High Voltage talented.`,
      };
    }

    if (this.isSunfury && !am.clearcastingProcs) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `You did not have Clearcasting`,
      };
    }

    // PERFECT CONDITIONS
    if (this.isSunfury && am.arcaneSoul && am.salvoStacks <= 20) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had Clearcasting, Arcane Soul, and had ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSunfury && am.salvoStacks <= 15) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had Clearcasting and ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    // GOOD CONDITIONS
    if (this.isSpellslingerMissile && am.opMissiles && am.salvoStacks <= 10) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had Overpowered Missiles and ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslingerMissile && !am.opMissiles && am.salvoStacks <= 15) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Didn't have Overpowered Missiles and had ${am.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslingerMissile && this.hasHighVoltage && am.arcaneCharges < 2) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Has High Voltage talented and has ${am.arcaneCharges} Arcane Charges`,
      };
    }

    if (this.isSunfury && am.clearcastingProcs) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had Clearcasting`,
      };
    }

    // OK CONDITIONS
    if (this.isSpellslingerOrb) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `We did not actually check any conditions. You realistically should not be casting Arcane Missiles so we are just defaulting to "Ok" for all Arcane Missiles casts.`,
      };
    }

    // DEFAULT
    return {
      performance: QualitativePerformance.Ok,
      reason: am.channelEndDelay
        ? `Standard usage - ${formatDurationMillisMinSec(am.channelEndDelay, 3)} delay to next cast`
        : 'Standard Arcane Missiles usage',
      timestamp: am.cast.timestamp,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const highVoltage = <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} />;
    const overpoweredMissiles = <SpellLink spell={TALENTS.OVERPOWERED_MISSILES_TALENT} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const orbMastery = <SpellLink spell={TALENTS.ORB_MASTERY_TALENT} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const arcaneOrb = <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneMissiles}</b> is a channelled rotational ability that generates {arcaneSalvo}{' '}
          stacks and also spends your {clearcasting} procs. Your use of {arcaneMissiles} will vary
          depending on your talent build, so you should refer to the below information to determine
          when/if you should cast {arcaneMissiles} depening on your current talent build.
        </p>
        {this.isSpellslingerMissile && (
          <p>
            Cast {arcaneMissiles} if one of the below are true:
            <ul>
              <li>
                You have an {overpoweredMissiles} proc and &lt; 10 {arcaneSalvo} stacks.
              </li>
              <li>
                You don't have an {overpoweredMissiles} proc and have &lt; 15 {arcaneSalvo} stacks.
              </li>
              <li>
                You have &lt; 2 {arcaneCharge}s and have {highVoltage} talented
              </li>
            </ul>
          </p>
        )}
        {(this.isSpellslingerOrb && this.hasOverpoweredMissiles && (
          <>
            <TipBox type="warning" title="Talent Build Conflict">
              You currently have both {orbMastery} and {overpoweredMissiles} talented. These two
              talents represent two different playstyles with different rotations, so taking both of
              them creeates conflict within your rotation. It is highly recommended to either choose
              the Spellslinger Missiles build with {overpoweredMissiles} or the Spellslinger Orb
              build with {orbMastery}.
            </TipBox>
          </>
        )) ||
          (this.isSpellslingerOrb && this.hasHighVoltage && (
            <>
              <TipBox type="warning" title="Talent Build Conflict">
                You currently have both {orbMastery} and {highVoltage} talented. These two talents
                represent two different playstyles with different rotations, so taking both of them
                creeates conflict within your rotation. It is highly recommended to either choose
                the Spellslinger Missiles build with {overpoweredMissiles} and {highVoltage} or the
                Spellslinger Orb build with {orbMastery}.
              </TipBox>
            </>
          )) ||
          (this.isSpellslingerOrb && (
            <p>
              true Only cast {arcaneMissiles} if all of the below are true. Realistically you should
              never cast {arcaneMissiles} if you are using the Spellslinger Orb build, so we arent
              actually going to check these conditions to see if you met them or not, and will just
              mark every cast as OK.
              <ul>
                <li>
                  You have {highVoltage} talented or {clearcasting}.
                </li>
                <li>You have 15 or less {arcaneSalvo} stacks.</li>
                <li>Your previous cast was not {arcaneOrb}</li>
                <li>{arcaneSurge} is not active</li>
                <li>There is only one target.</li>
              </ul>
            </p>
          ))}
        {this.isSunfury && (
          <p>
            You should generally cast {arcaneMissiles} whenever you have {clearcasting}, but should
            prioritize {arcaneMissiles} if the below is true:
            <ul>
              <li>
                You have {clearcasting} and {arcaneSurge} is about to end.
              </li>
              <li>
                You have {clearcasting} and {arcaneSoul} and are not capped on {arcaneSalvo} (this
                is to help make your {arcaneBarrage} deal more damage when you spend your{' '}
                {arcaneSoul}).
              </li>
              <li>You have &lt; 15 {arcaneSalvo} stacks.</li>
            </ul>
          </p>
        )}
      </>
    );

    if (this.arcaneMissiles.missileData.length === 0) {
      return (
        <GuideSection
          spell={TALENTS.ARCANE_MISSILES_TALENT}
          explanation={explanation}
          title="Arcane Missiles"
        >
          <TipBox type="note" title="No Casts Found">
            No {arcaneMissiles} casts were detected.
          </TipBox>
        </GuideSection>
      );
    }

    if (
      (this.isSpellslingerOrb && this.hasHighVoltage) ||
      (this.isSpellslingerOrb && this.hasOverpoweredMissiles)
    ) {
      return (
        <GuideSection
          spell={TALENTS.ARCANE_MISSILES_TALENT}
          explanation={explanation}
          title="Arcane Missiles"
        >
          <TipBox type="warning" title="Talent Conflict Detected">
            We are unable to evaluate your {arcaneMissiles} casts due to a talent conflict.
          </TipBox>
        </GuideSection>
      );
    }

    const overviewStats = [
      {
        value: formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3),
        label: 'Avg Channel End Delay ',
        tooltip: (
          <>
            {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3)} Average Delay
            from End Channel to Next Cast.
          </>
        ),
        performance: this.arcaneMissiles.channelDelayUtil(this.arcaneMissiles.averageChannelDelay),
      },
    ];

    const perCastData: PerCastData[] = this.arcaneMissiles.missileData.map((cast) => {
      const evaluation = this.evaluateMissilesCast(cast);

      return {
        performance: evaluation.performance,
        timestamp: this.owner.formatTimestamp(cast.cast.timestamp),
        details: evaluation.reason,
        stats: [
          {
            value: cast.arcaneCharges,
            label: 'Arcane Charges',
            tooltip: <>The number of Arcane Charges at the time of cast.</>,
          },
          {
            value: cast.salvoStacks,
            label: 'Arcane Salvo Stacks',
            tooltip: <>The number of Arcane Salvo stacks at the time of cast.</>,
          },
          {
            value: cast.clearcastingProcs > 0 ? 'Yes' : 'No',
            label: 'Had Clearcasting',
            tooltip: <>Whether the player had a Clearcasting proc or not.</>,
          },
          {
            value: cast.opMissiles ? 'Yes' : 'No',
            label: 'Had Overpowered Missiles',
            tooltip: <>Whether the player had an Overpowered Missiles proc or not.</>,
          },
          cast.channelEndDelay !== undefined
            ? {
                value: formatDurationMillisMinSec(cast.channelEndDelay, 3),
                label: 'Channel End Delay',
                tooltip: <>Time between channel end and next cast.</>,
                performance: this.arcaneMissiles.channelDelayUtil(cast.channelEndDelay),
              }
            : undefined,
          this.isSunfury
            ? {
                value: cast.arcaneSoul ? 'Yes' : 'No',
                label: 'Arcane Soul',
                tooltip: <>Whether Arcane Soul was active during this cast.</>,
              }
            : undefined,
        ].filter(Boolean) as PerCastStat[],
      };
    });

    return (
      <GuideSection spell={TALENTS.ARCANE_MISSILES_TALENT} explanation={explanation}>
        <CastOverview spell={TALENTS.ARCANE_MISSILES_TALENT} stats={overviewStats} />
        <CastDetail title="Arcane Missiles Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default ArcaneMissilesGuide;
