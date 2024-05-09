import { Trans } from '@lingui/macro';
import AgilityIcon from 'interface/icons/Agility';
import ArmorIcon from 'interface/icons/Armor';
import AvoidanceIcon from 'interface/icons/Avoidance';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import HasteIcon from 'interface/icons/Haste';
import HealthIcon from 'interface/icons/Health';
import IntellectIcon from 'interface/icons/Intellect';
import LeechIcon from 'interface/icons/Leech';
import ManaIcon from 'interface/icons/Mana';
import MasteryIcon from 'interface/icons/Mastery';
import SpeedIcon from 'interface/icons/Speed';
import StaminaIcon from 'interface/icons/Stamina';
import StrengthIcon from 'interface/icons/Strength';
import VersatilityIcon from 'interface/icons/Versatility';

export enum PRIMARY_STAT {
  STRENGTH = 'strength',
  AGILITY = 'agility',
  INTELLECT = 'intellect',
}

export enum SECONDARY_STAT {
  CRITICAL_STRIKE = 'criticalstrike',
  HASTE = 'haste',
  MASTERY = 'mastery',
  VERSATILITY = 'versatility',
}

enum OTHER_STAT {
  HEALTH = 'health',
  STAMINA = 'stamina',
  MANA = 'mana',
  HASTE_HPCT = 'hastehpct',
  HASTE_HPM = 'hastehpm',
  VERSATILITY_DR = 'versatilitydr',
  LEECH = 'leech',
  AVOIDANCE = 'avoidance',
  SPEED = 'speed',
  ARMOR = 'armor',
  UNKNOWN = 'unknown',
}

type STAT = PRIMARY_STAT | SECONDARY_STAT | OTHER_STAT;

// eslint-disable-next-line @typescript-eslint/no-redeclare
const STAT = {
  ...PRIMARY_STAT,
  ...SECONDARY_STAT,
  ...OTHER_STAT,
};

export default STAT;

export function getName(stat: STAT) {
  switch (stat) {
    case STAT.HEALTH:
      return 'Health';
    case STAT.STAMINA:
      return 'Stamina';
    case STAT.MANA:
      return 'Mana';
    case STAT.STRENGTH:
      return 'Strength';
    case STAT.AGILITY:
      return 'Agility';
    case STAT.INTELLECT:
      return 'Intellect';
    case STAT.CRITICAL_STRIKE:
      return 'Critical Strike';
    case STAT.HASTE:
      return 'Haste';
    case STAT.HASTE_HPCT:
      return 'Haste (HPCT)';
    case STAT.HASTE_HPM:
      return 'Haste (HPM)';
    case STAT.MASTERY:
      return 'Mastery';
    case STAT.VERSATILITY:
      return 'Versatility';
    case STAT.VERSATILITY_DR:
      return 'Versatility (with DR)';
    case STAT.LEECH:
      return 'Leech';
    case STAT.AVOIDANCE:
      return 'Avoidance';
    case STAT.SPEED:
      return 'Speed';
    case STAT.ARMOR:
      return 'Armor';
    default:
      return null;
  }
}

export function getNameTranslated(stat: STAT) {
  // there's stuff using getName with string functions which Trans breaks
  switch (stat) {
    case STAT.HEALTH:
      return <Trans id="common.stat.health">Health</Trans>;
    case STAT.STAMINA:
      return <Trans id="common.stat.stamina">Stamina</Trans>;
    case STAT.MANA:
      return <Trans id="common.stat.mana">Mana</Trans>;
    case STAT.STRENGTH:
      return <Trans id="common.stat.strength">Strength</Trans>;
    case STAT.AGILITY:
      return <Trans id="common.stat.agility">Agility</Trans>;
    case STAT.INTELLECT:
      return <Trans id="common.stat.intellect">Intellect</Trans>;
    case STAT.CRITICAL_STRIKE:
      return <Trans id="common.stat.criticalStrike">Critical Strike</Trans>;
    case STAT.HASTE:
      return <Trans id="common.stat.haste">Haste</Trans>;
    case STAT.HASTE_HPCT:
      return <Trans id="common.stat.hasteHPCT">Haste (HPCT)</Trans>;
    case STAT.HASTE_HPM:
      return <Trans id="common.stat.hasteHPM">Haste (HPM)</Trans>;
    case STAT.MASTERY:
      return <Trans id="common.stat.mastery">Mastery</Trans>;
    case STAT.VERSATILITY:
      return <Trans id="common.stat.versatility">Versatility</Trans>;
    case STAT.VERSATILITY_DR:
      return <Trans id="common.stat.versatilityDR">Versatility (with DR)</Trans>;
    case STAT.LEECH:
      return <Trans id="common.stat.leech">Leech</Trans>;
    case STAT.AVOIDANCE:
      return <Trans id="common.stat.avoidance">Avoidance</Trans>;
    case STAT.SPEED:
      return <Trans id="common.stat.speed">Speed</Trans>;
    case STAT.ARMOR:
      return <Trans id="common.stat.armor">Armor</Trans>;
    default:
      return null;
  }
}

export function getClassNameColor(stat: STAT) {
  switch (stat) {
    case STAT.HEALTH:
      return 'stat-health';
    case STAT.STAMINA:
      return 'stat-stamina';
    case STAT.MANA:
      return 'stat-mana';
    case STAT.STRENGTH:
      return 'stat-strength';
    case STAT.AGILITY:
      return 'stat-agility';
    case STAT.INTELLECT:
      return 'stat-intellect';
    case STAT.CRITICAL_STRIKE:
      return 'stat-criticalstrike';
    case STAT.HASTE:
      return 'stat-haste';
    case STAT.HASTE_HPCT:
      return 'stat-haste';
    case STAT.HASTE_HPM:
      return 'stat-haste';
    case STAT.MASTERY:
      return 'stat-mastery';
    case STAT.VERSATILITY:
      return 'stat-versatility';
    case STAT.VERSATILITY_DR:
      return 'stat-versatility';
    case STAT.LEECH:
      return 'stat-leech';
    case STAT.AVOIDANCE:
      return 'stat-avoidance';
    case STAT.SPEED:
      return 'stat-speed';
    case STAT.ARMOR:
      return 'stat-armor';
    default:
      return null;
  }
}

export function getIcon(stat: STAT): (props: any) => JSX.Element {
  switch (stat) {
    case STAT.HEALTH:
      return HealthIcon;
    case STAT.STAMINA:
      return StaminaIcon;
    case STAT.MANA:
      return ManaIcon;
    case STAT.STRENGTH:
      return StrengthIcon;
    case STAT.AGILITY:
      return AgilityIcon;
    case STAT.INTELLECT:
      return IntellectIcon;
    case STAT.CRITICAL_STRIKE:
      return CriticalStrikeIcon;
    case STAT.HASTE:
      return HasteIcon;
    case STAT.HASTE_HPCT:
      return HasteIcon;
    case STAT.HASTE_HPM:
      return HasteIcon;
    case STAT.MASTERY:
      return MasteryIcon;
    case STAT.VERSATILITY:
      return VersatilityIcon;
    case STAT.VERSATILITY_DR:
      return VersatilityIcon;
    case STAT.LEECH:
      return LeechIcon;
    case STAT.AVOIDANCE:
      return AvoidanceIcon;
    case STAT.SPEED:
      return SpeedIcon;
    case STAT.ARMOR:
      return ArmorIcon;
    default:
      return (parms) => <></>;
  }
}
