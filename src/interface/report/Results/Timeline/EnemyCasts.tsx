import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import { CastEvent, BeginCastEvent } from 'parser/core/Events';
import { Fragment, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Casts.scss';

type NpcInfo = {
  fights: Array<{
    id: number;
    name: string;
  }>;
  guid: number;
  icon: string;
  id: number;
  name: string;
  petOwner: string | null;
  subType: string;
  type: string;
};
type NpcCastEvent = CastEvent & {
  npc: NpcInfo;
  npcPet: NpcInfo;
  matchedCast?: any;
  friendlyTarget?: any;
};
type NpcBeginCastEvent = BeginCastEvent & {
  npc: NpcInfo;
  npcPet: NpcInfo;
  matchedCast?: any;
  friendlyTarget?: any;
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  start: number;
  windowStart?: number;
  secondWidth: number;
  events: NpcBeginCastEvent[] | NpcCastEvent[];
  reportCode: string;
  actorId: number;
  style?: CSSProperties & {
    '--level'?: number;
  };
}

const RenderIcon = (
  event: NpcCastEvent | NpcBeginCastEvent,
  {
    start,
    windowStart,
    secondWidth,
    className = '',
    style = {},
  }: {
    start: number;
    windowStart?: number | undefined;
    secondWidth: number;
    className?: string;
    style?: CSSProperties & { '--level'?: number };
  } = {
    secondWidth: 60,
    start: 0,
  },
) => {
  const getOffsetLeft = (timestamp: number) =>
    ((timestamp - (windowStart ?? start)) / 1000) * secondWidth;
  const left = getOffsetLeft(event.timestamp);
  const linkIcon = (children: ReactNode) => (
    <SpellLink
      spell={event.ability.guid}
      icon={false}
      className={`cast ${className} ${event.type === 'begincast' && !event.matchedCast ? 'failed-cast upper' : ''}`}
      style={{
        left,
        ...style,
      }}
    >
      {children}
    </SpellLink>
  );
  const spellIcon = (
    <>
      <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
      {!event.matchedCast && event.type === 'begincast' ? (
        <div className={`time-indicator ${className}`}></div>
      ) : (
        <></>
      )}
    </>
  );

  return (
    <Fragment
      // It's possible this complains about "encountered two children with the same key". This is probably caused by fabricating a channel event at a cast time. If you can fix it by removing one of the events that would be great, otherwise you may just have to ignore this as while it's showing a warning, deduplicting the icons is correct behavior.
      key={`cast-${left}-${event.ability.guid}`}
    >
      {linkIcon(spellIcon)}
      {event.matchedCast ? (
        <>
          <div
            className={`channel ${className}`}
            style={{
              left,
              width: ((event.matchedCast.timestamp - event.timestamp) / 1000) * secondWidth,
            }}
          />
        </>
      ) : (
        <></>
      )}
    </Fragment>
  );
};

const EnemyCasts = ({
  start,
  windowStart,
  secondWidth,
  events,
  reportCode,
  actorId,
  ...others
}: Props) => {
  console.log('is enemy casts rerendering');
  const RenderCast = ({
    event,
    className,
  }: {
    event: NpcCastEvent | NpcBeginCastEvent;
    className: string;
  }) => {
    const level = 0;
    return RenderIcon(event, {
      className,
      start,
      windowStart,
      secondWidth,
      style: {
        '--level': level > 0 ? level : undefined,
      },
    });
  };

  const style: CSSProperties & { '--levels'?: number } = {
    '--levels': 0,
    ...others.style,
  };
  return (
    <div className="casts" {...others} style={{ ...style, position: 'relative' }}>
      {events.map((castEvent: NpcCastEvent | NpcBeginCastEvent, index: number) => {
        let className = '';
        if (castEvent.npc?.subType === 'Boss') {
          className = 'npc-boss-cast';
        } else if (castEvent.matchedCast) {
          className = 'npc-channeled-cast';
        } else if (!castEvent.matchedCast && castEvent.type === 'begincast') {
          className = 'npc-stopped-cast';
        } else if (!castEvent.matchedCast) {
          className = 'npc-instant-cast';
        }

        return <RenderCast key={`npc_cast_${index}`} event={castEvent} className={className} />;
      })}
    </div>
  );
};

export default EnemyCasts;
