import { Trans } from '@lingui/react/macro';
import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'interface/SpellIcon';
import Tooltip from 'interface/Tooltip';
import STAT, {
  getClassNameColor,
  getIcon,
  getNameTranslated,
} from 'parser/shared/modules/features/STAT';
import StatTracker from 'parser/shared/modules/StatTracker';

const getStatRating = (statTracker: StatTracker, stat: STAT) => {
  const stats = statTracker.startingStats;
  switch (stat) {
    case STAT.STRENGTH:
      return stats.strength;
    case STAT.AGILITY:
      return stats.agility;
    case STAT.INTELLECT:
      return stats.intellect;
    case STAT.STAMINA:
      return stats.stamina;
    case STAT.CRITICAL_STRIKE:
      return stats.crit;
    case STAT.HASTE:
      return stats.haste;
    case STAT.MASTERY:
      return stats.mastery;
    case STAT.VERSATILITY:
      return stats.versatility;
    case STAT.LEECH:
      return stats.leech;
    case STAT.AVOIDANCE:
      return stats.avoidance;
    case STAT.SPEED:
      return stats.speed;
    default:
      return 0;
  }
};

const getStatPercentage = (statTracker: StatTracker, stat: STAT) => {
  const stats = statTracker.startingStats;
  switch (stat) {
    case STAT.CRITICAL_STRIKE:
      return statTracker.critPercentage(stats.crit, true);
    case STAT.HASTE:
      return statTracker.hastePercentage(stats.haste, true);
    case STAT.MASTERY:
      return statTracker.hasMasteryCoefficient
        ? statTracker.masteryPercentage(stats.mastery, true)
        : null;
    case STAT.VERSATILITY:
      return statTracker.versatilityPercentage(stats.versatility, true);
    case STAT.LEECH:
      return statTracker.leechPercentage(stats.leech, true);
    case STAT.AVOIDANCE:
      return statTracker.avoidancePercentage(stats.avoidance, true);
    case STAT.SPEED:
      return statTracker.speedPercentage(stats.speed, true);
    default:
      return null;
  }
};

const getPrimaryStat = (statTracker: StatTracker) => {
  const { strength, agility, intellect } = statTracker.startingStats;
  if (strength > agility && strength > intellect) {
    return STAT.STRENGTH;
  }
  if (agility > strength && agility > intellect) {
    return STAT.AGILITY;
  }
  if (intellect > strength && intellect > agility) {
    return STAT.INTELLECT;
  }
  return STAT.UNKNOWN;
};

const getTertiarySpell = (stat: STAT) => {
  switch (stat) {
    case STAT.LEECH:
      return SPELLS.LEECH.id;
    case STAT.AVOIDANCE:
      return SPELLS.AVOIDANCE.id;
    case STAT.SPEED:
      return SPELLS.SPEED.id;
    default:
      return null;
  }
};

interface Props {
  statTracker: StatTracker;
}

const CharacterStats = ({ statTracker }: Props) => {
  const renderStatValue = (stat: STAT) => {
    const rating = getStatRating(statTracker, stat);
    const percentage = getStatPercentage(statTracker, stat);

    return percentage === null
      ? formatThousands(rating)
      : `${formatPercentage(percentage)}% - ${formatThousands(rating)} rating`;
  };

  const mainStats: STAT[] = [
    getPrimaryStat(statTracker),
    STAT.STAMINA,
    STAT.CRITICAL_STRIKE,
    STAT.HASTE,
    STAT.MASTERY,
    STAT.VERSATILITY,
  ].filter((s: STAT) => statTracker.activeStats.includes(s));
  const tertiaries = [STAT.LEECH, STAT.AVOIDANCE, STAT.SPEED].filter((s) =>
    statTracker.activeStats.includes(s),
  );

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Tooltip
            content={
              <Trans id="shared.characterPanel.stats.pull.tooltip">
                These stats include any <strong>rating</strong> buffs, such as flasks, potions and
                other buffs. Percentage buffs such as Bloodlust are <strong>not</strong> included.
              </Trans>
            }
          >
            <h2 style={{ marginTop: 0 }}>
              <Trans id="shared.characterPanel.stats.pull">Stats on pull</Trans>
            </h2>
          </Tooltip>
        </div>
      </div>
      {mainStats.map((stat: STAT) => {
        const Icon = getIcon(stat);

        return (
          <div
            key={stat}
            className={`row ${getClassNameColor(stat)} stat-row`}
            style={{ marginBottom: '0.5em' }}
          >
            <div className="col-xs-2 text-right">
              <Icon />
            </div>
            <div className="col-xs-10">
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {getNameTranslated(stat)}
              </div>
              <div style={{ fontSize: '0.9em' }}>{renderStatValue(stat)}</div>
            </div>
          </div>
        );
      })}
      {tertiaries.map((stat) => {
        const tertiarySpell = getTertiarySpell(stat);
        if (getStatRating(statTracker, stat) <= 0) {
          return null;
        }
        if (!tertiarySpell) {
          return null;
        }
        return (
          <div
            key={stat}
            className={`row ${getClassNameColor(stat)}`}
            style={{ marginBottom: '0.5em' }}
          >
            <div className="col-xs-2 text-right">
              <SpellIcon
                spell={getTertiarySpell(stat)!}
                style={{ height: '2em', borderRadius: 2, marginTop: '0.5em' }}
              />
            </div>
            <div className="col-xs-10">
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {getNameTranslated(stat)}
              </div>
              <div style={{ fontSize: '0.9em' }}>{renderStatValue(stat)}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default CharacterStats;
