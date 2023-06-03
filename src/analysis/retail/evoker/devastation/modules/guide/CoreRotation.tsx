import { GuideProps, Section } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from '../AplCheck';
import { ResourceLink, SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';

export function CoreRotation({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation (Experimental)">
      <p>
        The Devastation rotation is driven by a priority list. The priority list is primarily around
        using your important spells: <SpellLink id={SPELLS.FIRE_BREATH.id} />,{' '}
        <SpellLink id={SPELLS.ETERNITY_SURGE.id} /> and <SpellLink id={SPELLS.SHATTERING_STAR.id} />{' '}
        on CD and spending your <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> on
        <SpellLink id={SPELLS.DISINTEGRATE.id} /> for Single Target or{' '}
        <SpellLink id={TALENTS_EVOKER.PYRE_TALENT.id} /> for AoE.
      </p>

      <p>
        This Action Prioriy List (APL) is based off the Devastation APL found at{' '}
        <a href="https://github.com/WyrmrestTemple/df-devastation">WyrmrestTemple.</a>
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl()} />
      <hr />
      <p>
        As mentioned before use the accuracy here as a reference point to compare to other logs.
        It's not as precise as the raidbots APL because then there would be more steps here to
        explain and would be complex to follow. Some examples the accuracy misses out on are
        <ul>
          <li>boss mechanics that force you to move or change targets</li>
          <li>
            saving up <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> for{' '}
            <SpellLink id={SPELLS.SHATTERING_STAR.id} />
          </li>
          <li>dealing with unique edge cases for AoE (work in progress)</li>
        </ul>
      </p>
    </Section>
  );
}
