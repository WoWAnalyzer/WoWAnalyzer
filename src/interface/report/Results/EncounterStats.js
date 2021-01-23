import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import Icon from 'interface/Icon';
import { ItemLink } from 'interface';
import SpellLink from 'interface/SpellLink';
import SpellIcon from 'interface/SpellIcon';
import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import ActivityIndicator from 'interface/ActivityIndicator';
import { makeItemApiUrl } from 'common/makeApiUrl';
import { Trans } from '@lingui/macro';
import Combatant from 'parser/core/Combatant';
import { getCovenantById } from 'game/shadowlands/COVENANTS';
import SOULBINDS from 'game/shadowlands/SOULBINDS';

/**
 * Show statistics (talents and trinkets) for the current boss, specID and difficulty
 */

  // TODO: Clean this file up and split it into multiple files to make it much more maintainable in the future
const LEVEL_15_TALENT_ROW_INDEX = 0;

class EncounterStats extends React.PureComponent {
  static propTypes = {
    currentBoss: PropTypes.number.isRequired,
    spec: PropTypes.number.isRequired,
    difficulty: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    combatant: PropTypes.instanceOf(Combatant).isRequired,
  };

  LIMIT = 100; //Currently does nothing but if Kihra reimplements it'd be nice to have
  SHOW_TOP_ENTRYS = 6;
  SHOW_CLOSEST_KILL_TIME_LOGS = 10;
  metric = 'dps';
  amountOfParses = 0;
  durationVariancePercentage = 0.2; //Marked in % to allow for similiar filtering on long/short fights

  constructor(props) {
    super(props);
    this.state = {
      mostUsedTalents: [],
      mostUsedTrinkets: [],
      mostUsedLegendaries: [],
      mostUsedConduits: [],
      mostUsedCovenants: [],
      similiarKillTimes: [],
      closestKillTimes: [],
      items: ITEMS,
      spells: SPELLS,
      loaded: false,
      message: 'Loading statistics...',
    };

    this.load = this.load.bind(this);
    this.load();
  }

