import { DampenHarm } from 'analysis/retail/monk/shared';
import CelestialBrew from '../../spells/CelestialBrew';
import { DiffuseMagic } from './DiffuseMagic';
import { FortifyingBrew } from './FortifyingBrew';

export const MAJOR_ANALYZERS = [CelestialBrew, FortifyingBrew, DampenHarm, DiffuseMagic] as const;
