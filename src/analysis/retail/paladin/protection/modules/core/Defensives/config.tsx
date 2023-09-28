import ArdentDefender from './ArdentDefender';
import GuardianOfAncientKings from './GuardianOfAncientKings';
import EyeOfTyr from './EyeOfTyr';
import ConsecrationDefensives from './ConsecrationDefensives';

export const MAJOR_ANALYZERS = [GuardianOfAncientKings, ArdentDefender, EyeOfTyr] as const;
export const TIMELINE_ANALYZERS = [ConsecrationDefensives] as const;
