import ArdentDefender from './ArdentDefender';
import GuardianOfAncientKings from './GuardianOfAncientKings';
import ConsecrationDefensives from './ConsecrationDefensives';
import Combatant from 'parser/core/Combatant';
import type Analyzer from 'parser/core/Analyzer';

export const MAJOR_ANALYZERS = (_combatant: Combatant): (typeof Analyzer)[] => {
  return [GuardianOfAncientKings, ArdentDefender];
};
export const TIMELINE_ANALYZERS = [ConsecrationDefensives] as const;
