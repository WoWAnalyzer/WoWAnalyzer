import React from 'react';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-component';
import Toggle from 'react-toggle';
import { t, Trans } from '@lingui/macro';

import { i18n } from 'interface/RootLocalizationProvider';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatisticsSectionTitle from './StatisticsSectionTitle';

class Statistics extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
  };
  state = {
    // TODO: Implement
    adjustForDowntime: false,
  };

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
          <Trans>Adjust statistics for <dfn data-tip={i18n._(t`Fight downtime is any forced downtime caused by fight mechanics or dying. Downtime caused by simply not doing anything is not included.`)}>fight downtime</dfn> (<dfn data-tip={i18n._(t`We're still working out the kinks of this feature, some modules might output weird results with this on. When we're finished this will be enabled by default.`)}>experimental</dfn>)</Trans>
        </label>
      </div>
    );
  }
  renderStatisticGroupName(key) {
    switch (key) {
      case STATISTIC_CATEGORY.GENERAL: return i18n._(t`Statistics`);
      case STATISTIC_CATEGORY.TALENTS: return i18n._(t`Talents`);
      case STATISTIC_CATEGORY.AZERITE_POWERS: return i18n._(t`Azerite Powers`);
      case STATISTIC_CATEGORY.ITEMS: return i18n._(t`Items`);
      default: throw new Error(`Unknown category: ${key}`);
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

    return (
      <>
        {Object.keys(groups).map(name => {
          const statistics = groups[name];
          return (
            <React.Fragment key={name}>
              <StatisticsSectionTitle
                rightAddon={name === STATISTIC_CATEGORY.GENERAL && parser.hasDowntime && this.renderFightDowntimeToggle()}
              >
                {this.renderStatisticGroupName(name)}
              </StatisticsSectionTitle>

              <Masonry className="row statistics">
                {statistics.sort((a, b) => a.props.position - b.props.position)}
              </Masonry>
            </React.Fragment>
          );
        })}
      </>
    );
  }
}

export default Statistics;
