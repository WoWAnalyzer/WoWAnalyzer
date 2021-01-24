import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { getLabel as getDifficultyLabel } from 'game/DIFFICULTIES';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'interface/SpellIcon';
import { ItemLink } from 'interface';
import Icon from 'interface/Icon';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import rankingColor from 'common/getRankingColor';
import { makePlainUrl } from 'interface/makeAnalyzerUrl';

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
    trinkets: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

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
          icon={this.props.trinkets[item.id] ? this.props.trinkets[item.id].icon : this.props.trinkets[0].icon}
          style={{ ...styles.icon, border: '1px solid' }}
        />
      </ItemLink>
    );
  }
  formatPerformance(elem) {
    const { metric } = this.props;
    return `${formatNumber(elem.persecondamount)} ${metric.toLocaleUpperCase()} (${formatPercentage(elem.historical_percent / 100, 0)}%)`;
  }

  render() {
    const { parses } = this.props;
    return (
      <ul className="list parses-list">
        {parses.map(elem => {
          const url = makePlainUrl(elem.report_code, elem.report_fight, elem.difficulty + ' ' + elem.name, elem.advanced ? elem.character_name : '');
          return (
            <li key={url}>
              <Link to={url}>
                <div className="row">
                  <div className="col-md-4" style={{ color: 'white' }}>
                    <div>
                      <img
                        className="spec-icon"
                        src={this.iconPath(elem.spec)}
                        alt={elem.spec}
                      />
                      <span className="difficulty">{getDifficultyLabel(elem.difficulty)}</span>
                      <span className="boss">{elem.name}</span>
                    </div>
                  </div>
                  <div className="col-md-2 text-right">
                    <div className={rankingColor(elem.historical_percent / 100)}>
                      {this.formatPerformance(elem)}
                    </div>
                  </div>
                  <div className="col-md-1 text-right">
                    {elem.advanced && (
                      elem.gear
                        .filter(this.itemFilter)
                        .map(this.renderItem)
                    )}
                  </div>
                  <div className="col-md-3">
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
                    {elem.advanced && (
                      <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" style={{ marginLeft: 10 }} />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default CharacterParsesList;
