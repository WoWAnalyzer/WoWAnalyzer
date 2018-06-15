import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { formatNumber, formatPercentage } from 'common/format';
import { makePlainUrl } from 'Main/makeAnalyzerUrl';
import SpellIcon from 'common/SpellIcon';
import ItemLink from 'common/ItemLink';
import Icon from 'common/Icon';
import rankingColor from 'common/getRankingColor';
import ITEMS from 'common/ITEMS';
import { GEAR_SLOTS } from 'Parser/Core/Combatant';

const TRINKET_SLOTS = [GEAR_SLOTS.TRINKET1, GEAR_SLOTS.TRINKET2];

const styles = {
  icon: {
    width: '1.8em',
    height: '1.8em',
    marginRight: 2,
  },
};

class CharacterParsesList extends React.PureComponent {
  static propTypes = {
    parses: PropTypes.array.isRequired,
    class: PropTypes.string.isRequired,
    metric: PropTypes.string.isRequired,
  };

  iconPath(specName) {
    return `/specs/${this.props.class.replace(' ', '')}-${specName.replace(' ', '')}.jpg`;
  }

  itemFilter(item, index) {
    return TRINKET_SLOTS.includes(index) || item.quality === 'legendary';
  }
  renderItem(item) {
    return (
      <ItemLink
        key={item.id}
        id={item.id}
        className={item.quality}
        icon={false}
      >
        <Icon
          icon={ITEMS[item.id] ? ITEMS[item.id].icon : ITEMS[0].icon}
          style={{ ...styles.icon, border: '1px solid' }}
        />
      </ItemLink>
    );
  }
  formatPerformance(elem) {
    const { metric } = this.props;
    return `${formatNumber(elem.persecondamount)} ${metric.toLocaleUpperCase()} (${formatPercentage(elem.historical_percent / 100)}%)`;
  }

  render() {
    const { parses } = this.props;
    return (
      parses.map(elem => {
        const url = makePlainUrl(elem.report_code, elem.report_fight, elem.difficulty + ' ' + elem.name, elem.character_name);
        return (
          <Link
            key={url}
            to={url}
          >
            <div className="row character-parse">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-5" style={{ color: 'white' }}>
                    <img
                      src={this.iconPath(elem.spec)}
                      style={{ height: 30, marginRight: 10 }}
                      alt={elem.spec}
                    />
                    {elem.difficulty} - {elem.name}
                  </div>
                  <div className="col-md-5" style={{ height: 32 }}>
                    {elem.advanced && elem.talents.map(talent => (
                      <SpellIcon
                        key={talent.id}
                        id={talent.id}
                        style={styles.icon}
                      />
                    ))}
                  </div>
                  <div className="col-md-2" style={{ color: 'white', textAlign: 'right' }}>
                    {new Date(elem.start_time).toLocaleDateString()}
                  </div>
                </div>
                <div className="row">
                  <div className={`col-md-5 ${rankingColor(elem.historical_percent)}`} style={{ paddingLeft: 55 }}>
                    {this.formatPerformance(elem)}
                  </div>
                  <div className="col-md-5">
                    {elem.advanced && (
                      elem.gear
                        .filter(this.itemFilter)
                        .map(this.renderItem)
                    )}
                  </div>
                  <div className="col-md-2 text-right">
                    {elem.advanced && (
                      <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })
    );
  }
}

export default CharacterParsesList;
