import { type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import { TipBox } from 'interface/guide/components';

import PrismaticBolt, { PrismaticBoltCast } from '../analyzers/PrismaticBolt';
import { CastDetail, PerCastData, type PerCastStat } from 'interface/guide/components';
import { formatDurationMillisMinSec } from 'common/format';

class PrismaticBoltGuide extends Analyzer {
  static dependencies = {
    prismaticBolt: PrismaticBolt,
  };

  protected prismaticBolt!: PrismaticBolt;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);

  private evaluatePrismaticBolt(pb: PrismaticBoltCast): CastEvaluation {
    // FAIL CONDITIONS
    if (pb.munched) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Prismatic Bolt munched (overwritten).`,
      };
    }

    if (!pb.cast) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `No Prismatic Bolt cast found.`,
      };
    }

    if (pb.delay && pb.delay > 20000) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Prismatic Bolt delayed by ${formatDurationMillisMinSec(pb.delay)}`,
      };
    }

    // PERFECT CONDITIONS
    if (
      this.isSpellslinger &&
      pb.salvoStacks >= 13 &&
      (!pb.hasClearcasting || pb.cumulativePowerStacks >= 6 || !pb.has4pc)
    ) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had ${pb.salvoStacks} Arcane Salvo Stacks ${pb.hasClearcasting ? 'with Clearcasting' : 'without Clearcasting'} and ${pb.has4pc ? `and ${pb.cumulativePowerStacks} Cumulative Power stacks.` : 'no 4pc tier set bonus.'}`,
      };
    }

    if (this.isSunfury && pb.cumulativePowerStacks >= 8) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had ${pb.cumulativePowerStacks} Cumulative Power stacks.`,
      };
    }

    // GOOD CONDITIONS
    if (this.isSpellslinger && pb.targetsHit >= 2) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Hit ${pb.targetsHit} targets.`,
      };
    }

    if (this.isSunfury && !pb.has4pc) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Did not have 4pc tier set bonus.`,
      };
    }

    // OK CONDITIONS
    if (this.isSpellslinger && pb.salvoStacks < 13) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${pb.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (
      this.isSpellslinger &&
      pb.salvoStacks >= 13 &&
      pb.has4pc &&
      pb.hasClearcasting &&
      pb.cumulativePowerStacks < 6
    ) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${pb.salvoStacks} Arcane Salvo Stacks, had the 4pc set bonus, Clearcasting, and ${pb.cumulativePowerStacks} Cumulative Power stacks.`,
      };
    }

    if (this.isSpellslinger && pb.targetsHit < 2) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Hit ${pb.targetsHit} targets.`,
      };
    }

    if (this.isSunfury && pb.cumulativePowerStacks < 8) {
      return {
        timestamp: pb.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `had ${pb.cumulativePowerStacks} targets.`,
      };
    }

    // DEFAULT
    return {
      timestamp: pb.timestamp,
      performance: QualitativePerformance.Fail,
      reason: `Unknown performance condition. Please report this!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const prismaticBolt = <SpellLink spell={SPELLS.PRISMATIC_BOLT} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const cumulativePower = <SpellLink spell={SPELLS.CUMULATIVE_POWER_BUFF} />;

    const explanation = (
      <>
        <p>
          <b>{prismaticBolt}</b> is Arcane's new apex talent, added in 12.1, and is very strong. It
          is a large contributor to your DPS and it does not stack, so you should make sure you are
          spending it as quickly as possible while following the below guidelines to get the most
          out of each cast.
        </p>
        {this.isSpellslinger && (
          <p>
            You should cast {prismaticBolt} if it will hit 2 or more targets or if you have at least
            13 stacks of {arcaneSalvo} and one of the below are true:
            <ul>
              <li>You have 6 or more stacks of {cumulativePower}.</li>
              <li>You do not have {clearcasting}.</li>
              <li>You do not have your 4pc tier set bonus.</li>
            </ul>
          </p>
        )}
        {this.isSunfury && (
          <p>
            You should cast {prismaticBolt} if you have 8 or more stacks of {cumulativePower}. If
            you do not have your 4pc tier set bonus, you can just cast {prismaticBolt} as soon as
            you get the buff.
          </p>
        )}
      </>
    );

    if (this.prismaticBolt.prismaticBolts.length === 0) {
      return (
        <GuideSection
          spell={SPELLS.PRISMATIC_BOLT}
          explanation={explanation}
          title="Prismatic Bolt"
        >
          <TipBox type="note" title="No Casts Found">
            No {prismaticBolt} casts were detected.
          </TipBox>
        </GuideSection>
      );
    }

    const perCastData: PerCastData[] = this.prismaticBolt.prismaticBolts.map((cast, index) => {
      const evaluation = this.evaluatePrismaticBolt(cast);

      return {
        performance: evaluation.performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats: [
          cast.munched && {
            value: cast.munched ? 'Yes' : 'No',
            label: 'Munched Proc',
            tooltip: <>Whether the proc was munched (overwritten) or not.</>,
          },
          !cast.munched && {
            value: formatDurationMillisMinSec(cast.delay || 0, 1),
            label: 'Delay until Cast',
            tooltip: (
              <>
                The amount of time from when the player got the Prismatic Bolt buff until they cast
                Prismatic Bolt.
              </>
            ),
          },
          !cast.munched && {
            value: cast.salvoStacks,
            label: 'Arcane Salvo Stacks',
            tooltip: <>The number of Arcane Salvo stacks the player had.</>,
          },
          !cast.munched &&
            cast.has4pc && {
              value: cast.cumulativePowerStacks,
              label: 'Cumulative Power Stacks',
              tooltip: <>The number of Cumulative Power stacks the player had.</>,
            },
          !cast.munched && {
            value: cast.targetsHit,
            label: 'Targets Hit',
            tooltip: <>The number of targets hit by Prismatic Bolt.</>,
          },
        ].filter(Boolean) as PerCastStat[],
        details: evaluation.reason,
      };
    });

    return (
      <GuideSection spell={SPELLS.PRISMATIC_BOLT} explanation={explanation} title="Prismatic Bolt">
        <CastDetail title="Prismatic Bolt Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default PrismaticBoltGuide;
