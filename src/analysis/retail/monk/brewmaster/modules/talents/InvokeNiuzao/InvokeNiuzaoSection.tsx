import { useAnalyzer, useInfo } from 'interface/guide';
import { JSX } from 'react';
import InvokeNiuzao from './InvokeNiuzao';
import SpellLink from 'interface/SpellLink';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';
import CooldownExpandable from 'interface/guide/components/CooldownExpandable';
import { formatDuration } from 'common/format';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { EventType } from 'parser/core/Events';

export default function InvokeNiuzaoSection(): JSX.Element | null {
  const invoke = useAnalyzer(InvokeNiuzao);
  const info = useInfo();

  if (!invoke || !info) {
    return null;
  }

  if (!invoke.active) {
    return null;
  }

  return (
    <ExplanationAndDataSubSection
      title={<SpellLink spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />}
      explanation={
        <>
          <p>
            <SpellLink spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT}>Invoke Niuzao</SpellLink> is
            Brewmaster's major damage cooldown. Most of the direct damage from Niuzao comes from
            triggering <SpellLink spell={SPELLS_COMMON.NIUZAO_STOMP_DAMAGE} /> by casting{' '}
            <SpellLink spell={SPELLS.BLACKOUT_KICK} />.
          </p>
          {info.combatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT) ? (
            <p>
              <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT}>Shado-Pan</SpellLink> Brewmasters
              additionally trigger <SpellLink spell={SPELLS.FLURRY_STRIKES_TALENT} /> from{' '}
              <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT} /> while Niuzao is active.
            </p>
          ) : (
            <small>
              Note: the ability priority during Niuzao differs significantly between{' '}
              <SpellLink spell={SPELLS.FLURRY_STRIKES_TALENT}>Shado-Pan</SpellLink> and{' '}
              <SpellLink spell={SPELLS.ASPECT_OF_HARMONY_TALENT}>Master of Harmony</SpellLink>
            </small>
          )}
        </>
      }
      data={
        <div>
          {invoke.niuzaoCasts.map((cast) => (
            <CooldownExpandable
              key={cast.summonEvent.timestamp}
              header={
                <>
                  @ {formatDuration(cast.summonEvent.timestamp - info.originalFightStart)} -{' '}
                  <SpellLink spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT}>
                    Invoke Niuzao
                  </SpellLink>
                </>
              }
              range={{
                start: cast.summonEvent.timestamp,
                end: cast.deathEvent?.timestamp ?? info.fightEnd,
              }}
              timeline={{
                cooldowns: [
                  SPELLS.BLACKOUT_KICK,
                  SPELLS.BREATH_OF_FIRE_TALENT,
                  SPELLS.KEG_SMASH_TALENT,
                  SPELLS.BLACK_OX_BREW_TALENT,
                ],
              }}
              table={{
                type: EventType.Damage,
              }}
              checklistItems={invoke.checklist(cast)}
            />
          ))}
        </div>
      }
    />
  );
}