  addItem(array, item) {
    //add item to array or increase amount by one if it exists
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

  addSpell(array, spell) {
    //add spell to array or increase amount by one if it exists
    if (spell.id === null || spell.id === 0) {
      return array;
    }
    const index = array.findIndex(elem => elem.id === spell.id);
    if (index === -1) {
      array.push({
        id: spell.id,
        name: spell.name.replace(/\\'/g, '\''),
        icon: spell.icon,
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
      includeCombatantInfo: true,
    }).then((stats) => {
      const talentCounter = [[], [], [], [], [], [], []];
      const talents = [];
      let trinkets = [];
      let legendaries = [];
      let conduits = [];
      const covenants = [];
      const similiarKillTimes = []; //These are the reports within the defined variance of the analyzed log
      const closestKillTimes = []; //These are the reports closest to the analyzed log regardless of it being within variance or not
      const combatantName = this.props.combatant._combatantInfo.name;

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

        rank.legendaryEffects && rank.legendaryEffects.forEach(legendaryEffect => {
          legendaries = this.addSpell(legendaries, legendaryEffect);
        });

        rank.conduitPowers && rank.conduitPowers.forEach(conduit => {
          conduits = this.addSpell(conduits, conduit);
        });

        if (rank.covenantID) {
          if (covenants[rank.covenantID]) {
            covenants[rank.covenantID].amount += 1;
          } else {
            covenants[rank.covenantID] = { id: rank.covenantID, amount: 1, soulbinds: [] };
          }
        }

        if (rank.soulbindID) {
          if (covenants[rank.covenantID].soulbinds[rank.soulbindID]) {
            covenants[rank.covenantID].soulbinds[rank.soulbindID].amount += 1;
          } else {
            covenants[rank.covenantID].soulbinds[rank.soulbindID] = { id: rank.soulbindID, amount: 1 };
          }
        }

        if (!rank.name.match(combatantName)) {
          if (this.props.duration > rank.duration * (1 - this.durationVariancePercentage) && this.props.duration < rank.duration * (1 + this.durationVariancePercentage)) {
            similiarKillTimes.push({ rank, variance: rank.duration - this.props.duration > 0 ? rank.duration - this.props.duration : this.props.duration - rank.duration });
          }
          closestKillTimes.push({ rank, variance: rank.duration - this.props.duration > 0 ? rank.duration - this.props.duration : this.props.duration - rank.duration });
        }
      });

      talentCounter.forEach(row => {
        const talentRow = row.reduce((prev, cur) => {
          prev[cur] = (prev[cur] || 0) + 1;
          return prev;
        }, {});
        talents.push(talentRow);
      });

      trinkets.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));

      legendaries.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));

      conduits.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));

      covenants.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));

      similiarKillTimes.sort((a, b) => a.variance - b.variance);

      closestKillTimes.sort((a, b) => a.variance - b.variance);

      this.setState({
        mostUsedTrinkets: trinkets.slice(0, this.SHOW_TOP_ENTRYS),
        mostUsedLegendaries: legendaries.slice(0, this.SHOW_TOP_ENTRYS),
        mostUsedConduits: conduits.slice(0, this.SHOW_TOP_ENTRYS),
        mostUsedCovenants: covenants,
        mostUsedTalents: talents,
        similiarKillTimes: similiarKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
        closestKillTimes: closestKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
        loaded: true,
      });

      //fetch all missing icons from bnet-api and display them
      this.fillMissingIcons();

    }).catch(() => {
      this.setState({
        message: <Trans id="interface.report.results.encounterStats.eeek">Something went wrong.</Trans>,
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
          .catch(() => {
            // ignore errors;
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
            {formatPercentage(item.amount / this.amountOfParses, 0)}%
          </div>
          <div className="col-md-10">
            <ItemLink id={item.id} className={item.quality} details={item} icon={false}>
              <Icon
                icon={this.state.items[item.id] === undefined ? this.state.items[0].icon : this.state.items[item.id].icon}
                className={item.quality}
                details={item}

                style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
              />
              {item.name}
            </ItemLink>
          </div>
        </div>
      </div>
    );
  }

  singleSpell(spell) {
    return (
      <div key={spell.id} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row">
          <div className="col-md-2" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}>
            {formatPercentage(spell.amount / this.amountOfParses, 0)}%
          </div>
          <div className="col-md-10">
            <SpellLink id={spell.id} icon={false}>
              <Icon
                icon={this.state.spells[spell.id] === undefined ? this.state.spells[1].icon : this.state.spells[spell.id].icon}
                style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
              />
              {spell.name}
            </SpellLink>
          </div>
        </div>
      </div>
    );
  }

  singleLog(log) {
    return (
      <div key={`${log.reportID}-${log.name}`} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
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
            {formatThousands(log.total)} {this.metric}
          </div>
        </div>
      </div>
    );
  }

  renderCovenant(covenantID, amount, soulbinds) {
    const covenant = getCovenantById(covenantID);
    soulbinds.sort((a, b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));
    return (
      <div key={`${covenant.id}-${covenant.name}`} className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }}>
        <div className="row">
          <div className="col-md-2" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}>
            {formatPercentage(amount / this.amountOfParses, 0)}%
          </div>
          <SpellLink id={covenant.spellID} icon={false}>
            <Icon
              icon={this.state.spells[covenant.spellID] === undefined ? this.state.spells[1].icon : this.state.spells[covenant.spellID].icon}
              style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
            />
            {covenant.name}
          </SpellLink>
        </div>
        <div>
          {soulbinds.map(soulbind => (
            <div key={soulbind.id} style={{ textAlign: 'left', marginLeft: '4em' }}>
              {`${SOULBINDS[soulbind.id].name}: ${formatPercentage(soulbind.amount / amount, 0)}%`}
            </div>
          ))}
        </div>
      </div>
    );
  }

  get similiarLogs() {
    return (
      <div className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }} key='similiar-wcl-logs'>
        {this.state.similiarKillTimes.length > 1 ? 'These are' : 'This is'} {this.state.similiarKillTimes.length} of the top {this.amountOfParses} {this.state.similiarKillTimes.length > 1 ? 'logs' : 'log'} that {this.state.similiarKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time within {formatPercentage(this.durationVariancePercentage, 0)}% variance.
        {this.state.similiarKillTimes.map(log => this.singleLog(log.rank))}
      </div>
    );
  }

  get closestLogs() {
    return (
      <div className="col-md-12 flex-main" style={{ textAlign: 'left', margin: '5px auto' }} key='closest-wcl-logs'>
        {this.state.closestKillTimes.length > 1 ? 'These are' : 'This is'} {this.state.closestKillTimes.length} of the top {this.amountOfParses} {this.state.closestKillTimes.length > 1 ? 'logs' : 'log'} that {this.state.closestKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time. Large differences won't be good for comparing.
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
    this.amountOfParses = Object.values(this.state.mostUsedTalents[LEVEL_15_TALENT_ROW_INDEX]).reduce((total, parses) => total + parses, 0);
    return (
      <>
        <h1>Statistics for this fight using the top {this.amountOfParses} logs, ranked by {this.metric.toLocaleUpperCase()}</h1>

        <div className="row">
          <div className="col-md-12" style={{ padding: '0 30px' }}>
            <div className="row">
              <div className="col-md-4">
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>Most used Trinkets</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.mostUsedTrinkets.map(trinket => this.singleItem(trinket))}
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>Most used Talents</h2>
                  </div>
                </div>
                {this.state.mostUsedTalents.map((row, index) => (
                  <div key={index} className="row" style={{ marginBottom: 15, paddingLeft: 20 }}>
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
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>Most used Legendaries</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  {this.state.mostUsedLegendaries.map(legendary => this.singleSpell(legendary))}
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>Most used Conduits</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  {this.state.mostUsedConduits.map(conduit => this.singleSpell(conduit))}
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>Most used Covenants</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                  {this.state.mostUsedCovenants.map(covenant => this.renderCovenant(covenant.id, covenant.amount, covenant.soulbinds))}
                </div>
              </div>
              <div className="col-md-4">
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>{this.state.similiarKillTimes.length > 0 ? 'Similiar' : 'Closest'} kill times</h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.similiarKillTimes.length > 0 ? this.similiarLogs : ''}
                  {this.state.similiarKillTimes.length === 0 && this.state.closestKillTimes.length > 0 ? this.closestLogs : ''}
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
