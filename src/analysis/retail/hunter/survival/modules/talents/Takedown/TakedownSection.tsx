import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import { JSX } from 'react';
import Takedown from './Takedown';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS/hunter';
import { EventType } from 'parser/core/Events';
import Explanation from 'interface/guide/components/Explanation';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';

const TIMELINE_LOOKBACK_MS = 3_000;

export default function TakedownSection(): JSX.Element | null {
  const takedown = useAnalyzer(Takedown);
  const info = useInfo();

  if (!takedown || !info) {
    return null;
  }

  if (!takedown.active) {
    return null;
  }

  const hasTwinFangs = info.combatant.hasTalent(TALENTS.TWIN_FANGS_TALENT);

  return (
    <SubSection title={<SpellLink spell={TALENTS.TAKEDOWN_TALENT} />}>
      <Explanation>
        <p>
          Always enter <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> with a{' '}
          <SpellLink spell={SPELLS.RAPTOR_SWIPE_BUFF} /> buff active.
        </p>

        {hasTwinFangs ? (
          <p>
            With <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown generates{' '}
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own. Aim to enter
            Takedown with 0 stacks to maximise effectiveness of Twin Fangs.
          </p>
        ) : (
          <p>
            Without <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown does not generate{' '}
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own. Use{' '}
            <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> before Takedown to maximise
            stacks during Takedown.
          </p>
        )}
        <p>
          The analysis below is done as if you are in a situation in which you can follow the APL.
          Some fights may dictate that you do not prime Swipe, or that you immediately Kill Command
          to spawn a beast such as the tight timings on Mythic Averzian. In these cases, the
          suggestions below may not be applicable.
        </p>
      </Explanation>
      <CooldownGrid
        label={<SpellLink spell={TALENTS.TAKEDOWN_TALENT} />}
        timeline={{
          cooldowns: [TALENTS.KILL_COMMAND_SURVIVAL_TALENT, TALENTS.WILDFIRE_BOMB_TALENT],
        }}
        table={{
          type: EventType.Damage,
        }}
        items={takedown.takedownCasts.map((cast) => {
          const { perf, checklist } = takedown.checklist(cast);
          return {
            perf,
            checklistItems: checklist,
            range: {
              start: cast.castEvent.timestamp - TIMELINE_LOOKBACK_MS,
              end: cast.windowEnd,
            },
          };
        })}
      />
    </SubSection>
  );
}
