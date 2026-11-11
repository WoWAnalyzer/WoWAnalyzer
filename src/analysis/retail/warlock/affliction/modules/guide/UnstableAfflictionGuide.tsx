import type { JSX } from 'react';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import UnstableAffliction from '../analyzers/UnstableAffliction';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TipBox } from 'interface/guide/components/TipBox';
import { BuffUptimeBar } from 'src/interface/guide/components';

interface Props {
  unstableAffliction: UnstableAffliction;
  fightStart: number;
  fightEnd: number;
}
function UnstableAfflictionGuide({ unstableAffliction, fightStart, fightEnd }: Props): JSX.Element {
  const explanation = (
    <>
      <p>
        <b>
          Keep <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> as much as possible.
        </b>
      </p>

      <p>
        Maintain <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> on the boss at all times. This DoT
        contributes significant damage and enables rotational synergies with{' '}
        <SpellLink spell={TALENTS_WARLOCK.CULL_THE_WEAK_TALENT} /> and other Affliction talents.
      </p>
    </>
  );

  const bosses = unstableAffliction.bossHistories;
  const bars = bosses.length ? (
    <div>
      {bosses.map(({ name, history }, idx) => (
        <div key={idx}>
          <strong>{name}</strong>
          <BuffUptimeBar
            spell={SPELLS.UNSTABLE_AFFLICTION}
            buffHistory={history}
            startTime={fightStart}
            endTime={fightEnd}
            maxStacks={unstableAffliction.maxObservedStacks(history)}
          />
        </div>
      ))}
    </div>
  ) : (
    <BuffUptimeBar
      spell={SPELLS.UNSTABLE_AFFLICTION}
      buffHistory={unstableAffliction.primaryTargetHistory}
      startTime={fightStart}
      endTime={fightEnd}
      maxStacks={unstableAffliction.maxObservedStacks(unstableAffliction.primaryTargetHistory)}
    />
  );

  return (
    <>
      <TipBox type="note">
        On cleave or AoE-heavy fights, <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} /> is a
        DPS gain over <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> at 2+ targets. Low UA uptime
        in those scenarios reflects correct play, not a mistake.
      </TipBox>
      {explanationAndDataSubsection(explanation, bars)}
    </>
  );
}

export default UnstableAfflictionGuide;
