import BloodDeathKnight from '@wowanalyzer/deathknight-blood';
import FrostDeathKnight from '@wowanalyzer/deathknight-frost';
import UnholyDeathKnight from '@wowanalyzer/deathknight-unholy';
import HavocDemonHunter from '@wowanalyzer/demonhunter-havoc';
import VengeanceDemonHunter from '@wowanalyzer/demonhunter-vengeance';
import BalanceDruid from '@wowanalyzer/druid-balance';
import FeralDruid from '@wowanalyzer/druid-feral';
import GuardianDruid from '@wowanalyzer/druid-guardian';
import RestoDruid from '@wowanalyzer/druid-restoration';
import BeastMasteryHunter from '@wowanalyzer/hunter-beastmastery';
import MarksmanshipHunter from '@wowanalyzer/hunter-marksmanship';
import SurvivalHunter from '@wowanalyzer/hunter-survival';
import ArcaneMage from '@wowanalyzer/mage-arcane';
import FireMage from '@wowanalyzer/mage-fire';
import FrostMage from '@wowanalyzer/mage-frost';
import BrewmasterMonk from '@wowanalyzer/monk-brewmaster';
import MistweaverMonk from '@wowanalyzer/monk-mistweaver';
import WindwalkerMonk from '@wowanalyzer/monk-windwalker';
import HolyPaladin from '@wowanalyzer/paladin-holy';
import ProtectionPaladin from '@wowanalyzer/paladin-protection';
import RetributionPaladin from '@wowanalyzer/paladin-retribution';
import DisciplinePriest from '@wowanalyzer/priest-discipline';
import HolyPriest from '@wowanalyzer/priest-holy';
import ShadowPriest from '@wowanalyzer/priest-shadow';
import AssassinationRogue from '@wowanalyzer/rogue-assassination';
import OutlawRogue from '@wowanalyzer/rogue-outlaw';
import SubtletyRogue from '@wowanalyzer/rogue-subtlety';
import ElementalShaman from '@wowanalyzer/shaman-elemental';
import EnhancementShaman from '@wowanalyzer/shaman-enhancement';
import RestorationShaman from '@wowanalyzer/shaman-restoration';
import TbcDruid from '@wowanalyzer/tbc-druid';
import TbcHunter from '@wowanalyzer/tbc-hunter';
import TbcMage from '@wowanalyzer/tbc-mage';
import TbcPaladin from '@wowanalyzer/tbc-paladin';
import TbcPriest from '@wowanalyzer/tbc-priest';
import TbcShaman from '@wowanalyzer/tbc-shaman';
import AfflictionWarlock from '@wowanalyzer/warlock-affliction';
import DemonologyWarlock from '@wowanalyzer/warlock-demonology';
import DestructionWarlock from '@wowanalyzer/warlock-destruction';
import ArmsWarrior from '@wowanalyzer/warrior-arms';
import FuryWarrior from '@wowanalyzer/warrior-fury';
import ProtectionWarrior from '@wowanalyzer/warrior-protection';

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

  TbcMage,
  TbcHunter,
  TbcPriest,
  TbcDruid,
  TbcShaman,
  TbcPaladin,
];

export default configs;
