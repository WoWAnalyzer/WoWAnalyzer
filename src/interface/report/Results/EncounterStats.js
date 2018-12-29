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
import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import ActivityIndicator from 'interface/common/ActivityIndicator';
import { makeItemApiUrl } from 'common/makeApiUrl';
/**
 * Show statistics (talents and trinkets) for the current boss, specID and difficulty
 */

const LEVEL_15_TALENT_ROW_INDEX = 0;

class EncounterStats extends React.PureComponent {
  static propTypes = {
    currentBoss: PropTypes.number.isRequired,
    spec: PropTypes.number.isRequired,
    difficulty: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
  };

  LIMIT = 100; //Currently does nothing but if Kihra reimplements it'd be nice to have
  SHOW_TOP_ENTRYS = 6;
  SHOW_TOP_ENTRYS_AZERITE = 10;
  SHOW_CLOSEST_KILL_TIME_LOGS = 10;
  metric = 'dps';
  amountOfParses = 0;
  durationVariancePercentage = 0.2; //Marked in % to allow for similiar filtering on long/short fights

  constructor(props) {
    super(props);
    this.state = {
      mostUsedTrinkets: [],
      mostUsedTalents: [],
      similiarKillTimes: [],
      closestKillTimes: [],
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
      limit: this.LIMIT, //Currently does nothing but if Kihra reimplements it'd be nice to have
      metric: this.metric,
      cache: currentWeek, // cache for a week
    }).then((stats) => {
      const talentCounter = [[], [], [], [], [], [], []];
      const talents = [];
      let trinkets = [];
      let azerite = [];
      const similiarKillTimes = []; //These are the reports within the defined variance of the analyzed log
      const closestKillTimes = []; //These are the reports closest to the analyzed log regardless of it being within variance or not

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

        if (this.props.duration > rank.duration * (1 - this.durationVariancePercentage) && this.props.duration < rank.duration * (1 + this.durationVariancePercentage)) {
          similiarKillTimes.push({ rank, variance: rank.duration - this.props.duration > 0 ? rank.duration - this.props.duration : this.props.duration - rank.duration });
        }
        closestKillTimes.push({ rank, variance: rank.duration - this.props.duration > 0 ? rank.duration - this.props.duration : this.props.duration - rank.duration });
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

      similiarKillTimes.sort((a, b) => {
        return a.variance - b.variance;
      });

      closestKillTimes.sort((a, b) => {
        return a.variance - b.variance;
      });

      this.setState({
        mostUsedTrinkets: trinkets.slice(0, this.SHOW_TOP_ENTRYS),
        mostUsedAzerite: azerite.slice(0, this.SHOW_TOP_ENTRYS_AZERITE),
        mostUsedTalents: talents,
        similiarKillTimes: similiarKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
        closestKillTimes: closestKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
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
        return fetch(makeItemApiUrl(trinket.id))
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
          })
          .catch(err => {
          }); // ignore errors;
      }
      return null;
    });
  }

  singleItem(item) {
    return (
      <div key={item.id} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row">
          <div className="col-md-2" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}>
            {formatPercentage(item.amount / this.amountOfParses, 0)}%
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

  singleLog(log) {
    return (
      <div key={log.reportID} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em' }}>
          <div className="flex-column col-md-6">
            <a
              href={`https://wowanalyzer.com/report/${log.reportID}/${log.fightID}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                {log.name} ({log.itemLevel})
              </div>
            </a>
            <div>
              {formatDuration(log.duration / 1000)} ({log.duration > this.props.duration ? ((log.duration - this.props.duration) / 1000).toFixed(1) + 's slower' : ((this.props.duration - log.duration) / 1000).toFixed(1) + 's faster'})
            </div>
          </div>
          <div className="col-md-6">
            {formatThousands(log.total)} DPS
          </div>
        </div>
      </div>
    );
  }

  similiarLogs() {
    return (
      <div className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        {this.state.similiarKillTimes.length > 1 ? 'These are' : 'This is'} the {this.state.similiarKillTimes.length} top {this.amountOfParses} {this.state.similiarKillTimes.length > 1 ? 'logs' : 'log'} that {this.state.similiarKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time within {formatPercentage(this.durationVariancePercentage, 0)}% variance.
        {this.state.closestKillTimes.map(log => this.singleLog(log.rank))}
      </div>
    );
  }

  closestLogs() {
    return (
      <div className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        {this.state.closestKillTimes.length > 1 ? 'These are' : 'This is'} the {this.state.closestKillTimes.length} top {this.amountOfParses} {this.state.closestKillTimes.length > 1 ? 'logs' : 'log'} that {this.state.closestKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time. Large differences won't be good for comparing.
        {this.state.closestKillTimes.map(log => this.singleLog(log.rank))}
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
    this.amountOfParses = Object.values(this.state.mostUsedTalents[LEVEL_15_TALENT_ROW_INDEX]).reduce((total, parses) => total + parses);
    return (
      <>
        <div className="panel-heading" style={{ padding: 20, marginBottom: '2em' }}>
          <h2>Statistics for this fight using the top {this.amountOfParses} logs, ranked by {this.metric.toLocaleUpperCase()}</h2>
        </div>
        <div className="row">
          <div className="col-md-12" style={{ padding: '0 30px' }}>
            <div className="row">
              <div className="col-md-4">
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
                  {this.state.mostUsedAzerite.map(azerite => this.singleTrait(azerite))}
                </div>
              </div>
              <div className="col-md-4">
                <div className="row" style={{ marginBottom: '2em' }}>
                  <div className="col-md-12">
                    <h2>Most used Talents</h2>
                  </div>
                </div>
                {this.state.mostUsedTalents.map((row, index) => (
                  <div className="row" key={index} style={{ marginBottom: 15, paddingLeft: 20 }}>
                    <div className="col-lg-1 col-xs-2" style={{ lineHeight: '3em', textAlign: 'right' }}>{rows[index]}</div>
                    {Object.keys(row).sort((a, b) => row[b] - row[a]).map((talent, talentIndex) => (
                      <div key={talentIndex} className="col-lg-3 col-xs-4" style={{ textAlign: 'center' }}>
                        <SpellLink id={Number(talent)} icon={false}>
                          <SpellIcon style={{ width: '3em', height: '3em' }} id={Number(talent)} noLink />
                        </SpellLink>
                        <span style={{ textAlign: 'center', display: 'block' }}>{formatPercentage(row[talent] / this.amountOfParses, 0)}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="col-md-4">
                <div className="row" style={{ marginBottom: '2em' }}>
                  <div className="col-md-12">
                    <h2>{this.state.similiarKillTimes.length > 0 ? 'Similiar' : 'Closest'} kill times</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.similiarKillTimes.length > 0 ? this.similiarLogs() : ''}
                  {this.state.similiarKillTimes.length === 0 && this.state.closestKillTimes.length > 0 ? this.closestLogs() : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default EncounterStats;
