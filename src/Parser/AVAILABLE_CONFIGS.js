import HolyPaladin from './HolyPaladin/CONFIG';

import RestoDruid from './RestoDruid/CONFIG';
import GuardianDruid from './GuardianDruid/CONFIG';

import DisciplinePriest from './DisciplinePriest/CONFIG';
import HolyPriest from './HolyPriest/CONFIG';

import ElementalShaman from './ElementalShaman/CONFIG';
import EnhancementShaman from './EnhancementShaman/CONFIG';
import RestorationShaman from './RestorationShaman/CONFIG';

import MistweaverMonk from './MistweaverMonk/CONFIG';
import WindwalkerMonk from './WindwalkerMonk/CONFIG';

import SubtletyRogue from './SubtletyRogue/CONFIG';

// Order of this should be the order in which specs were added to production
export default [
  HolyPaladin,
  
  RestoDruid,
  GuardianDruid,
  
  DisciplinePriest,
  HolyPriest,
  
  MistweaverMonk,
  WindwalkerMonk,
  
  ElementalShaman,
  EnhancementShaman,
  RestorationShaman,
  
  SubtletyRogue,
];
