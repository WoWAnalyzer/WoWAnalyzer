import { DampenHarm } from 'analysis/retail/monk/shared';
import CelestialBrew from '../../spells/CelestialBrew';
import { DiffuseMagic } from './DiffuseMagic';
import { FortifyingBrew } from './FortifyingBrew';
import { ZenMeditation } from './ZenMeditation';

export const MAJOR_ANALYZERS = [
  CelestialBrew,
  FortifyingBrew,
  DampenHarm,
  DiffuseMagic,
  ZenMeditation,
] as const;
