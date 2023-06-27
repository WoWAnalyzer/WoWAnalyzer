
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
  switch (stat) {
    case STAT.STRENGTH:
      return statTracker.startingStrengthRating;
    case STAT.AGILITY:
      return statTracker.startingAgilityRating;
    case STAT.INTELLECT:
      return statTracker.startingIntellectRating;
    case STAT.STAMINA:
      return statTracker.startingStaminaRating;
    case STAT.CRITICAL_STRIKE:
      return statTracker.startingCritRating;
    case STAT.HASTE:
      return statTracker.startingHasteRating;
    case STAT.MASTERY:
      return statTracker.startingMasteryRating;
    case STAT.VERSATILITY:
      return statTracker.startingVersatilityRating;
    case STAT.LEECH:
      return statTracker.startingLeechRating;
    case STAT.AVOIDANCE:
      return statTracker.startingAvoidanceRating;
    case STAT.SPEED:
      return statTracker.startingSpeedRating;
    default:
      return 0;
  }
};

const getStatPercentage = (statTracker: StatTracker, stat: STAT) => {
  switch (stat) {
    case STAT.CRITICAL_STRIKE:
      return statTracker.critPercentage(statTracker.startingCritRating, true);
    case STAT.HASTE:
      return statTracker.hastePercentage(statTracker.startingHasteRating, true);
    case STAT.MASTERY:
      return statTracker.hasMasteryCoefficient
        ? statTracker.masteryPercentage(statTracker.startingMasteryRating, true)
        : null;
    case STAT.VERSATILITY:
      return statTracker.versatilityPercentage(statTracker.startingVersatilityRating, true);
    case STAT.LEECH:
      return statTracker.leechPercentage(statTracker.startingLeechRating, true);
    case STAT.AVOIDANCE:
      return statTracker.avoidancePercentage(statTracker.startingAvoidanceRating, true);
    case STAT.SPEED:
      return statTracker.speedPercentage(statTracker.startingSpeedRating, true);
    default:
      return null;
  }
};

const getPrimaryStat = (statTracker: StatTracker) => {
  if (
    statTracker.startingStrengthRating > statTracker.startingAgilityRating &&
    statTracker.startingStrengthRating > statTracker.startingIntellectRating
  ) {
    return STAT.STRENGTH;
  }
  if (
    statTracker.startingAgilityRating > statTracker.startingStrengthRating &&
    statTracker.startingAgilityRating > statTracker.startingIntellectRating
  ) {
    return STAT.AGILITY;
  }
  if (
    statTracker.startingIntellectRating > statTracker.startingStrengthRating &&
    statTracker.startingIntellectRating > statTracker.startingAgilityRating
  ) {
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
              <>
                These stats include any <strong>rating</strong> buffs, such as flasks, potions and
                other buffs. Percentage buffs such as Bloodlust are <strong>not</strong> included.
              </>
            }
          >
            <h2 style={{ marginTop: 0 }}>
              <>Stats on pull</>
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
