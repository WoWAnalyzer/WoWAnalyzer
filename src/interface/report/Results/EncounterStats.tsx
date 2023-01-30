import { Trans } from '@lingui/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { isRetailExpansion } from 'game/Expansion';
import ROLES from 'game/ROLES';
import { ItemLink } from 'interface';
import ActivityIndicator from 'interface/ActivityIndicator';
import Icon from 'interface/Icon';
import Combatant from 'parser/core/Combatant';
import { PureComponent, ReactNode } from 'react';
import Config from 'parser/Config';
import { WCLRanking, WCLRankingGear, WCLRankingsResponse } from 'common/WCL_TYPES';
import getItemQualityFromLabel from 'common/getItemQualityFromLabel';
import AlertWarning from 'interface/AlertWarning';

interface WCLRankingGearWithAmount extends WCLRankingGear {
  amount: number;
}

interface KillTime {
  rank: WCLRanking;
  variance: number;
}

interface Props {
  config: Config;
  currentBoss: number;
  difficulty: number;
  duration: number;
  combatant: Combatant;
}

// TODO: Figure out new talents
interface State {
  // mostUsedTalents: WCLRankingTalent[];
  mostUsedTrinkets: WCLRankingGearWithAmount[];
  similiarKillTimes: KillTime[];
  closestKillTimes: KillTime[];
  rankingsCount: number;
  items: typeof ITEMS;
  spells: typeof SPELLS;
  loaded: boolean;
  message: ReactNode;
}

/**
 * Show statistics (talents and trinkets) for the current boss, specID and difficulty
 */
class EncounterStats extends PureComponent<Props, State> {
  LIMIT = 100; //Currently does nothing but if Kihra reimplements it'd be nice to have
  SHOW_TOP_ENTRYS = 6;
  SHOW_CLOSEST_KILL_TIME_LOGS = 10;
  metric: 'dps' | 'hps' = 'dps';
  amountOfParses = 0;
  durationVariancePercentage = 0.2; //Marked in % to allow for similiar filtering on long/short fights

  constructor(props: Props) {
    super(props);
    this.state = {
      // TODO: Figure out new talents
      // mostUsedTalents: [],
      mostUsedTrinkets: [],
      similiarKillTimes: [],
      closestKillTimes: [],
      rankingsCount: 0,
      items: ITEMS,
      spells: SPELLS,
      loaded: false,
      message: 'Loading statistics...',
    };

    this.load = this.load.bind(this);
    this.load();
  }

