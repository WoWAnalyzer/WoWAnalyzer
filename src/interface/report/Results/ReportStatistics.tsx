import { defineMessage, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import CombatLogParser from 'parser/core/CombatLogParser';
import { StatisticSize } from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { Fragment, ReactElement } from 'react';
import Masonry from 'react-masonry-component';

import FightDowntimeToggle from './FightDowntimeToggle';
import StatisticsSectionTitle from './StatisticsSectionTitle';

function sizeToInt(size: StatisticSize) {
  switch (size) {
    case 'standard':
      return 0;
    case 'small':
      return -2;
    case 'medium':
      return -1;
    case 'large':
      return 2;
    case 'flexible':
      return 1;
    default:
      return 0;
  }
}

const getStatisticGroupName = (key: STATISTIC_CATEGORY) => {
  switch (key) {
    case STATISTIC_CATEGORY.GENERAL:
      return defineMessage({
        id: 'interface.report.results.statistics.statistics',
        message: `Statistics`,
      });
    case STATISTIC_CATEGORY.TALENTS:
      return defineMessage({
        id: 'interface.report.results.statistics.talents',
        message: `Talents`,
      });
    case STATISTIC_CATEGORY.ITEMS:
      return defineMessage({
        id: 'interface.report.results.statistics.items',
        message: `Items`,
      });
    case STATISTIC_CATEGORY.THEORYCRAFT:
      return defineMessage({
        id: 'interface.report.results.statistics.theorycraft',
        message: `Theorycraft`,
      });
    case STATISTIC_CATEGORY.HERO_TALENTS:
      return defineMessage({
        id: 'interface.report.results.statistics.hero_talents',
        message: `Hero Talents`,
      });
    default:
      throw new Error(`Unknown category: ${key}`);
  }
};

interface Props {
  parser: CombatLogParser;
  statistics: ReactElement[];
  adjustForDowntime: boolean;
  onChangeAdjustForDowntime: (newValue: boolean) => void;
}

const ReportStatistics = ({
  parser,
  statistics,
  adjustForDowntime,
  onChangeAdjustForDowntime,
}: Props) => {
  const groups = statistics.reduce<{
    [category: string]: ReactElement[];
  }>((obj, statistic) => {
    const category = statistic.props.category || STATISTIC_CATEGORY.GENERAL;
    obj[category] = obj[category] || [];
    obj[category].push(statistic);
    return obj;
  }, {});
  const panels = groups[STATISTIC_CATEGORY.PANELS];
  const { i18n } = useLingui();
  delete groups[STATISTIC_CATEGORY.PANELS];
  const categoryByIndex = Object.values(STATISTIC_CATEGORY); // objects have a guaranteed order

  const sortByPosition = (a: ReactElement, b: ReactElement) => {
    if (a.props.position !== b.props.position) {
      return a.props.position - b.props.position;
    }
    return sizeToInt(b.props.size) - sizeToInt(a.props.size);
  };

  return (
    <div className="container">
      {/* eslint-disable-next-line no-restricted-syntax */}
      {(Object.keys(groups) as STATISTIC_CATEGORY[])
        .sort((a, b) => categoryByIndex.indexOf(a) - categoryByIndex.indexOf(b))
        .map((name) => {
          const statistics = groups[name];
          return (
            <Fragment key={name}>
              <StatisticsSectionTitle
                rightAddon={
                  name === STATISTIC_CATEGORY.GENERAL &&
                  parser.hasDowntime && (
                    <FightDowntimeToggle
                      initialValue={adjustForDowntime}
                      onChange={onChangeAdjustForDowntime}
                      style={{ marginTop: 5 }}
                    />
                  )
                }
              >
                {i18n._(getStatisticGroupName(name))}
              </StatisticsSectionTitle>

              <Masonry className="row statistics">
                {/* Masonry uses the first div to determine its column width */}
                <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" />
                {/* And we need this second div to use the rest of the space so masonry layouts the first item first */}
                <div className="col-lg-9 col-md-8 col-sm-6 hidden-xs" />
                {statistics.sort(sortByPosition)}
              </Masonry>
            </Fragment>
          );
        })}

      {panels && panels.length > 0 && (
        <StatisticsSectionTitle>
          <Trans id="report.statistics.details">Details</Trans>
        </StatisticsSectionTitle>
      )}

      {panels && panels.sort(sortByPosition)}
    </div>
  );
};

export default ReportStatistics;
