import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import ITEMS from 'common/ITEMS';
import fetchWcl from 'common/fetchWclApi';
import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import ActivityIndicator from 'Interface/common/ActivityIndicator';

/**
 * Show statistics (talents and trinkets) for the current boss, specID and difficulty
 */
class EncounterStats extends React.PureComponent {
  static propTypes = {
    currentBoss: PropTypes.number.isRequired,
    spec: PropTypes.number.isRequired,
    difficulty: PropTypes.number.isRequired,
  };

  LIMIT = 100;
  SHOW_TOP_ENTRYS = 6;
  SHOW_TOP_ENTRYS_AZERITE = 10;
  metric = 'dps';
  amountOfParses = 0;

  constructor(props) {
    super(props);
    this.state = {
      mostUsedTrinkets: [],
      mostUsedTalents: [],
      items: ITEMS,
      loaded: false,
      message: 'Loading statistics...',
    };

    this.load = this.load.bind(this);
    this.load();
  }

  addItem(array, item) {
    //add item to arry or increase amount by one if it exists
    if (item.id === null || item.id === 0) {
      return array;
    }
    const index = array.findIndex(elem => elem.id === item.id);
    if (index === -1) {
      array.push({
        id: item.id,
        name: item.name.replace(/\\'/g, '\''),
        quality: item.quality,
        icon: item.icon,
        amount: 1,
      });
    } else {
      array[index].amount += 1;
    }

    return array;
  }

  load() {
    switch (SPECS[this.props.spec].role) {
      case ROLES.HEALER:
        this.metric = 'hps';
        break;

      default:
        this.metric = 'dps';
        break;
    }

    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7); // current calendar-week

    return fetchWcl(`rankings/encounter/${this.props.currentBoss}`, {
      class: SPECS[this.props.spec].ranking.class,
      spec: SPECS[this.props.spec].ranking.spec,
      difficulty: this.props.difficulty,
      limit: this.LIMIT,
      metric: this.metric,
      cache: currentWeek, // cache for a week
    }).then((stats) => {
      const talentCounter = [[], [], [], [], [], [], []];
      const talents = [];
      let trinkets = [];
      let azerite = [];

      stats.rankings.forEach(rank => {
        rank.talents.forEach((talent, index) => {
          if (talent.id !== null && talent.id !== 0) {
            talentCounter[index].push(talent.id);
          }
        });

        rank.gear.forEach((item, itemSlot) => {
          if (itemSlot === 12 || itemSlot === 13) {
            trinkets = this.addItem(trinkets, item);
          }
        });

        rank.azeritePowers.forEach((azeritePower) => {
          azerite = this.addItem(azerite, azeritePower);
        });
      });

      talentCounter.forEach(row => {
        const talentRow = row.reduce((prev, cur) => {
          prev[cur] = (prev[cur] || 0) + 1;
          return prev;
        }, {});
        talents.push(talentRow);
      });

      trinkets.sort((a, b) => {
        return (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0);
      });

      azerite.sort((a, b) => {
        return (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0);
      });

      this.setState({
        mostUsedTrinkets: trinkets.slice(0, this.SHOW_TOP_ENTRYS),
        mostUsedAzerite: azerite.slice(0, this.SHOW_TOP_ENTRYS_AZERITE),
        mostUsedTalents: talents,
        loaded: true,
      });

      //fetch all missing icons from bnet-api and display them
      this.fillMissingIcons();

    }).catch((err) => {
      this.setState({
        message: 'Something went wrong.',
      });
    });
  }

  fillMissingIcons() {
    this.state.mostUsedTrinkets.forEach(trinket => {
      if (ITEMS[trinket.id] === undefined) {
        return fetch(`https://eu.api.battle.net/wow/item/${trinket.id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
          .then(response => response.json())
          .then(data => {
            const updatedItems = this.state.items;
            updatedItems[trinket.id] = {
              icon: data.icon,
              id: trinket.id,
              name: trinket.name,
            };

            this.setState({
              items: updatedItems,
            });

            this.forceUpdate();
          });
      }
      return null;
    });
  }

  singleItem(item) {
    return (
      <div key={item.id} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row">
          <div className="col-md-2" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}>
            {formatPercentage(item.amount / Math.min(this.LIMIT, this.amountOfParses), 0)}%
          </div>
          <div className="col-md-10">
            <ItemLink id={item.id} className={item.quality} icon={false}>
              <Icon
                icon={this.state.items[item.id] === undefined ? this.state.items[0].icon : this.state.items[item.id].icon}
                className={item.quality}
                style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
              />
              {item.name}
            </ItemLink>
          </div>
        </div>
      </div>
    );
  }

  singleTrait(trait) {
    return (
      <div key={trait.id} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row">
          <div className="col-md-2" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}>
            {trait.amount}x
          </div>
          <div className="col-md-10">
            <SpellLink id={trait.id} icon={false}>
              <Icon
                icon={trait.icon}
                style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
              />
              {trait.name}
            </SpellLink>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const rows = [15, 30, 45, 60, 75, 90, 100];

    if (!this.state.loaded) {
      return (
        <div className="panel-heading" style={{ marginTop: 40, padding: 20, boxShadow: 'none', borderBottom: 0 }}>
          <ActivityIndicator text={this.state.message} />
        </div>
      );
    }
    // If there are below 100 parses for a given spec, use this amount to divide with to get accurate percentages.
    // This also enables us to work around certain logs being anonymised - as this will then ignore those, and cause us to divide by 99, making our percentages accurate again.
    this.amountOfParses = Object.values(this.state.mostUsedTalents[0]).reduce((a, b) => a + b);
    return (
      <React.Fragment>
        <div className="panel-heading" style={{ padding: 20, marginBottom: '2em' }}>
          <h2>Statistics of this fight of the top {Math.min(this.LIMIT, this.amountOfParses)} logs, ranked by {this.metric.toLocaleUpperCase()}</h2>
        </div>
        <div className="row">
          <div className="col-md-12" style={{ padding: '0 30px' }}>
            <div className="row">
              <div className="col-md-6">
                <div className="row" style={{ marginBottom: '2em' }}>
                  <div className="col-md-12">
                    <h2>Most used Trinkets</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.mostUsedTrinkets.map(trinket => this.singleItem(trinket))}
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  <div className="col-md-12">
                    <h2>Most used Azerite Traits</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.mostUsedAzerite.map(trinket => this.singleTrait(trinket))}
                </div>
              </div>
              <div className="col-md-6">
                <div className="row" style={{ marginBottom: '2em' }}>
                  <div className="col-md-12">
                    <h2>Most used Talents</h2>
                  </div>
                </div>
                {this.state.mostUsedTalents.map((row, index) => (
                  <div className="row" key={index} style={{ marginBottom: 15, paddingLeft: 20 }}>
                    <div className="col-lg-1 col-xs-2" style={{ lineHeight: '3em', textAlign: 'right' }}>{rows[index]}</div>
                    {Object.keys(row).sort((a, b) => row[b] - row[a]).map((talent, talentIndex) => (
                      <div key={talentIndex} className="col-lg-2 col-xs-3" style={{ textAlign: 'center' }}>
                        <SpellLink id={Number(talent)} icon={false}>
                          <SpellIcon style={{ width: '3em', height: '3em' }} id={Number(talent)} noLink />
                        </SpellLink>
                        <span style={{ textAlign: 'center', display: 'block' }}>{formatPercentage(row[talent] / Math.min(this.LIMIT, this.amountOfParses), 0)}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default EncounterStats;