  addItem(array: WCLRankingGearWithAmount[], item: WCLRankingGear) {
    //add item to array or increase amount by one if it exists
    if (item.id === null || item.id === 0) {
      return array;
    }
    const index = array.findIndex((elem) => elem.id === item.id);
    if (index === -1) {
      array.push({
        id: item.id,
        name: item.name.replace(/\\'/g, "'"),
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
    switch (this.props.config.spec?.role) {
      case ROLES.HEALER:
        this.metric = 'hps';
        break;

      default:
        this.metric = 'dps';
        break;
    }

    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
    ); // current calendar-week

    return fetchWcl<WCLRankingsResponse>(`rankings/encounter/${this.props.currentBoss}`, {
      class: this.props.config.spec.ranking.class,
      spec: this.props.config.spec.ranking.spec,
      difficulty: this.props.difficulty,
      limit: this.LIMIT, //Currently does nothing but if Kihra reimplements it'd be nice to have
      metric: this.metric,
      cache: currentWeek, // cache for a week
      includeCombatantInfo: true,
    })
      .then((stats) => {
        // TODO: Figure out new talents
        // const talentCounter = [[], [], [], [], [], [], []];
        // const talents: WCLRankingTalent[] = [];
        let trinkets: WCLRankingGearWithAmount[] = [];
        const similiarKillTimes: KillTime[] = []; // These are the reports within the defined variance of the analyzed log
        const closestKillTimes: KillTime[] = []; // These are the reports closest to the analyzed log regardless of it being within variance or not
        const combatantName = this.props.combatant._combatantInfo.name;

        stats.rankings.forEach((rank) => {
          // TODO: Figure out new talents
          // rank.talents.forEach((talent, index) => {
          //   if (talent.id !== null && talent.id !== 0) {
          //     talentCounter[index].push(talent.id);
          //   }
          // });

          rank.gear.forEach((item, itemSlot) => {
            if (itemSlot === 12 || itemSlot === 13) {
              trinkets = this.addItem(trinkets, item);
            }
          });

          if (!rank.name.match(combatantName)) {
            if (
              this.props.duration > rank.duration * (1 - this.durationVariancePercentage) &&
              this.props.duration < rank.duration * (1 + this.durationVariancePercentage)
            ) {
              similiarKillTimes.push({
                rank,
                variance:
                  rank.duration - this.props.duration > 0
                    ? rank.duration - this.props.duration
                    : this.props.duration - rank.duration,
              });
            }
            closestKillTimes.push({
              rank,
              variance:
                rank.duration - this.props.duration > 0
                  ? rank.duration - this.props.duration
                  : this.props.duration - rank.duration,
            });
          }
        });

        // TODO: Figure out new talents
        // talentCounter.forEach((row) => {
        //   const talentRow = row.reduce((prev, cur) => {
        //     prev[cur] = (prev[cur] || 0) + 1;
        //     return prev;
        //   }, {});
        //   talents.push(talentRow);
        // });

        trinkets.sort((a, b) => (a.amount < b.amount ? 1 : b.amount < a.amount ? -1 : 0));

        similiarKillTimes.sort((a, b) => a.variance - b.variance);

        closestKillTimes.sort((a, b) => a.variance - b.variance);

        this.setState({
          // TODO: Figure out new talents
          // mostUsedTalents: talents,
          mostUsedTrinkets: trinkets.slice(0, this.SHOW_TOP_ENTRYS),
          similiarKillTimes: similiarKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
          closestKillTimes: closestKillTimes.slice(0, this.SHOW_CLOSEST_KILL_TIME_LOGS),
          loaded: true,
          rankingsCount: stats.rankings.length,
        });
      })
      .catch(() => {
        this.setState({
          message: (
            <Trans id="interface.report.results.encounterStats.eeek">Something went wrong.</Trans>
          ),
        });
      });
  }

  singleItem(item: WCLRankingGearWithAmount) {
    return (
      <div
        key={item.id}
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
      >
        <div className="row">
          <div
            className="col-md-2"
            style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}
          >
            {formatPercentage(item.amount / this.amountOfParses, 0)}%
          </div>
          <div className="col-md-10">
            <ItemLink
              id={item.id}
              className={item.quality}
              details={{
                itemLevel: Number(item.itemLevel),
                quality: getItemQualityFromLabel(item.quality),
              }}
              icon={false}
            >
              <Icon
                icon={item.icon}
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

  singleLog(log: WCLRanking) {
    return (
      <div
        key={`${log.reportID}-${log.name}`}
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
      >
        <div className="row" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em' }}>
          <div className="flex-column col-md-6">
            <a
              href={`https://wowanalyzer.com/report/${log.reportID}/${log.fightID}/${log.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                {log.name} ({log.itemLevel})
              </div>
            </a>
            <div>
              {formatDuration(log.duration)} (
              {log.duration > this.props.duration
                ? ((log.duration - this.props.duration) / 1000).toFixed(1) + 's slower'
                : ((this.props.duration - log.duration) / 1000).toFixed(1) + 's faster'}
              )
            </div>
          </div>
          <div className="col-md-6">
            {formatThousands(log.total)} {this.metric}
          </div>
        </div>
      </div>
    );
  }

  get similiarLogs() {
    return (
      <div
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
        key="similiar-wcl-logs"
      >
        {this.state.similiarKillTimes.length > 1 ? 'These are' : 'This is'}{' '}
        {this.state.similiarKillTimes.length} of the top {this.amountOfParses}{' '}
        {this.state.similiarKillTimes.length > 1 ? 'logs' : 'log'} that{' '}
        {this.state.similiarKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time within{' '}
        {formatPercentage(this.durationVariancePercentage, 0)}% variance.
        {this.state.similiarKillTimes.map((log) => this.singleLog(log.rank))}
      </div>
    );
  }

  get closestLogs() {
    return (
      <div
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
        key="closest-wcl-logs"
      >
        {this.state.closestKillTimes.length > 1 ? 'These are' : 'This is'}{' '}
        {this.state.closestKillTimes.length} of the top {this.amountOfParses}{' '}
        {this.state.closestKillTimes.length > 1 ? 'logs' : 'log'} that{' '}
        {this.state.closestKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time. Large
        differences won't be good for comparing.
        {this.state.closestKillTimes.map((log) => this.singleLog(log.rank))}
      </div>
    );
  }

  render() {
    // TODO: Figure out new talents
    // const rows = [15, 30, 45, 60, 75, 90, 100];
    if (!this.state.loaded) {
      return (
        <div
          className="panel-heading"
          style={{ marginTop: 40, padding: 20, boxShadow: 'none', borderBottom: 0 }}
        >
          <ActivityIndicator text={this.state.message} />
        </div>
      );
    }
    // If there are below 100 parses for a given spec, use this amount to divide with to get accurate percentages.
    // This also enables us to work around certain logs being anonymised - as this will then ignore those, and cause us to divide by 99, making our percentages accurate again.
    this.amountOfParses = this.state.rankingsCount;

    // HACK: don't want to convert to ts, so this flags retail as Shadowlands or later.
    const isRetail = isRetailExpansion(this.props.config.expansion);
    return (
      <>
        <h1>
          Statistics for this fight using the top {this.amountOfParses} logs, ranked by{' '}
          {this.metric.toLocaleUpperCase()}
        </h1>

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
                  {this.state.mostUsedTrinkets.map((trinket) => this.singleItem(trinket))}
                </div>
                {isRetail && (
                  <>
                    <div className="row" style={{ marginBottom: '1em' }}>
                      <div className="col-md-12">
                        <h2>Most used Talents</h2>
                      </div>
                    </div>
                    <AlertWarning>
                      Due to the talent rework and continuing work as part of the Dragonflight
                      launch, this section is still under construction.
                    </AlertWarning>
                    {/* TODO: Figure out new talents */}
                    {/*{this.state.mostUsedTalents.map((row, index) => (*/}
                    {/*  <div*/}
                    {/*    key={index}*/}
                    {/*    className="row"*/}
                    {/*    style={{ marginBottom: 15, paddingLeft: 20 }}*/}
                    {/*   >*/}
                    {/*     <div*/}
                    {/*       className="col-lg-1 col-xs-2"*/}
                    {/*      style={{ lineHeight: '3em', textAlign: 'right' }}*/}
                    {/*    >*/}
                    {/*      {rows[index]}*/}
                    {/*    </div>*/}
                    {/*    {(Object.keys(row) as Array<keyof typeof row>)*/}
                    {/*      .sort((a, b) => row[b] - row[a])*/}
                    {/*      .map((talent, talentIndex) => (*/}
                    {/*         <div*/}
                    {/*           key={talentIndex}*/}
                    {/*          className="col-lg-3 col-xs-4"*/}
                    {/*           style={{ textAlign: 'center' }}*/}
                    {/*         >*/}
                    {/*           <SpellLink id={Number(talent)} icon={false}>*/}
                    {/*            <SpellIcon*/}
                    {/*              style={{ width: '3em', height: '3em' }}*/}
                    {/*              id={Number(talent)}*/}
                    {/*              noLink*/}
                    {/*             />*/}
                    {/*           </SpellLink>*/}
                    {/*           <span style={{ textAlign: 'center', display: 'block' }}>*/}
                    {/*             {formatPercentage(row[talent] / this.amountOfParses, 0)}%*/}
                    {/*           </span>*/}
                    {/*         </div>*/}
                    {/*       ))}*/}
                    {/*   </div>*/}
                    {/* ))}*/}
                  </>
                )}
              </div>
              <div className="col-md-4">
                <div className="row" style={{ marginBottom: '1em' }}>
                  <div className="col-md-12">
                    <h2>
                      {this.state.similiarKillTimes.length > 0 ? 'Similiar' : 'Closest'} kill times{' '}
                    </h2>
                  </div>
                </div>
                <div className="row" style={{ marginBottom: '2em' }}>
                  {this.state.similiarKillTimes.length > 0 ? this.similiarLogs : ''}
                  {this.state.similiarKillTimes.length === 0 &&
                  this.state.closestKillTimes.length > 0
                    ? this.closestLogs
                    : ''}
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
