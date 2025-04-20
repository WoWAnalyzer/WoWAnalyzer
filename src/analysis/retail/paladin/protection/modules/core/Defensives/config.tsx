import ArdentDefender from './ArdentDefender';
import GuardianOfAncientKings from './GuardianOfAncientKings';
import EyeOfTyr from './EyeOfTyr';
import ConsecrationDefensives from './ConsecrationDefensives';
import Combatant from 'parser/core/Combatant';
import talents from 'common/TALENTS/paladin';
import type Analyzer from 'parser/core/Analyzer';

export const MAJOR_ANALYZERS = (combatant: Combatant): (typeof Analyzer)[] => {
  const analyzers: (typeof Analyzer)[] = [GuardianOfAncientKings, ArdentDefender];
  if (!combatant.hasTalent(talents.LIGHTS_GUIDANCE_TALENT)) {
    analyzers.push(EyeOfTyr);
  }
  return analyzers;
};
export const TIMELINE_ANALYZERS = [ConsecrationDefensives] as const;
