import { Section, useAnalyzer, useInfo } from 'interface/guide';
import { JSX } from 'react';
import BestialWrath from '../../../talents/BestialWrath';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import { EventType } from 'parser/core/Events';
import Explanation from 'interface/guide/components/Explanation';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';

const TIMELINE_LOOKBACK_MS = 3_000;

export default function BestialWrathSection(): JSX.Element | null {
  const bestialWrath = useAnalyzer(BestialWrath);
  const info = useInfo();

  if (!bestialWrath || !info) {
    return null;
  }

  if (!bestialWrath.active) {
    return null;
  }

  return (
    <Section title={<SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} />}>
      <Explanation>
        <p>
          <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is your primary damage cooldown.
          {bestialWrath.hasScentOfBlood && (
            <>
              {' '}
              Spend all <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> charges before casting it.
            </>
          )}
          {bestialWrath.isDarkRanger && (
            <>
              {' '}
              Always cast <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} /> during the window to
              benefit from the damage increase.
            </>
          )}
        </p>
      </Explanation>
      <CooldownGrid
        label={<SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} />}
        timeline={{
          cooldowns: [TALENTS.BARBED_SHOT_TALENT, TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT],
        }}
        table={{
          type: EventType.Damage,
        }}
        items={bestialWrath.bestialWrathCasts.map((cast) => {
          const { perf, checklist } = bestialWrath.checklist(cast);
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
    </Section>
  );
}
