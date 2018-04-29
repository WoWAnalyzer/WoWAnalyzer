import React  from 'react';
import PropTypes from 'prop-types';

import { formatNumber, formatPercentage } from 'common/format';
import { makePlainUrl } from 'Main/makeAnalyzerUrl';
import SpellIcon from 'common/SpellIcon';
import ItemLink from 'common/ItemLink';
import Icon from 'common/Icon';
import rankingColor from 'common/getRankingColor';
import ITEMS from 'common/ITEMS';

const TRINKET_SLOTS = [12, 13];

class CharacterParsesList extends React.PureComponent {
  static propTypes = {
    parses: PropTypes.array.isRequired,
    class: PropTypes.string.isRequired,
    metric: PropTypes.string.isRequired,
  };

  iconPath(specName) {
    return `/specs/${this.props.class.replace(" ", "")}-${specName.replace(" ", "")}.jpg`;
  }

  render() {
    return (
      this.props.parses.map((elem, index) => 
        <a href={makePlainUrl(elem.report_code, elem.report_fight, elem.difficulty + " " + elem.name, elem.character_name)} target="_blank" key={`${elem.report_code} ${elem.report_fight}`}>
          <div className="row character-parse" key={elem.report_code + elem.report_fight}>
            <div className="col-md-5" style={{ color: 'white' }}>
              <img src={this.iconPath(elem.spec)} style={{ height: 30, marginRight: 10 }} alt="Icon" />
              {elem.difficulty} - {elem.name}
            </div>
            <div className="col-md-5" style={{ height: 32 }}>
              {elem.advanced && elem.talents.map(talent => 
                <SpellIcon 
                  key={talent.id}
                  id={talent.id}
                  style={{ width: '1.8em', height: '1.8em', marginRight: 2 }}
                />
              )}
            </div>
            <div className="col-md-2" style={{ color: 'white', textAlign: 'right' }}>
              {new Date(elem.start_time).toLocaleDateString()}
            </div>
            
            <div className="col-md-5" style={{ paddingLeft: 55 }}>
              <span className={rankingColor(elem.historical_percent)}>
                {formatNumber(elem.persecondamount)} {this.props.metric.toLocaleUpperCase()} ({formatPercentage(elem.historical_percent / 100)}%)
              </span>
            </div>
            <div className="col-md-5">
              {elem.advanced && elem.gear.filter((item, index) => index === TRINKET_SLOTS[0] || index === TRINKET_SLOTS[1] || item.quality === "legendary").map(item =>
                <ItemLink id={item.id} key={item.id} className={item.quality} icon={false} >
                  <Icon 
                    icon={ITEMS[item.id] ? ITEMS[item.id].icon : ITEMS[0].icon} 
                    style={{ width: '1.8em', height: '1.8em', border: '1px solid', marginRight: 2 }}
                  />
                </ItemLink>
              )}
            </div>
            <div className="col-md-2" style={{ textAlign: 'right' }}>
              {elem.advanced && (
                <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
              )}
            </div>
          </div>
        </a>
      )
    );
  }
}

export default CharacterParsesList;