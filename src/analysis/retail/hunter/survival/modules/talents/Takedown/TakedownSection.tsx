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

  const isPackLeader = takedown.isPackLeader;
  const hasTwinFangs = info.combatant.hasTalent(TALENTS.TWIN_FANGS_TALENT);
  const hasBoomstick = info.combatant.hasTalent(TALENTS.BOOMSTICK_TALENT);

  return (
    <SubSection title={<SpellLink spell={TALENTS.TAKEDOWN_TALENT} />}>
      <Explanation>
        <p>
          Always enter <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> with a{' '}
          <SpellLink spell={SPELLS.RAPTOR_SWIPE_BUFF} /> buff active.
          {isPackLeader && (
            <>
              {' '}
              Never cast <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> during the window.
            </>
          )}
        </p>
        {hasBoomstick && (
          <p>
            When <SpellLink spell={TALENTS.BOOMSTICK_TALENT} /> is available, weave it directly
            before Takedown: Prime Swipe if not active → Boomstick → Takedown.
          </p>
        )}
        {hasTwinFangs ? (
          <p>
            With <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, Takedown generates{' '}
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> stacks on its own. Spend one stack
            immediately to make room for the beast spawn: Swipe → Kill Command → Strike → Swipe →
            Strike → Kill Command → Swipe.
          </p>
        ) : (
          <p>
            Without <SpellLink spell={TALENTS.TWIN_FANGS_TALENT} />, ensure{' '}
            <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> is active when casting Takedown. If
            you have 0-1 stack after casting Takedown, you can Kill Command immediately, otherwise
            spend one stack on Raptor and then Kill Command to spawn the beast.
          </p>
        )}
      </Explanation>
      <CooldownGrid
        label={<SpellLink spell={TALENTS.TAKEDOWN_TALENT} />}
        timeline={{
          cooldowns: [
            TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
            TALENTS.WILDFIRE_BOMB_TALENT,
            TALENTS.BOOMSTICK_TALENT,
          ],
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
