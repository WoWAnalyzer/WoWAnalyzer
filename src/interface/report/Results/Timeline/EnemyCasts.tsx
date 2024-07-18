import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import { CastEvent, BeginCastEvent, HasSource, HasAbility, DamageEvent } from 'parser/core/Events';
import {
  Fragment,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import './Casts.scss';
import React from 'react';
import Toggle from 'react-toggle';
import { fetchEvents } from 'common/fetchWclApi';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import TimeIndicators from './TimeIndicators';
import ActivityIndicator from 'interface/ActivityIndicator';
import SPELLS from 'common/SPELLS';
import { EnemyInfo } from 'parser/core/Enemy';
import { PetInfo } from 'parser/core/Pet';
import { PlayerInfo } from 'parser/core/Player';
import { encodeEventSourceString } from 'parser/shared/modules/Enemies';

interface Props extends HTMLAttributes<HTMLDivElement> {
  start: number;
  windowStart?: number;
  secondWidth: number;
  events: (NpcBeginCastEvent | NpcCastEvent)[];
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

const RenderCast = React.memo(
  ({
    event,
    className,
    start,
    windowStart,
    secondWidth,
  }: {
    event: NpcCastEvent | NpcBeginCastEvent;
    className: string;
  } & Pick<Props, 'start' | 'windowStart' | 'secondWidth'>) => {
    return RenderIcon(event, {
      className,
      start,
      windowStart,
      secondWidth,
    });
  },
);

const EnemyCasts = React.memo(
  ({ start, windowStart, secondWidth, events, reportCode, actorId, ...others }: Props) => {
    const style: CSSProperties & { '--levels'?: number } = {
      '--levels': 0,
      ...others.style,
    };
    return (
      <div className="casts" {...others} style={{ ...style, position: 'relative' }}>
        {events.map((castEvent: NpcCastEvent | NpcBeginCastEvent, index: number) => {
          let className = '';
          if (!castEvent.matchedCast && castEvent.type === 'begincast') {
            className = 'npc-stopped-cast';
          }

          return (
            <RenderCast
              key={`npc_cast_${index}`}
              event={castEvent}
              className={className}
              start={start}
              windowStart={windowStart}
              secondWidth={secondWidth}
            />
          );
        })}
      </div>
    );
  },
);

export default EnemyCasts;

const EnemySpellTypeToggle = ({
  label,
  toggleCallBack,
  checked,
  id,
}: {
  label: React.ReactNode;
  toggleCallBack: () => void;
  checked: boolean;
  id: string;
}) => {
  return (
    <div className="npc-toggle-container">
      <span className="text-left toggle-control npc-toggle-options">
        <Toggle defaultChecked={checked} icons={false} onChange={toggleCallBack} id={id} />
        <label htmlFor={id} style={{ marginRight: 'auto' }}>
          {label}
        </label>
      </span>
    </div>
  );
};

/**
 * The toggle controls for the enemy spells timeline.
 *
 * Note that the positioning of these is pretty janky and relies on a specific interaction of `static` positioning (which means no `width`!) and the parent container right now.
 */
const EnemySpellControlBlock = ({
  toggleAll,
  toggleStopped,
  shouldRenderNPCSpells,
  shouldRenderStoppedSpells,
  isLoaded,
}: {
  toggleAll: () => void;
  toggleStopped: () => void;
  shouldRenderNPCSpells: boolean;
  shouldRenderStoppedSpells: boolean;
  isLoaded: boolean;
}) => {
  return (
    <div
      className={`enemy-casts-controls ${isLoaded && shouldRenderNPCSpells ? 'enemy-casts-controls__visible' : ''}`}
    >
      <EnemySpellTypeToggle
        id="enemy-casts-toggle"
        label=<>Show Enemy Ability Timeline</>
        toggleCallBack={toggleAll}
        checked={shouldRenderNPCSpells}
      />
      {shouldRenderNPCSpells && isLoaded && (
        <EnemySpellTypeToggle
          id="stopped-spells-toggle"
          label={
            <>
              Show{' '}
              <SpellLink style={{ pointerEvents: 'none' }} spell={SPELLS.KICK}>
                Stopped
              </SpellLink>{' '}
              Abilities
            </>
          }
          toggleCallBack={toggleStopped}
          checked={shouldRenderStoppedSpells}
        />
      )}
    </div>
  );
};

export const EnemyCastsTimeline = ({
  seconds,
  start,
  secondWidth,
  offset,
  skipInterval,
}: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { combatLogParser: parser } = useCombatLogParser();
  const [shouldRenderNPCSpells, setRenderNPCSpells] = useState<boolean>(false);
  const [NPCCasts, setNPCCasts] = useState<(NpcBeginCastEvent | NpcCastEvent)[]>([]);

  const [interruptedAbilities, setInterruptedAbilities] = useState(true);

  const [hasUserRequestedNPCSpells, setHasUserRequestedNPCSpells] = useState<boolean>(false);
  const [loadingNPCSpellsState, setLoadingNPCSpellsState] = useState<
    'notFetched' | 'loading' | 'loaded'
  >('notFetched');

  const toggleHandler = useCallback(() => {
    setRenderNPCSpells((prev) => {
      //set hasUserRequestsNPCSpells to true when the toggle goes from false to true, indicating the user wants to see the npc spells for the first  time
      if (!prev) {
        setHasUserRequestedNPCSpells(true);
        setLoadingNPCSpellsState((current) => (current === 'notFetched' ? 'loading' : current));
      }
      return !prev;
    });
  }, []);

  const toggle = useCallback((key: string, active: boolean) => {
    const div = containerRef.current;
    if (!div) {
      return;
    }

    div.style.setProperty(`--npc-${key}`, active ? 'block' : 'none');
  }, []);

  useEffect(() => {
    toggle('content', shouldRenderNPCSpells);
  }, [shouldRenderNPCSpells, toggle]);

  useEffect(() => {
    const fetchData = async () => {
      if (hasUserRequestedNPCSpells) {
        try {
          //This call grabs the abilities cast by NPCs
          const events = (await fetchEvents(
            parser.report.code,
            parser.fight.start_time,
            parser.fight.end_time,
            undefined,
            `type in ('begincast', 'cast') and source.type in ('NPC', 'Boss') AND ability.id > 1 AND sourceID > -1 AND ability.id not in (${EXCLUDED_SPELLS.join(',')})`,
            40,
          )) as (NpcBeginCastEvent | NpcCastEvent)[];
          const abilities = new Set();
          for (const event of events) {
            abilities.add(event.ability.guid);
          }
          //This call grabs the damage events that friendly players took from NPCs
          const damageStuff = (await fetchEvents(
            parser.report.code,
            parser.fight.start_time,
            parser.fight.end_time,
            undefined,
            `type = 'damage' AND source.type in ('NPC', 'Boss') AND ability.id > 1 AND source.id > 0 AND target.type = 'Player' AND missType not in ('immune', 'deflect', 'reflect', 'misfire', 'evade') AND ability.id in (${Array.from(abilities).join(',')})`,
            40,
          )) as DamageEvent[];
          //These three reducers map the character id to the character so that the source and targets for the damage events can be matched
          const enemies = parser.report.enemies.reduce((acc: Record<number, EnemyInfo>, cur) => {
            if (!acc[cur.id]) {
              acc[cur.id] = cur;
            }
            return acc;
          }, {});
          const enemyPets = parser.report.enemyPets.reduce((acc: Record<number, PetInfo>, cur) => {
            if (!acc[cur.id]) {
              acc[cur.id] = cur;
            }
            return acc;
          }, {});
          const allies = parser.combatantInfoEvents.reduce(
            (acc: Record<number, PlayerInfo>, cur) => {
              if (!acc[cur.sourceID]) {
                acc[cur.sourceID] = cur.player;
              }
              return acc;
            },
            {},
          );

          //This groups damage events together. Helpful for aoe spells from the enemy that hit multiple players at the same time
          const nonMeleeDamageEvents = damageStuff.reduce((acc: DamageEvent[][], cur) => {
            const lastItem = acc[acc.length - 1];
            if (HasAbility(cur) && HasSource(cur) && cur.sourceID > -1) {
              const lastEvent = lastItem?.at(-1);
              if (
                lastEvent &&
                lastEvent.timestamp <= cur.timestamp &&
                lastEvent.timestamp >= cur.timestamp - 300 &&
                lastEvent.sourceID === cur.sourceID &&
                lastEvent.sourceInstance === cur.sourceInstance &&
                lastEvent.ability.guid === cur.ability.guid
              ) {
                lastItem.push(cur);
              } else {
                acc.push([cur]);
              }
            }
            return acc;
          }, []);

          const beginCastMap: { [key: string]: NpcCastEvent | NpcBeginCastEvent } = {};
          /*
            This loop maps the npc to the event as well as the friendly player, if it was a targeted spell.
            It also combines cast events with their matching begin cast event. This is helpful to find which casts were interrupted. (begincast events without a matching cast)
          */
          for (let i = 0; i < events.length; i = i + 1) {
            const event = events[i] as NpcCastEvent | NpcBeginCastEvent;
            event['npc'] = enemies[event.sourceID];
            event['npcPet'] = enemyPets[event.sourceID];
            const eventKey = `${event.ability.guid}_${encodeEventSourceString(event)}`;
            if (allies[event.targetID]) {
              event['friendlyTarget'] = allies[event.targetID];
            }
            if (event.type === 'begincast') {
              beginCastMap[eventKey] = event;
            } else if (event.type === 'cast') {
              const beginCast = beginCastMap[eventKey];
              if (beginCast) {
                beginCast.matchedCast = event;
                events.splice(i, 1);
                i = i - 1;
              }
            }
          }

          /*
            This loop combines the damage events on players with the cast event from the npc.
            It assums the damage is dealt within 10 seconds from the cast.
            It also removes npc abilities that were melee, or did not damage an ally
          */
          const npcAbilities = events.filter((event) => {
            const matchingDmgEvent = nonMeleeDamageEvents.filter((damageTaken) => {
              const dmgEvent = damageTaken[0];
              return (
                dmgEvent.timestamp >= event.timestamp &&
                dmgEvent.timestamp <= event.timestamp + 10000 && //Assumes a damage event from an npc ability happens within 10 seconds
                dmgEvent.sourceID === event.sourceID &&
                dmgEvent.ability.name === event.ability.name // we are intentionally using the name here instead of guid to account for casts having different spell ids from damage
              );
            });
            return (
              //remove events that do not damage allies.
              //keep events that were silenced/interrupted/stopped
              //keep events that are sourced to a boss
              matchingDmgEvent.length ||
              (!event.matchedCast && event.type === 'begincast') ||
              event.npc?.subType === 'Boss'
            );
          });
          setNPCCasts(npcAbilities);
          setLoadingNPCSpellsState('loaded');
        } catch (err) {
          console.log('failed npc cast call: ', err);
        }
      }
    };

    fetchData();
  }, [
    parser.report.code,
    parser.fight.start_time,
    parser.fight.end_time,
    parser.combatantInfoEvents,
    parser.report.enemies,
    parser.report.enemyPets,
    hasUserRequestedNPCSpells,
  ]);

  return (
    <div ref={containerRef} style={{ position: 'static', minHeight: '1em' }}>
      <EnemySpellControlBlock
        toggleAll={toggleHandler}
        toggleStopped={() => {
          setInterruptedAbilities((v) => {
            toggle('stopped-cast', !v);
            return !v;
          });
        }}
        shouldRenderNPCSpells={shouldRenderNPCSpells}
        shouldRenderStoppedSpells={interruptedAbilities}
        isLoaded={loadingNPCSpellsState === 'loaded'}
      />
      {loadingNPCSpellsState === 'loading' ? (
        <ActivityIndicator text="Loading..." />
      ) : loadingNPCSpellsState === 'loaded' ? (
        <div className="npc-content-container">
          <TimeIndicators
            seconds={seconds}
            offset={offset}
            secondWidth={secondWidth}
            skipInterval={skipInterval}
          />
          <EnemyCasts
            start={start}
            secondWidth={secondWidth}
            reportCode={parser.report.code}
            actorId={parser.player.id}
            events={NPCCasts}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

interface TimelineProps {
  seconds: number;
  start: number;
  secondWidth: number;
  offset: number;
  skipInterval: number;
}

interface NpcCastEvent extends CastEvent {
  npc?: EnemyInfo;
  npcPet?: PetInfo;
  matchedCast?: CastEvent;
  friendlyTarget?: PlayerInfo;
  targetID: number;
  time: string;
}
interface NpcBeginCastEvent extends BeginCastEvent {
  npc?: EnemyInfo;
  npcPet?: PetInfo;
  matchedCast?: CastEvent;
  friendlyTarget?: PlayerInfo;
  targetID: number;
  time: string;
}

const EXCLUDED_SPELLS = [
  429740, // Tindral - Scorching Treant - Pulsing Heat cosmetic cast
  421532, // Smolderon - Smoldering Ground cosmetic cast
];
