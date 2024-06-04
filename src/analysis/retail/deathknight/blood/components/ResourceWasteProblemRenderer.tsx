import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { formatDuration } from 'common/format';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';
import { ProblemRendererProps } from 'interface/guide/components/ProblemList';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { AnyEvent, CastEvent, EventMeta, EventType } from 'parser/core/Events';
import { useMemo } from 'react';

interface WastedMeta extends EventMeta {
  _wastedRp: number;
}

export function ResourceWasteProblemRenderer({
  problem,
  events,
  info,
}: ProblemRendererProps<unknown>): JSX.Element {
  const isApplicable = useMemo(() => isApplicableEvent(info.playerId), [info.playerId]);
  const annotatedEvents = useMemo(() => {
    const result: AnyEvent[] = [];
    let lastCast: CastEvent | undefined = undefined;
    for (const event of events) {
      if (
        event.type === EventType.ResourceChange &&
        event.ability.guid !== SPELLS.RUNIC_ATTENUATION_RP_GAIN.id &&
        event.resourceChangeType === RESOURCE_TYPES.RUNIC_POWER.id &&
        event.waste > 0 &&
        lastCast !== undefined &&
        spellCanGenerateRP(lastCast.ability.guid)
      ) {
        // ugly casting to add fields to the meta
        if (!(lastCast?.meta as WastedMeta)?._wastedRp) {
          const meta: WastedMeta = {
            _wastedRp: event.waste,
            isInefficientCast: true,
            get inefficientCastReason() {
              return <>This cast wasted {this._wastedRp} RP.</>;
            },
          };
          // TODO: Come up with a better way of handling this so that it doesn't break any existing meta
          // eslint-disable-next-line wowanalyzer/event-meta-inefficient-cast
          lastCast.meta = meta;
        } else {
          const meta = lastCast.meta as WastedMeta;
          meta._wastedRp += event.waste;
        }
      }

      if (isApplicable(event)) {
        const newEvent = { ...event, meta: undefined };
        result.push(newEvent);
        if (newEvent.type === EventType.Cast) {
          lastCast = newEvent;
        }
      } else if (
        event.type === EventType.ResourceChange &&
        event.ability.guid === SPELLS.RUNIC_ATTENUATION_RP_GAIN.id
      ) {
        // eslint thinks that we can just use const x: Y here but we have to use `as Y` anyway for TS
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const newEvent: CastEvent = {
          ...event,
          type: EventType.Cast,
          meta: {
            isInefficientCast: event.waste > 0,
            inefficientCastReason:
              event.waste > 0 ? <>This proc wasted {event.waste} RP.</> : undefined,
          },
        } as CastEvent;
        result.push(newEvent);
      }
    }

    return result;
  }, [isApplicable, events]);

  // TODO technically ought to check if you have this talent...but you basically can't skip it right now
  const deathStrikeCost = talents.DEATH_STRIKE_TALENT.runicPowerCost - 5;
  const ossuaryCost = deathStrikeCost - 5;

  const extraCasts = Math.floor((problem.severity ?? 0) / ossuaryCost);

  return (
    <Container>
      <div>
        From {formatDuration(problem.range.start - info.fightStart)} to{' '}
        {formatDuration(problem.range.end - info.fightStart)}, you wasted{' '}
        <strong>{problem.severity}</strong> <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />,
        equivalent to <strong>{((problem.severity ?? 0) / deathStrikeCost).toFixed(1)}</strong>{' '}
        casts of <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> without any buffs.
      </div>
      <EmbeddedTimelineContainer secondWidth={60} secondsShown={9} style={{ alignSelf: 'center' }}>
        <SpellTimeline>
          <Casts
            start={info.fightStart}
            windowStart={problem.range.start}
            movement={undefined}
            secondWidth={60}
            events={annotatedEvents}
          />
        </SpellTimeline>
      </EmbeddedTimelineContainer>
      {(problem.severity ?? 0) >= ossuaryCost && (
        <div>
          With <SpellLink spell={talents.OSSUARY_TALENT} />, you would be able to cast{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} />{' '}
          <strong>
            {extraCasts} additional time{extraCasts === 1 ? '' : 's'}
          </strong>{' '}
          and end this sequence with the same amount of{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />.
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

function spellCanGenerateRP(id: number): boolean {
  const spell = maybeGetTalentOrSpell(id);
  return spell?.runicPowerCost !== undefined;
}
