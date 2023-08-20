import { Phase } from 'game/raids';
import { EventType, PhaseEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import PhaseConfig from 'parser/core/PhaseConfig';
import { useEffect, useState } from 'react';

export const SELECTION_ALL_PHASES = 'ALL';
export const SELECTION_CUSTOM_PHASE = 'CUSTOM';

const usePhases = ({
  fight,
  bossPhaseEventsLoaded,
  bossPhaseEvents,
  bossPhaseConfigs,
}: {
  fight: WCLFight;
  bossPhaseEventsLoaded: boolean;
  bossPhaseEvents: PhaseEvent[] | null;
  bossPhaseConfigs: Record<string, PhaseConfig> | undefined;
}) => {
  const [phases, setPhases] = useState<{ [key: string]: Phase } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bossPhaseEventsLoaded) {
      return;
    }

    const makePhases = () => {
      if (!bossPhaseEvents) {
        return {};
      }
      const distinct = <T>(items: T[]) => Array.from(new Set<T>(items));

      const phaseStarts = distinct(
        bossPhaseEvents
          .filter((e: PhaseEvent) => e.type === EventType.PhaseStart)
          .map((e: PhaseEvent) => e.phase.key),
      ); //distinct phase starts
      const phaseEnds = distinct(
        bossPhaseEvents
          .filter((e: PhaseEvent) => e.type === EventType.PhaseEnd)
          .map((e: PhaseEvent) => e.phase.key),
      ); //distinct phase ends
      const phaseKeys = phaseStarts.filter((e) => phaseEnds.includes(e)); //only include phases that contain start and end event
      const bossPhases = bossPhaseConfigs ?? {};
      return Object.keys(bossPhases)
        .filter((e) => phaseKeys.includes(e)) //only include boss phases that have a valid phase key
        .reduce((obj, key) => {
          const startInstances = bossPhaseEvents.filter(
            (e: PhaseEvent) => e.type === EventType.PhaseStart && e.phase.key === key,
          );
          const endInstances = bossPhaseEvents.filter(
            (e: PhaseEvent) => e.type === EventType.PhaseEnd && e.phase.key === key,
          );
          return {
            ...obj,
            [key]: {
              ...bossPhases[key],
              //sort start and end by timestamp in case of multiple instances, only keep instances that have both a start and end date
              start: startInstances
                .filter(
                  (e: PhaseEvent) =>
                    endInstances.find(
                      (e2: PhaseEvent) => e2.phase.instance === e.phase.instance,
                    ) !== undefined,
                )
                .sort((a: PhaseEvent, b: PhaseEvent) => a.timestamp - b.timestamp)
                .map((e: PhaseEvent) => e.timestamp),
              end: endInstances
                .filter(
                  (e: PhaseEvent) =>
                    startInstances.find(
                      (e2: PhaseEvent) => e2.phase.instance === e.phase.instance,
                    ) !== undefined,
                )
                .sort((a: PhaseEvent, b: PhaseEvent) => a.timestamp - b.timestamp)
                .map((e: PhaseEvent) => e.timestamp),
            },
          };
        }, {});
    };

    const parse = async () => {
      setIsLoading(true);
      const phases = makePhases();
      setIsLoading(false);
      setPhases(phases);
    };

    setPhases(null);
    parse();
  }, [bossPhaseEventsLoaded, bossPhaseEvents, fight, bossPhaseConfigs]);

  return { phases, isLoading };
};

export default usePhases;
