import ShardInstability from '../analyzers/ShardInstability';
import { ReactNode } from 'react';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SpellLink from 'interface/SpellLink';
import { BuffUptimeBar } from 'interface/guide/components';
import {
  StatsRow,
  StatCard,
  StatCardDivider,
  StatCardLabel,
  StatCardValue,
} from 'interface/guide/components/GuideDataWrapper';

interface ShardInstabilityGuideProps {
  analyzer: ShardInstability;
  fightStart: number;
  fightEnd: number;
}

export function ShardInstabilityGuide({
  analyzer,
  fightStart,
  fightEnd,
}: ShardInstabilityGuideProps): ReactNode {
  if (!analyzer) return null;

  const explanation = (
    <>
      <p>
        Damage from <SpellLink spell={SPELLS.SHADOW_BOLT_AFFLI} />,{' '}
        <SpellLink spell={SPELLS.DRAIN_SOUL_DEBUFF} />, or{' '}
        <SpellLink spell={TALENTS.MALEFIC_GRASP_TALENT} /> can proc{' '}
        <SpellLink spell={SPELLS.SHARD_INSTABILITY_BUFF} />, which makes your next{' '}
        <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> or{' '}
        <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} /> free and instant. It stacks up to 3
        times and lasts 30 seconds.
      </p>
      <small>
        Spend procs before gaining what would be a 4th (which wastes a proc), and don't let them
        expire if you can help it.
      </small>
    </>
  );

  const data = (
    <div>
      <BuffUptimeBar
        spell={SPELLS.SHARD_INSTABILITY_BUFF}
        buffHistory={analyzer.buffHistory}
        startTime={fightStart}
        endTime={fightEnd}
        maxStacks={analyzer.maxObservedStacks}
        stats={
          <StatsRow>
            <StatCard color="#7e5da8">
              <StatCardValue>{analyzer.totalProcs}</StatCardValue>
              <StatCardDivider />
              <StatCardLabel>Procs</StatCardLabel>
            </StatCard>
            <StatCard color="#cd1bdf">
              <StatCardValue>{analyzer.wastedOvercapStacks}</StatCardValue>
              <StatCardDivider />
              <StatCardLabel>Overcapped</StatCardLabel>
            </StatCard>
            <StatCard color="#888">
              <StatCardValue>{analyzer.wastedExpiredStacks}</StatCardValue>
              <StatCardDivider />
              <StatCardLabel>Expired</StatCardLabel>
            </StatCard>
          </StatsRow>
        }
      />
    </div>
  );

  return ExplanationAndDataSubSection({
    explanation,
    data,
  });
}
