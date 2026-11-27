import ArdentDefender from './ArdentDefender';
import GuardianOfAncientKings from './GuardianOfAncientKings';
import Sentinel from './Sentinel';
import ConsecrationDefensives from './ConsecrationDefensives';
import Combatant from 'parser/core/Combatant';
import type Analyzer from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/paladin';

export const MAJOR_ANALYZERS = (combatant: Combatant): (typeof Analyzer)[] => {
  return [
    GuardianOfAncientKings,
    ArdentDefender,
    ...(combatant.hasTalent(TALENTS.SENTINEL_TALENT) ? [Sentinel] : []),
  ];
};
export const TIMELINE_ANALYZERS = [ConsecrationDefensives] as const;
