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
  hasOverpoweredMissiles: boolean = this.selectedCombatant.hasTalent(
    TALENTS.OVERPOWERED_MISSILES_TALENT,
  );

  private evaluateMissilesCast(am: ArcaneMissilesData): CastEvaluation {
    const clippedBeforeGCD =
      am.channelEnd && am.gcdEnd && am.gcdEnd - am.channelEnd > MISSILE_EARLY_CLIP_DELAY;

    // FAIL CONDITIONS
    if (clippedBeforeGCD) {
      return {
        performance: QualitativePerformance.Fail,
        reason: 'Arcane Missiles Clipped during GCD',
        timestamp: am.cast.timestamp,
      };
    }

    // PERFECT CONDITIONS
    if (this.isSpellslinger && am.salvoStacks < 15 && !am.opMissiles && am.clipped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `You clipped your channel properly, had ${am.salvoStacks} Arcane Salvo stacks, and ${am.clearcastingProcs} Clearcasting procs.`,
      };
    }

    // GOOD CONDITIONS
    if (this.isSpellslinger && am.salvoStacks < 15) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `You had ${am.salvoStacks} Arcane Salvo stacks and ${am.clearcastingProcs} Clearcasting procs.`,
      };
    }

    if (this.isSunfury && am.salvoStacks < 12) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `You had ${am.salvoStacks} Arcane Salvo stacks and ${am.clearcastingProcs} Clearcasting procs.`,
      };
    }

    // OK CONDITIONS
    if (this.isSpellslinger && am.salvoStacks >= 15) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `You had ${am.salvoStacks} Arcane Salvo stacks and ${am.clearcastingProcs} Clearcasting procs.`,
      };
    }

    if (this.isSunfury && am.salvoStacks >= 12) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `You had ${am.salvoStacks} Arcane Salvo stacks and ${am.clearcastingProcs} Clearcasting procs.`,
      };
    }

    if (am.clearcastingCapped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `You were capped on Clearcasting procs.`,
      };
    }

    // DEFAULT FAIL
    return {
      timestamp: am.cast.timestamp,
      performance: QualitativePerformance.Fail,
      reason: `Performance Condition Unknown. Please report this!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const overpoweredMissiles = <SpellLink spell={TALENTS.OVERPOWERED_MISSILES_TALENT} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneMissiles}</b> is a channelled rotational ability that generates {arcaneSalvo}{' '}
          stacks and also spends your {clearcasting} procs. In order to maximize your {arcaneCharge}{' '}
          and {arcaneSalvo} generation, use the below to determine when to use {arcaneMissiles}.
        </p>
        {this.isSpellslinger && (
          <ul>
            <li>
              You have less than 15 {arcaneSalvo} stacks and a {clearcasting} proc.
            </li>
          </ul>
        )}
        {this.isSunfury && (
          <ul>
            <li>
              You have less than 12 {arcaneSalvo} stacks and a {clearcasting} proc.
            </li>
            <li></li>
          </ul>
        )}
        {this.isSpellslinger && this.hasOverpoweredMissiles && (
          <>
            <TipBox type="note" title="Missile Clipping">
              If you don't have an {overpoweredMissiles} proc, you should clip your {arcaneMissiles}{' '}
              channel once the {arcaneMissiles} GCD ends.
            </TipBox>
          </>
        )}
        {this.isSunfury && (
          <>
            <TipBox type="note" title="Missile Chaining">
              If you are casting {arcaneMissiles} back to back, you can attempt to cast{' '}
              {arcaneMissiles} just before the last tick of the previous cast. This will chain into
              the second channel and will still result in the same number of missile waves.
            </TipBox>
          </>
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
            value: cast.salvoStacks,
            label: 'Arcane Salvo Stacks',
            tooltip: <>The number of Arcane Salvo stacks at the time of cast.</>,
          },
          {
            value: cast.clearcastingProcs,
            label: 'Clearcasting Procs',
            tooltip: <>The number of Clearcasting procs the player had.</>,
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
