import BloodDeathKnight from './deathknight/blood/CONFIG';
import UnholyDeathKnight from './deathknight/unholy/CONFIG';
import FrostDeathKnight from './deathknight/frost/CONFIG';

import HavocDemonHunter from './demonhunter/havoc/CONFIG';
import VengeanceDemonHunter from './demonhunter/vengeance/CONFIG';

import BalanceDruid from './druid/balance/CONFIG';
import FeralDruid from './druid/feral/CONFIG';
import GuardianDruid from './druid/guardian/CONFIG';
import RestoDruid from './druid/restoration/CONFIG';

import BeastMasteryHunter from './hunter/beastmastery/CONFIG';
import MarksmanshipHunter from './hunter/marksmanship/CONFIG';
import SurvivalHunter from './hunter/survival/CONFIG';

import FrostMage from './mage/frost/CONFIG';
import FireMage from './mage/fire/CONFIG';
import ArcaneMage from './mage/arcane/CONFIG';

import BrewmasterMonk from './monk/brewmaster/CONFIG';
import WindwalkerMonk from './monk/windwalker/CONFIG';
import MistweaverMonk from './monk/mistweaver/CONFIG';

import HolyPaladin from './paladin/holy/CONFIG';
import RetributionPaladin from './paladin/retribution/CONFIG';
import ProtectionPaladin from './paladin/protection/CONFIG';

import DisciplinePriest from './priest/discipline/CONFIG';
import HolyPriest from './priest/holy/CONFIG';
import ShadowPriest from './priest/shadow/CONFIG';

import SubtletyRogue from './rogue/subtlety/CONFIG';
import AssassinationRogue from './rogue/assassination/CONFIG';
import OutlawRogue from './rogue/outlaw/CONFIG';

import ElementalShaman from './shaman/elemental/CONFIG';
import EnhancementShaman from './shaman/enhancement/CONFIG';
import RestorationShaman from './shaman/restoration/CONFIG';

import AfflictionWarlock from './warlock/affliction/CONFIG';
import DemonologyWarlock from './warlock/demonology/CONFIG';
import DestructionWarlock from './warlock/destruction/CONFIG';

import ProtectionWarrior from './warrior/protection/CONFIG';
import ArmsWarrior from './warrior/arms/CONFIG';
import FuryWarrior from './warrior/fury/CONFIG';

import Config from './Config';

const configs: Config[] = [
  BloodDeathKnight,
  UnholyDeathKnight,
  FrostDeathKnight,

  HavocDemonHunter,
  VengeanceDemonHunter,

  BalanceDruid,
  FeralDruid,
  GuardianDruid,
  RestoDruid,

  BeastMasteryHunter,
  MarksmanshipHunter,
  SurvivalHunter,

  FrostMage,
  FireMage,
  ArcaneMage,

  BrewmasterMonk,
  WindwalkerMonk,
  MistweaverMonk,

  HolyPaladin,
  RetributionPaladin,
  ProtectionPaladin,

  DisciplinePriest,
  HolyPriest,
  ShadowPriest,

  SubtletyRogue,
  AssassinationRogue,
  OutlawRogue,

  ElementalShaman,
  EnhancementShaman,
  RestorationShaman,

  AfflictionWarlock,
  DemonologyWarlock,
  DestructionWarlock,

  ProtectionWarrior,
  ArmsWarrior,
  FuryWarrior,
];

export default configs;
