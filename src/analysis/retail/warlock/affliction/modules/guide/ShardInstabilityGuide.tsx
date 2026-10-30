import ShardInstability from '../analyzers/ShardInstability';
import { ReactNode } from 'react';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SpellLink from 'interface/SpellLink';
import { BuffUptimeBar } from 'interface/guide/components';
import { TipBox } from 'interface/guide/components';

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
      <p>
        <strong>{analyzer.totalProcs}</strong> procs gained,{' '}
        <strong>{analyzer.wastedOvercapStacks}</strong> overcapped,{' '}
        <strong>{analyzer.wastedExpiredStacks}</strong> expired.
      </p>
      <BuffUptimeBar
        spell={SPELLS.SHARD_INSTABILITY_BUFF}
        buffHistory={analyzer.buffHistory}
        startTime={fightStart}
        endTime={fightEnd}
        maxStacks={analyzer.maxObservedStacks}
      />
      <TipBox type="note">
        Uptime isn't a goal for <SpellLink spell={SPELLS.SHARD_INSTABILITY_BUFF} />. What matters is
        not wasting stacks, so a low uptime percentage is normal.
      </TipBox>
    </div>
  );

  return ExplanationAndDataSubSection({
    explanation,
    data,
  });
}
