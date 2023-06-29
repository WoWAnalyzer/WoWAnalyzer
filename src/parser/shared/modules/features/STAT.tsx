
import AgilityIcon from 'interface/icons/Agility';
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

enum STAT {
  HEALTH = 'health',
  STAMINA = 'stamina',
  MANA = 'mana',
  STRENGTH = 'strength',
  AGILITY = 'agility',
  INTELLECT = 'intellect',
  CRITICAL_STRIKE = 'criticalstrike',
  HASTE = 'haste',
  HASTE_HPCT = 'hastehpct',
  HASTE_HPM = 'hastehpm',
  MASTERY = 'mastery',
  VERSATILITY = 'versatility',
  VERSATILITY_DR = 'versatilitydr',
  LEECH = 'leech',
  AVOIDANCE = 'avoidance',
  SPEED = 'speed',
  UNKNOWN = 'unknown',
}

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
    default:
      return null;
  }
}

export function getNameTranslated(stat: STAT) {
  // there's stuff using getName with string functions which Trans breaks
  switch (stat) {
    case STAT.HEALTH:
      return <>Health</>;
    case STAT.STAMINA:
      return <>Stamina</>;
    case STAT.MANA:
      return <>Mana</>;
    case STAT.STRENGTH:
      return <>Strength</>;
    case STAT.AGILITY:
      return <>Agility</>;
    case STAT.INTELLECT:
      return <>Intellect</>;
    case STAT.CRITICAL_STRIKE:
      return <>Critical Strike</>;
    case STAT.HASTE:
      return <>Haste</>;
    case STAT.HASTE_HPCT:
      return <>Haste (HPCT)</>;
    case STAT.HASTE_HPM:
      return <>Haste (HPM)</>;
    case STAT.MASTERY:
      return <>Mastery</>;
    case STAT.VERSATILITY:
      return <>Versatility</>;
    case STAT.VERSATILITY_DR:
      return <>Versatility (with DR)</>;
    case STAT.LEECH:
      return <>Leech</>;
    case STAT.AVOIDANCE:
      return <>Avoidance</>;
    case STAT.SPEED:
      return <>Speed</>;
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
    default:
      return null;
  }
}

export function getClassNameBackgroundColor(stat: STAT) {
  return `${getClassNameColor(stat)}-bg`;
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
    default:
      return (parms) => <></>;
  }
}
