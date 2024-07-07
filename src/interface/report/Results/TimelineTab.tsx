import { getAlertComponent } from 'interface/Alert';
import CombatLogParser from 'parser/core/CombatLogParser';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { fetchEvents } from 'common/fetchWclApi';
import { useConfig } from '../ConfigContext';
import Component from './Timeline/Component';
import { BeginCastEvent, CastEvent } from 'parser/core/Events';

interface Props {
  parser: CombatLogParser;
}

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
  targetID: number;
  time: string;
  matchingDmgEvent?: any;
};
type NpcBeginCastEvent = BeginCastEvent & {
  npc: NpcInfo;
  npcPet: NpcInfo;
  matchedCast?: any;
  friendlyTarget?: any;
  targetID: number;
  time: string;
  matchingDmgEvent?: any;
};

const TimelineTab = ({ parser }: Props) => {
  const config = useConfig();
  const [shouldRenderNPCSpells, setRenderNPCSpells] = useState<boolean>(false);
  const [NPCCasts, setNPCCasts] = useState<(BeginCastEvent | CastEvent | any)[]>([]);
  const prevShouldRenderNPCSpells = useRef(shouldRenderNPCSpells);
  const hasUserRequestsNPCSpells = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      const userRequestFirstTime =
        !hasUserRequestsNPCSpells.current &&
        prevShouldRenderNPCSpells.current === false &&
        shouldRenderNPCSpells === true;
      //This condition ensures npc abilities are only fetched once for the firs time a use requests them
      if (userRequestFirstTime) {
        hasUserRequestsNPCSpells.current = true;
      }
      if (hasUserRequestsNPCSpells.current) {
        try {
          //This call grabs the abilities cast by NPCs
          const events = (await fetchEvents(
            parser.report.code,
            parser.fight.start_time,
            parser.fight.end_time,
            undefined,
            "type in ('begincast', 'cast') and source.type in ('NPC', 'Boss')",
            40,
          )) as (NpcBeginCastEvent | NpcCastEvent)[];
          //This call grabs the damage events that friendly players took from NPCs
          const damageStuff = (await fetchEvents(
            parser.report.code,
            parser.fight.start_time,
            parser.fight.end_time,
            undefined,
            "type = 'damage' AND source.type in ('NPC', 'Boss')",
            40,
          )) as any;

          //These three reducers map the character id to the character so that the source and targets for the damage events can be matched
          const enemies = parser.report.enemies.reduce(
            (acc: Record<number, any>, cur: { id: number }) => {
              if (!acc[cur.id]) {
                acc[cur.id] = cur;
              }
              return acc;
            },
            {},
          );
          const enemyPets = parser.report.enemyPets.reduce(
            (acc: Record<number, any>, cur: { id: number }) => {
              if (!acc[cur.id]) {
                acc[cur.id] = cur;
              }
              return acc;
            },
            {},
          );
          const allies = parser.combatantInfoEvents.reduce(
            (acc: Record<number, any>, cur: { sourceID: number; player: any }) => {
              if (!acc[cur.sourceID]) {
                acc[cur.sourceID] = cur.player;
              }
              return acc;
            },
            {},
          );

          //This groups damage events together. Helpful for aoe spells from the enemy that hit multiple players at the same time
          const nonMeleeDamageEvents = damageStuff
            .filter((val: any) => val.ability.name !== 'Melee')
            .reduce((acc: any, cur: any) => {
              const lastItem = acc[acc.length - 1];
              if (cur.sourceID > -1) {
                if (
                  Array.isArray(lastItem) &&
                  //group events that are within 300ms and have the same ability name and source
                  lastItem[lastItem.length - 1].timestamp <= cur.timestamp &&
                  lastItem[lastItem.length - 1].timestamp >= cur.timestamp - 300 &&
                  lastItem[lastItem.length - 1].sourceID === cur.sourceID &&
                  lastItem[lastItem.length - 1].ability.name === cur.ability.name
                ) {
                  lastItem.push(cur);
                } else if (
                  lastItem &&
                  lastItem.timestamp <= cur.timestamp &&
                  lastItem.timestamp >= cur.timestamp - 300 &&
                  lastItem.sourceID === cur.sourceID &&
                  lastItem.ability.name === cur.ability.name
                ) {
                  acc[acc.length - 1] = [lastItem, cur];
                } else {
                  acc.push(cur);
                }
              }
              return acc;
            }, []) as any;

          const beginCastMap: { [key: string]: NpcCastEvent | NpcBeginCastEvent } = {};
          /*
            This loop maps the npc to the event as well as the friendly player, if it was a targeted spell.
            It also combines cast events with their matching begin cast event. This is helpful to find which casts were interrupted. (begincast events without a matching cast)
          */
          for (let i = 0; i < events.length; i = i + 1) {
            const event = events[i] as NpcCastEvent | NpcBeginCastEvent;
            event['npc'] = enemies[event.sourceID];
            event['npcPet'] = enemyPets[event.sourceID];
            const eventKey = `${event.ability.name}_${event.sourceID}`;
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
            const matchingDmgEvent = nonMeleeDamageEvents.filter((damageTaken: any) => {
              const dmgEvent = Array.isArray(damageTaken) ? damageTaken[0] : damageTaken;
              return (
                dmgEvent.timestamp >= event.timestamp &&
                dmgEvent.timestamp <= event.timestamp + 10000 && //Assumes a damage event from an npc ability happens within 10 seconds
                dmgEvent.sourceID === event.sourceID &&
                dmgEvent.ability.name === event.ability.name
              );
            });
            event['matchingDmgEvent'] = matchingDmgEvent;
            return (
              //remove melee events, and events that do not damage allies.
              //keep events that were silenced/interrupted
              event.ability.name !== 'Melee' &&
              (matchingDmgEvent.length || (!event.matchedCast && event.type === 'begincast'))
            );
          });
          setNPCCasts(npcAbilities);
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
    shouldRenderNPCSpells,
  ]);

  let alert: ReactNode = null;
  if (config.pages?.timeline) {
    let data;
    if (typeof config.pages?.timeline === 'function') {
      data = config.pages?.timeline(parser);
    } else {
      data = config.pages?.timeline;
    }

    if (data) {
      const Component = getAlertComponent(data.type);

      alert = (
        <Component
          style={{
            marginBottom: 30,
          }}
        >
          {data.text}
        </Component>
      );
    }
  }

  return (
    <>
      <div className="container">{alert}</div>

      <Component
        setRenderNPCSpells={setRenderNPCSpells}
        shouldRenderNPCSpells={shouldRenderNPCSpells}
        parser={parser}
        abilities={parser.getModule(Abilities)}
        enemyCasts={NPCCasts}
        auras={parser.getModule(Buffs)}
        movement={parser.getModule(DistanceMoved).instances}
        config={parser.config.timeline}
      />
    </>
  );
};

export default TimelineTab;
