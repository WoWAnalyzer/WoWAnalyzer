import { Trans } from '@lingui/react/macro';
import { defineMessage } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import CombatLogParser from 'parser/core/CombatLogParser';
import Statistic, { StatisticSize } from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { Fragment, JSXElementConstructor, ReactElement } from 'react';
import Masonry_ from 'react-masonry-component';

// Masonry has a type issue with react 19
const Masonry = Masonry_ as unknown as React.ComponentClass<
  React.ComponentProps<typeof Masonry_> & { children: React.ReactNode }
>;

import FightDowntimeToggle from './FightDowntimeToggle';
import StatisticsSectionTitle from './StatisticsSectionTitle';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

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

type StatisticElement = ReactElement<
  React.ComponentProps<typeof Statistic>,
  JSXElementConstructor<React.ComponentProps<typeof Statistic>> & {
    defaultProps?: Partial<React.ComponentProps<typeof Statistic>>;
  }
>;

interface Props {
  parser: CombatLogParser;
  statistics: StatisticElement[];
  adjustForDowntime: boolean;
  onChangeAdjustForDowntime: (newValue: boolean) => void;
}

// FIXME: this is a massive hack around ancient prop introspection code.
// modern react doesn't really support this, at least in the case of `defaultProps`.
// we're doing some light "lying to the type system" to make it work.
function statisticElementCategory(el: StatisticElement): STATISTIC_CATEGORY {
  if (el.props.category) {
    return el.props.category;
  }

  if (el.type.defaultProps?.category) {
    return el.type.defaultProps.category;
  }

  return STATISTIC_CATEGORY.GENERAL;
}

const ReportStatistics = ({
  parser,
  statistics,
  adjustForDowntime,
  onChangeAdjustForDowntime,
}: Props) => {
  const groups = statistics.reduce<Record<string, StatisticElement[]>>((obj, statistic) => {
    const category = statisticElementCategory(statistic);
    obj[category] = obj[category] || [];
    obj[category].push(statistic);
    return obj;
  }, {});
  const panels = groups[STATISTIC_CATEGORY.PANELS];
  const { i18n } = useLingui();
  delete groups[STATISTIC_CATEGORY.PANELS];
  const categoryByIndex = Object.values(STATISTIC_CATEGORY); // objects have a guaranteed order

  const sortByPosition = (a: StatisticElement, b: StatisticElement) => {
    if (a.props.position !== b.props.position) {
      return (
        (a.props.position ?? STATISTIC_ORDER.DEFAULT) -
        (b.props.position ?? STATISTIC_ORDER.DEFAULT)
      );
    }
    return sizeToInt(b.props.size ?? 'standard') - sizeToInt(a.props.size ?? 'standard');
  };

  return (
    <div className="container">
      <div className="panel" style={{ backgroundColor: 'hsl(44, 7%, 8%)' }}>
        <div className="panel-body pad">
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
      </div>
    </div>
  );
};

export default ReportStatistics;
