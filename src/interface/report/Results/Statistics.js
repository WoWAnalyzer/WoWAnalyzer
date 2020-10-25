import React from 'react';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-component';
import Toggle from 'react-toggle';
import { t, Trans } from '@lingui/macro';

import { TooltipElement } from 'common/Tooltip';
import { i18n } from 'interface/RootLocalizationProvider';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import StatisticsSectionTitle from './StatisticsSectionTitle';

function sizeToInt(size) {
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

class Statistics extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
  };
  state = {
    // TODO: Implement
    adjustForDowntime: false,
  };

  sortByPosition(a, b) {
    if (a.props.position !== b.props.position) {
      return a.props.position - b.props.position;
    }
    return sizeToInt(b.props.size) - sizeToInt(a.props.size);
  }

  renderFightDowntimeToggle() {
    return (
      <div className="toggle-control" style={{ marginTop: 5 }}>
        <Toggle
          defaultChecked={this.state.adjustForDowntime}
          icons={false}
          onChange={event => this.setState({ adjustForDowntime: event.target.checked })}
          id="adjust-for-downtime-toggle"
        />
        <label htmlFor="adjust-for-downtime-toggle">
          <Trans>
            Adjust statistics for <TooltipElement content={i18n._(t`Fight downtime is any forced downtime caused by fight mechanics or dying. Downtime caused by simply not doing anything is not included.`)}>fight downtime</TooltipElement> (<TooltipElement content={i18n._(t`We're still working out the kinks of this feature, some modules might output weird results with this on. When we're finished this will be enabled by default.`)}>experimental</TooltipElement>)
          </Trans>
        </label>
      </div>
    );
  }
  renderStatisticGroupName(key) {
    switch (key) {
      case STATISTIC_CATEGORY.GENERAL:
        return i18n._(t`Statistics`);
      case STATISTIC_CATEGORY.TALENTS:
        return i18n._(t`Talents`);
      case STATISTIC_CATEGORY.COVENANTS:
        return i18n._(t`Covenants`);
      case STATISTIC_CATEGORY.AZERITE_POWERS:
        return i18n._(t`Azerite Powers`);
      case STATISTIC_CATEGORY.ITEMS:
        return i18n._(t`Items`);
      default:
        throw new Error(`Unknown category: ${key}`);
    }
  }
  render() {
    const { parser, children } = this.props;

    const groups = children.reduce((obj, statistic) => {
      const category = statistic.props.category || STATISTIC_CATEGORY.GENERAL;
      obj[category] = obj[category] || [];
      obj[category].push(statistic);
      return obj;
    }, {});
    const panels = groups[STATISTIC_CATEGORY.PANELS];
    delete groups[STATISTIC_CATEGORY.PANELS];
    const categoryByIndex = Object.values(STATISTIC_CATEGORY); // objects have a guaranteed order

    return (
      <div className="container">
        {/* eslint-disable-next-line no-restricted-syntax */}
        {Object.keys(groups).sort((a, b) => categoryByIndex.indexOf(a) - categoryByIndex.indexOf(b)).map(name => {
          const statistics = groups[name];
          return (
            <React.Fragment key={name}>
              <StatisticsSectionTitle
                rightAddon={name === STATISTIC_CATEGORY.GENERAL && parser.hasDowntime && this.renderFightDowntimeToggle()}
              >
                {this.renderStatisticGroupName(name)}
              </StatisticsSectionTitle>

              <Masonry className="row statistics">
                {/* Masonry uses the first div to determine its column width */}
                <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" />
                {/* And we need this second div to use the rest of the space so masonry layouts the first item first */}
                <div className="col-lg-9 col-md-8 col-sm-6 hidden-xs" />
                {statistics.sort(this.sortByPosition)}
              </Masonry>
            </React.Fragment>
          );
        })}

        {panels && panels.length > 0 && (
          <StatisticsSectionTitle>
            Details
          </StatisticsSectionTitle>
        )}

        {panels && panels.sort(this.sortByPosition)}
      </div>
    );
  }
}

export default Statistics;
