import { captureException } from 'common/errorLogger';
import { fabricateBossPhaseEvents } from 'common/fabricateBossPhaseEvents';
import { fetchEvents } from 'common/fetchWclApi';
import { makeWclBossPhaseFilter } from 'common/makeWclBossPhaseFilter';
import { findByBossId } from 'game/raids';
import { EventType, PhaseEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import PhaseConfig from 'parser/core/PhaseConfig';
import Report from 'parser/core/Report';
import { useEffect, useMemo, useState } from 'react';

import BossPhasesState from '../BOSS_PHASES_STATE';

/**
 * Builds WoWA PhaseConfigs from WCL data, if the data is present
 */
const buildWclPhaseConfigs = (
  report: Report,
  fight: WCLFight,
): Record<string, PhaseConfig> | undefined => {
  if (!fight.phases) {
    return undefined;
  }

  // report contains information about the bosses phases
  const bossPhases = report.phases.find(({ boss }) => boss === fight.boss);
  if (!bossPhases) {
    return undefined;
  }

  // phase indexes which are intermissions
  const intermissions = bossPhases.intermissions ? new Set(bossPhases.intermissions) : new Set();
  // phase names, but 0-indexed (key with id - 1)
  const names = bossPhases.phases;

  let nextPhaseNum = 1;
  let nextIntermissionNum = 1;

  const phaseConfigs: Record<string, PhaseConfig> = {};
  for (const { id } of fight.phases) {
    if (phaseConfigs[id]) {
      // we've already seen this phase
      phaseConfigs[id].multiple = true;
      continue;
    }

    /*
     * In order to make more descriptive phase keys, we will key them with separate counts for Phase and Intermission,
     * for example "P1", "I1", "P2", etc.
     */
    const isIntermission = intermissions.has(id);
    let key;
    if (isIntermission) {
      key = 'I' + String(nextIntermissionNum);
      nextIntermissionNum += 1;
    } else {
      key = 'P' + String(nextPhaseNum);
      nextPhaseNum += 1;
    }

    phaseConfigs[id] = {
      key,
      name: names[id - 1],
      difficulties: [fight.difficulty ?? 1],
      intermission: isIntermission,
    };
  }

  return phaseConfigs;
};

/**
 * Build phase events from WCL fight metadata, if present.
 *
 * Many old reports will not have this data and will rely on WoWA's phase code instead.
 */
const buildWclPhaseEvents = (
  phaseConfigs: Record<string, PhaseConfig>,
  fight: WCLFight,
): PhaseEvent[] | undefined => {
  const instanceIndices: Record<number, number> = {};
  const instanceIndex = (id: number) => {
    if (!instanceIndices[id]) {
      instanceIndices[id] = 0;
    }

    instanceIndices[id] += 1;
    return instanceIndices[id];
  };

  return fight.phases?.flatMap(({ id, startTime }, index, phases) => {
    const instance = instanceIndex(id);
    return [
      {
        __fabricated: true,
        type: EventType.PhaseStart,
        timestamp: startTime,
        phase: phaseConfigs[id],
        instance,
      },
      {
        __fabricated: true,
        type: EventType.PhaseEnd,
        timestamp: phases[index + 1]?.startTime ?? fight.end_time,
        phase: phaseConfigs[id],
        instance,
      },
    ];
  });
};

const useBossPhaseEvents = ({ report, fight }: { report: Report; fight: WCLFight }) => {
  const [loadingState, setLoadingState] = useState<BossPhasesState>(BossPhasesState.LOADING);
  const [events, setEvents] = useState<PhaseEvent[] | null>(null);

  const phaseConfigs = useMemo(
    () => buildWclPhaseConfigs(report, fight) ?? findByBossId(fight.boss)?.fight.phases,
    [report, fight],
  );

  useEffect(() => {
    const wclPhaseEvents = fight.phases && phaseConfigs && buildWclPhaseEvents(phaseConfigs, fight);
    if (wclPhaseEvents) {
      // the fight metadata includes phases, we don't need to build them ourselves
      setLoadingState(BossPhasesState.DONE);
      setEvents(wclPhaseEvents);
      return;
    }

    const loadEvents = async () => {
      const filter = makeWclBossPhaseFilter(fight);

      if (filter) {
        const events = await fetchEvents(
          report.code,
          fight.start_time,
          fight.end_time,
          undefined,
          makeWclBossPhaseFilter(fight),
        );
        return fabricateBossPhaseEvents(events, report, fight);
      } else {
        return null;
      }
    };

    const load = async () => {
      let events = null;
      try {
        events = await loadEvents();
      } catch (err) {
        // The boss events are very nice, but we can still continue without it and just provide the entire fight for analysis.
        // We still want to log the error though, so we can potentially improve this.
        captureException(err as Error);
      }

      setLoadingState(events === null ? BossPhasesState.SKIPPED : BossPhasesState.DONE);
      setEvents(events);
    };

    setLoadingState(BossPhasesState.LOADING);
    setEvents(null);

    load();
  }, [report, fight, phaseConfigs]);

  return { loadingState, events, phaseConfigs };
};

export default useBossPhaseEvents;
